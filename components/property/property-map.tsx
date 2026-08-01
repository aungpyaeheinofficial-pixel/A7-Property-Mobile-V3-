"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import type { Property } from "@/lib/properties";
import { formatCompactPrice } from "@/lib/properties";
import { cn } from "@/lib/utils";

interface PropertyMapProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  compact?: boolean;
  markerLabel?: (property: Property) => string;
}

type LeafletModule = typeof import("leaflet");
type ReactLeafletModule = typeof import("react-leaflet");

let leafletPromise: Promise<{ L: LeafletModule; RL: ReactLeafletModule }> | null = null;

function loadLeaflet() {
  if (!leafletPromise) {
    leafletPromise = Promise.all([
      import("leaflet"),
      import("react-leaflet"),
    ]).then(([L, RL]) => {
      L.default.Marker.prototype.options.icon = L.default.divIcon({ className: "" });
      return { L: L.default, RL } as { L: LeafletModule; RL: ReactLeafletModule };
    });
  }
  return leafletPromise;
}

function makePriceIcon(L: LeafletModule, label: string, selected: boolean) {
  const bg = selected ? "#2A2A33" : "#006AFF";
  const html = `<div style="background:${bg};color:#fff;border:2px solid #fff;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:700;font-family:inherit;white-space:nowrap;box-shadow:0 3px 12px rgba(42,42,51,.25)">${label}</div>`;
  return L.divIcon({ html, className: "a7-price-marker", iconSize: [0, 0], iconAnchor: [0, 0] });
}

function makeSingleIcon(L: LeafletModule) {
  const html = `<div style="filter:drop-shadow(0 4px 10px rgba(0,106,255,.35))"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#006AFF" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg></div>`;
  return L.divIcon({ html, className: "a7-single-marker", iconSize: [36, 36], iconAnchor: [18, 36] });
}

function FitBounds({ L, RL, properties, selectedId }: { L: LeafletModule; RL: ReactLeafletModule; properties: Property[]; selectedId?: string | null }) {
  const map = RL.useMap();

  useEffect(() => {
    if (properties.length === 0) return;
    if (properties.length === 1) {
      map.setView([properties[0].lat, properties[0].lng], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng] as [number, number]));
    if (selectedId) {
      const sel = properties.find((p) => p.id === selectedId);
      if (sel) {
        map.flyTo([sel.lat, sel.lng], 15, { duration: 0.5 });
        return;
      }
    }
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [properties, selectedId, map, L]);

  return null;
}

function PropertyMap({ properties, selectedId, onSelect, className, compact = false, markerLabel }: PropertyMapProps) {
  const { isMyanmar } = useLanguage();
  const [modules, setModules] = useState<{ L: LeafletModule; RL: ReactLeafletModule } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    loadLeaflet().then((mods) => { if (active) setModules(mods); });
    return () => { active = false; };
  }, []);

  const isSingle = properties.length === 1;
  const priceLang = isMyanmar ? "my" : "en";

  const markers = useMemo(
    () =>
      properties.slice(0, isSingle ? 1 : 80).map((property) => {
        const selected = property.id === selectedId;
        const priceLabel = markerLabel?.(property) ?? formatCompactPrice(property, priceLang);
        return { property, selected, priceLabel };
      }),
    [properties, selectedId, isSingle, markerLabel, priceLang],
  );

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[22px] border border-[#2A2A33]/10 bg-[#F1F6FF]",
        compact ? "min-h-[300px]" : "min-h-[420px]",
        className,
      )}
      aria-label="Property map"
      ref={containerRef}
    >
      {modules ? (
        <modules.RL.MapContainer
          center={[16.8409, 96.1735]}
          zoom={12}
          scrollWheelZoom
          className="absolute inset-0 z-0 h-full w-full"
          style={{ background: "#F1F6FF" }}
        >
          <modules.RL.TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {markers.map(({ property, selected, priceLabel }) => (
            <modules.RL.Marker
              key={property.id}
              position={[property.lat, property.lng]}
              icon={isSingle ? makeSingleIcon(modules.L) : makePriceIcon(modules.L, priceLabel, selected)}
              zIndexOffset={selected ? 1000 : 0}
              eventHandlers={{ click: () => onSelect?.(property.id) }}
            >
              <modules.RL.Popup>
                <div className="min-w-[180px]">
                  <strong className="block text-xs font-semibold leading-snug">{property.title}</strong>
                  <span className="mt-1 block text-[10px] text-gray-500">{property.township}, {property.city}</span>
                  <span className="mt-1.5 block text-xs font-bold text-[#006AFF]">{priceLabel}{property.purpose === "rent" ? "/mo" : ""}</span>
                </div>
              </modules.RL.Popup>
            </modules.RL.Marker>
          ))}
          <FitBounds L={modules.L} RL={modules.RL} properties={markers.map((m) => m.property)} selectedId={selectedId} />
        </modules.RL.MapContainer>
      ) : (
        <div className="flex h-full min-h-[420px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#59616A]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#006AFF] border-t-transparent" />
            <span className="text-xs font-medium">Loading map…</span>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute right-4 top-4 z-[500] flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-medium text-[#59616A] shadow-sm backdrop-blur">
        <Navigation className="size-3.5 text-[#006AFF]" /> Live map
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex max-w-[250px] items-start gap-2 rounded-xl border border-white/80 bg-white/90 p-3 text-[9px] leading-4 text-[#59616A] shadow-sm backdrop-blur">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#006AFF]" /> Exact addresses remain private until an owner confirms your inquiry.
      </div>
    </section>
  );
}

export { PropertyMap };
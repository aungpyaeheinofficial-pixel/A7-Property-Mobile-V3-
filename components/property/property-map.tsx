"use client";

import { MapPin, Navigation } from "lucide-react";

import { formatCompactPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

interface PropertyMapProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

const markerPositions = [
  [18, 24], [42, 18], [70, 28], [28, 53], [58, 48], [82, 61], [43, 76], [14, 72], [72, 82], [89, 38],
];

function PropertyMap({ properties, selectedId, onSelect, className, compact = false }: PropertyMapProps) {
  return (
    <section
      className={cn(
        "relative isolate min-h-[420px] overflow-hidden rounded-[22px] border border-[#123c33]/10 bg-[#e7ece6]",
        "[background-image:linear-gradient(28deg,transparent_45%,rgba(255,255,255,.85)_46%,rgba(255,255,255,.85)_50%,transparent_51%),linear-gradient(110deg,transparent_35%,rgba(255,255,255,.7)_36%,rgba(255,255,255,.7)_40%,transparent_41%),linear-gradient(160deg,transparent_64%,rgba(255,255,255,.72)_65%,rgba(255,255,255,.72)_69%,transparent_70%)]",
        compact && "min-h-[300px]",
        className,
      )}
      aria-label="Property map"
    >
      <div className="absolute left-[8%] top-[12%] h-[32%] w-[26%] rounded-[40%] bg-[#c9ddcf]/70" />
      <div className="absolute bottom-[7%] right-[9%] h-[25%] w-[31%] rounded-[45%] bg-[#c9ddcf]/70" />
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-medium text-[#58615d] shadow-sm backdrop-blur">
        <Navigation className="size-3.5 text-[#236457]" /> Map preview
      </div>
      {properties.slice(0, 10).map((property, index) => {
        const [left, top] = markerPositions[index];
        const selected = property.id === selectedId;
        return (
          <button
            key={property.id}
            type="button"
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white px-2.5 py-1.5 text-[10px] font-bold shadow-[0_5px_18px_rgba(18,33,30,.2)] transition-transform hover:z-20 hover:scale-110 focus-visible:z-30",
              selected ? "scale-110 bg-[#b7653d] text-white" : "bg-[#194e42] text-white",
            )}
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={() => onSelect?.(property.id)}
            aria-label={`${property.title}, ${formatCompactPrice(property)} ${property.currency}`}
            aria-pressed={selected}
          >
            {formatCompactPrice(property)}
          </button>
        );
      })}
      <div className="absolute bottom-4 left-4 z-20 flex max-w-[250px] items-start gap-2 rounded-xl border border-white/80 bg-white/90 p-3 text-[9px] leading-4 text-[#58615d] shadow-sm backdrop-blur">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#236457]" /> Exact addresses remain private until an owner confirms your inquiry.
      </div>
    </section>
  );
}

export { PropertyMap };

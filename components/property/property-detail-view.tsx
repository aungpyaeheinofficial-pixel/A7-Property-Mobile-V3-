"use client";

import { Bath, BedDouble, Building2, CalendarDays, CarFront, Check, ChevronRight, Heart, MapPin, Maximize2, MessageCircle, School, ShieldCheck, ShoppingBasket, Sofa, TrainFront, Waves } from "lucide-react";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { InquirySheet, type InquiryMode } from "@/components/property/inquiry-sheet";
import { OwnerCard } from "@/components/property/owner-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyMap } from "@/components/property/property-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPropertyPrice, furnitureLabels, type Property } from "@/lib/properties";

function PropertyDetailView({ property }: { property: Property }) {
  const [favorite, setFavorite] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("contact");

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem("eain-saved-homes") ?? "[]") as string[];
    const recent = JSON.parse(window.localStorage.getItem("eain-recent-properties") ?? "[]") as string[];
    queueMicrotask(() => setFavorite(saved.includes(property.id)));
    window.localStorage.setItem("eain-recent-properties", JSON.stringify([property.id, ...recent.filter((id) => id !== property.id)].slice(0, 12)));
  }, [property.id]);

  function toggleFavorite() {
    const saved = JSON.parse(window.localStorage.getItem("eain-saved-homes") ?? "[]") as string[];
    const next = favorite ? saved.filter((id) => id !== property.id) : [...saved, property.id];
    window.localStorage.setItem("eain-saved-homes", JSON.stringify(next));
    setFavorite(!favorite);
  }

  function openInquiry(mode: InquiryMode) {
    setInquiryMode(mode);
    setInquiryOpen(true);
  }

  const detailFacts = [
    { label: "Bedrooms", value: property.bedrooms, icon: BedDouble },
    { label: "Bathrooms", value: property.bathrooms, icon: Bath },
    { label: "Living area", value: `${new Intl.NumberFormat("en-US").format(property.area_sqft)} sqft`, icon: Maximize2 },
    { label: "Floor", value: property.floor ? `${property.floor}th floor` : "Ground property", icon: Building2 },
  ];
  const nearby = [
    { name: "International school", detail: "8 min drive", icon: School },
    { name: "Neighbourhood market", detail: "6 min walk", icon: ShoppingBasket },
    { name: "Main bus connection", detail: "4 min walk", icon: TrainFront },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f3] pb-24 lg:pb-0">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav className="mb-5 flex items-center gap-1.5 overflow-hidden text-[10px] text-[#7b837f]" aria-label="Breadcrumb"><a href="/search">Search</a><ChevronRight className="size-3" /><a href={`/search?location=${property.township}`}>{property.township}</a><ChevronRight className="size-3" /><span className="truncate text-[#17211e]">{property.title}</span></nav>
        <PropertyGallery images={property.images} title={property.title} />

        <div className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            <section className="border-b border-[#123c33]/10 pb-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="bg-[#ddece7] text-[#194e42]"><ShieldCheck className="size-3.5" />Verified home</Badge><Badge className="bg-[#f3ebdd] text-[#805b3f]">For {property.purpose === "rent" ? "rent" : "sale"}</Badge></div>
                  <h1 className="max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">{property.title}</h1>
                  <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-[#58615d]"><MapPin className="mt-0.5 size-4 shrink-0 text-[#236457]" />{property.address}</p>
                </div>
                <Button size="icon" variant="outline" onClick={toggleFavorite} aria-label={favorite ? "Remove from saved homes" : "Save property"} aria-pressed={favorite}><Heart className={`size-[19px] ${favorite ? "fill-[#b7653d] text-[#b7653d]" : ""}`} /></Button>
              </div>
              <div className="mt-6"><strong className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{formatPropertyPrice(property)}</strong><span className="ml-2 text-xs text-[#7b837f]">{property.purpose === "rent" ? "per month" : "total price"}</span></div>
            </section>

            <section className="grid grid-cols-2 gap-3 border-b border-[#123c33]/10 py-7 sm:grid-cols-4">
              {detailFacts.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#123c33]/8 bg-white p-4"><Icon className="size-5 text-[#236457]" /><strong className="mt-4 block text-sm">{value}</strong><span className="mt-1 block text-[10px] text-[#7b837f]">{label}</span></div>)}
            </section>

            <section className="border-b border-[#123c33]/10 py-8"><h2 className="text-xl font-semibold tracking-[-0.03em]">About this home</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-[#58615d]">{property.description} The listing has been reviewed for pricing clarity, recent photos, and contact availability. Viewing times can be requested directly through Eain.</p><div className="mt-5 flex flex-wrap gap-2"><Badge className="bg-[#eff7f4] text-[#236457]"><Sofa className="size-3.5" />{furnitureLabels[property.furniture]}</Badge><Badge className="bg-[#eff7f4] text-[#236457]"><CalendarDays className="size-3.5" />Built {property.year_built}</Badge></div></section>

            <section className="border-b border-[#123c33]/10 py-8"><h2 className="text-xl font-semibold tracking-[-0.03em]">Amenities</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{property.amenities.map((amenity) => <div key={amenity} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs font-medium"><span className="grid size-8 place-items-center rounded-lg bg-[#eff7f4] text-[#236457]">{amenity.toLowerCase().includes("parking") ? <CarFront className="size-4" /> : amenity.toLowerCase().includes("pool") ? <Waves className="size-4" /> : <Check className="size-4" />}</span>{amenity}</div>)}</div></section>

            <section className="py-8"><h2 className="text-xl font-semibold tracking-[-0.03em]">Location and nearby</h2><p className="mt-2 text-xs text-[#58615d]">A well-connected part of {property.township}, with daily essentials close by.</p><PropertyMap className="mt-5" properties={[property]} selectedId={property.id} compact /><div className="mt-4 grid gap-3 sm:grid-cols-3">{nearby.map(({ name, detail, icon: Icon }) => <Card key={name} className="rounded-2xl border-[#123c33]/8"><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-xl bg-[#f3ebdd] text-[#805b3f]"><Icon className="size-[18px]" /></span><span><strong className="block text-[11px]">{name}</strong><small className="mt-1 block text-[9px] text-[#7b837f]">{detail}</small></span></CardContent></Card>)}</div></section>
          </div>

          <aside className="hidden lg:block"><div className="sticky top-[96px]"><OwnerCard owner={property.owner} onContact={() => openInquiry("contact")} onSchedule={() => openInquiry("schedule")} /></div></aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#123c33]/10 bg-white/95 p-3 backdrop-blur-xl lg:hidden"><div className="grid grid-cols-2 gap-2"><Button onClick={() => openInquiry("contact")}><MessageCircle className="size-4" />Contact owner</Button><Button variant="outline" onClick={() => openInquiry("schedule")}><CalendarDays className="size-4" />Schedule</Button></div></div>
      <InquirySheet open={inquiryOpen} onOpenChange={setInquiryOpen} mode={inquiryMode} property={property} />
    </div>
  );
}

export { PropertyDetailView };

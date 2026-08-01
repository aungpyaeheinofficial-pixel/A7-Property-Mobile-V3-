"use client";

import { Bath, BedDouble, Building2, CalendarDays, CarFront, Check, ChevronRight, Clock3, Heart, MapPin, Maximize2, MessageCircle, School, Share2, ShieldCheck, ShoppingBasket, Sofa, TrainFront, Waves } from "lucide-react";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { InquirySheet, type InquiryMode } from "@/components/property/inquiry-sheet";
import { OwnerCard } from "@/components/property/owner-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyMap } from "@/components/property/property-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { formatPropertyPrice, furnitureLabels, type Property } from "@/lib/properties";

function PropertyDetailView({ property }: { property: Property }) {
  const { isMyanmar } = useLanguage();
  const [favorite, setFavorite] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("contact");
  const [shareNotice, setShareNotice] = useState("");

  useEffect(() => {
    const saved = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    const recent = readStoredIds(STORAGE_KEYS.recent, STORAGE_KEYS.legacyRecent, mockUser.recentlyViewedIds);
    queueMicrotask(() => setFavorite(saved.includes(property.id)));
    writeStoredIds(STORAGE_KEYS.recent, [property.id, ...recent.filter((id) => id !== property.id)].slice(0, 12));
  }, [property.id]);

  function toggleFavorite() {
    const saved = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    const next = favorite ? saved.filter((id) => id !== property.id) : [...saved, property.id];
    writeStoredIds(STORAGE_KEYS.saved, next);
    setFavorite(!favorite);
  }

  function openInquiry(mode: InquiryMode) {
    setInquiryMode(mode);
    setInquiryOpen(true);
  }

  async function shareProperty() {
    const shareData = { title: property.title, text: `${property.title} in ${property.township}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareNotice("Link copied");
        window.setTimeout(() => setShareNotice(""), 1800);
      }
    } catch {
      // Native share sheets can be dismissed without changing the page.
    }
  }

  const detailFacts = [
    { label: "Bedrooms", value: property.bedrooms, icon: BedDouble },
    { label: "Bathrooms", value: property.bathrooms, icon: Bath },
    { label: "Living area", value: `${new Intl.NumberFormat("en-US").format(property.area_sqft)} sqft`, icon: Maximize2 },
    { label: "Floor", value: property.floor ? `${property.floor}${property.floor % 10 === 1 && property.floor % 100 !== 11 ? "st" : property.floor % 10 === 2 && property.floor % 100 !== 12 ? "nd" : property.floor % 10 === 3 && property.floor % 100 !== 13 ? "rd" : "th"} floor` : "Ground property", icon: Building2 },
  ];
  const nearby = [
    { name: "International school", detail: "8 min drive", icon: School },
    { name: "Neighbourhood market", detail: "6 min walk", icon: ShoppingBasket },
    { name: "Main bus connection", detail: "4 min walk", icon: TrainFront },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_85%_-5%,rgba(0,106,255,.075),transparent_26rem),#F5F7FB] pb-24 lg:pb-0">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav className="mb-5 flex items-center gap-1.5 overflow-hidden text-[11px] text-[#667486]" aria-label="Breadcrumb"><a href="/search">Search</a><ChevronRight className="size-3" /><a href={`/search?location=${property.township}`}>{property.township}</a><ChevronRight className="size-3" /><span className="truncate text-[#172B3F]">{property.title}</span></nav>
        <PropertyGallery images={property.images} title={property.title} />

        <div className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            <section className="border-b border-[#172B3F]/9 pb-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2"><Badge className={property.verification_status === "verified" ? "bg-[#EAF2FF] text-[#006AFF]" : "bg-[#FFF7E8] text-[#9A6500]"}><ShieldCheck className="size-3.5" />{property.verification_status === "verified" ? "A7 verified" : "Verification pending"}</Badge><Badge className="bg-[#F1F6FF] text-[#53606E]">For {property.purpose === "rent" ? "rent" : "sale"}</Badge></div>
                  <h1 className="max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#172B3F] sm:text-[42px]">{property.title}</h1>
                  <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-[#59616A]"><MapPin className="mt-0.5 size-4 shrink-0 text-[#006AFF]" />{property.address}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="icon" variant="outline" onClick={shareProperty} aria-label="Share property"><Share2 className="size-[18px]" /></Button>
                  <Button size="icon" variant="outline" onClick={toggleFavorite} aria-label={favorite ? "Remove from saved homes" : "Save property"} aria-pressed={favorite}><Heart className={`size-[19px] ${favorite ? "fill-[#006AFF] text-[#006AFF]" : ""}`} /></Button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><strong data-type="number" className="text-[28px] font-semibold tracking-[-0.045em] text-[#172B3F] sm:text-[34px]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")}</strong><span className="ml-2 text-xs text-[#667486]">{property.purpose === "rent" ? "per month" : "total price"}</span></div><div className="flex items-center gap-2 text-[11px] text-[#667486]"><Clock3 className="size-4 text-[#006AFF]" />Contact replies in about {property.owner.response_time_minutes} min</div></div>
              {shareNotice && <p className="mt-3 text-xs font-semibold text-[#287A4B]" role="status">{shareNotice}</p>}
            </section>

            <section className="grid grid-cols-2 gap-3 border-b border-[#172B3F]/9 py-7 sm:grid-cols-4">
              {detailFacts.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#172B3F]/8 bg-white p-4 shadow-[0_6px_18px_rgba(23,43,63,.05)]"><span className="grid size-9 place-items-center rounded-xl bg-[#EAF2FF] text-[#006AFF]"><Icon className="size-[18px]" /></span><strong className="mt-3 block text-sm text-[#172B3F]">{value}</strong><span className="mt-1 block text-[11px] text-[#667486]">{label}</span></div>)}
            </section>

            <section className="border-b border-[#2A2A33]/10 py-8"><h2 className="text-xl font-semibold tracking-[-0.03em]">About this home</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-[#59616A]">{property.description} The listing has been reviewed for pricing clarity, recent photos, and contact availability. Viewing times can be requested directly through A7 Property.</p><div className="mt-5 flex flex-wrap gap-2"><Badge className="bg-[#F6F8FC] text-[#006AFF]"><Sofa className="size-3.5" />{furnitureLabels[property.furniture]}</Badge><Badge className="bg-[#F6F8FC] text-[#006AFF]"><CalendarDays className="size-3.5" />Built {property.year_built}</Badge></div></section>

            <section className="border-b border-[#2A2A33]/10 py-8"><h2 className="text-xl font-semibold tracking-[-0.03em]">Amenities</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{property.amenities.map((amenity) => <div key={amenity} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs font-medium"><span className="grid size-8 place-items-center rounded-lg bg-[#F6F8FC] text-[#006AFF]">{amenity.toLowerCase().includes("parking") ? <CarFront className="size-4" /> : amenity.toLowerCase().includes("pool") ? <Waves className="size-4" /> : <Check className="size-4" />}</span>{amenity}</div>)}</div></section>

            <section className="py-8"><h2 className="text-xl font-semibold tracking-[-0.03em]">Location and nearby</h2><p className="mt-2 text-xs text-[#59616A]">A well-connected part of {property.township}, with daily essentials close by.</p><PropertyMap className="mt-5" properties={[property]} selectedId={property.id} compact /><div className="mt-4 grid gap-3 sm:grid-cols-3">{nearby.map(({ name, detail, icon: Icon }) => <Card key={name} className="rounded-2xl border-[#2A2A33]/8"><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-xl bg-[#F1F6FF] text-[#53606E]"><Icon className="size-[18px]" /></span><span><strong className="block text-[11px]">{name}</strong><small className="mt-1 block text-[9px] text-[#6B7078]">{detail}</small></span></CardContent></Card>)}</div></section>
          </div>

          <aside className="hidden lg:block"><div className="sticky top-[96px]"><OwnerCard owner={property.owner} onContact={() => openInquiry("contact")} onSchedule={() => openInquiry("schedule")} /></div></aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2A2A33]/10 bg-white/95 p-3 backdrop-blur-xl lg:hidden"><div className="grid grid-cols-2 gap-2"><Button onClick={() => openInquiry("contact")}><MessageCircle className="size-4" />Contact owner</Button><Button variant="outline" onClick={() => openInquiry("schedule")}><CalendarDays className="size-4" />Schedule</Button></div></div>
      <InquirySheet open={inquiryOpen} onOpenChange={setInquiryOpen} mode={inquiryMode} property={property} />
    </div>
  );
}

export { PropertyDetailView };

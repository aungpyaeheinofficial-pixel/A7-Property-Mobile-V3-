"use client";

import { AirVent, ArrowRight, Bath, BedDouble, Building2, Bus, CalendarDays, CarFront, Check, ChevronDown, ChevronUp, Clock3, Heart, Hospital, MapPin, Maximize2, MessageCircle, PanelsTopLeft, School, ShieldCheck, ShoppingBasket, Sofa, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { PropertyMap } from "@/components/property/property-map";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type Translate = (english: string, myanmar: string) => string;

function formatDetailPrice(property: Pick<Property, "price" | "currency">) {
  return `${new Intl.NumberFormat("en-US").format(property.price)} ${property.currency}`;
}

function PriceCard({ property, tx }: { property: Property; tx: Translate }) {
  return (
    <section className="rounded-[20px] border border-[#E7E2DB] bg-white p-5 shadow-[0_4px_20px_rgba(15,27,45,.07)] sm:p-6" aria-labelledby="property-price">
      <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#667085]">{property.purpose === "rent" ? tx("Monthly rent", "လစဉ်ငှားရမ်းခ") : tx("Total price", "စုစုပေါင်းဈေးနှုန်း")}</p>
      <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
        <h2 id="property-price" className="text-[30px] font-bold leading-none tracking-[-0.045em] text-[#0057D9] sm:text-[36px]">{formatDetailPrice(property)}</h2>
        <span className="pb-0.5 text-[11px] text-[#667085]">{property.purpose === "rent" ? tx("/ month", "/ လ") : tx("total price", "စုစုပေါင်း")}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center rounded-full bg-[#F0F5FF] px-3 text-[10px] font-semibold text-[#0057D9]">{tx("Negotiable", "ညှိနှိုင်းနိုင်")}</span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#F3F6F4] px-3 text-[10px] font-semibold text-[#3F6555]"><span className="size-1.5 rounded-full bg-[#3F8A68]" />{tx("Available now", "ယခုရရှိနိုင်")}</span>
      </div>
    </section>
  );
}

function FactsCard({ property, tx }: { property: Property; tx: Translate }) {
  const facts = [
    { label: tx("Beds", "အိပ်ခန်း"), value: property.bedrooms, icon: BedDouble },
    { label: tx("Baths", "ရေချိုးခန်း"), value: property.bathrooms, icon: Bath },
    { label: tx("Area", "အကျယ်"), value: `${new Intl.NumberFormat("en-US").format(property.area_sqft)} sqft`, icon: Maximize2 },
  ];
  return (
    <section className="grid grid-cols-3 divide-x divide-[#E9E5DE] rounded-[20px] border border-[#E7E2DB] bg-white px-2 py-4 shadow-[0_4px_20px_rgba(15,27,45,.06)]" aria-label={tx("Property facts", "အိမ်အချက်အလက်")}>
      {facts.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex min-w-0 flex-col items-center px-2 text-center">
          <Icon className="size-[19px] text-[#0057D9]" strokeWidth={1.8} />
          <strong className="mt-2 truncate text-[14px] font-semibold text-[#0F1B2D]">{value}</strong>
          <span className="mt-0.5 text-[9px] text-[#667085]">{label}</span>
        </div>
      ))}
    </section>
  );
}

function VerificationCard({ tx }: { tx: Translate }) {
  const checks = [
    tx("Owner identity checked", "ပိုင်ရှင်အထောက်အထား စစ်ပြီး"),
    tx("Property information reviewed", "အိမ်အချက်အလက် စစ်ဆေးပြီး"),
    tx("Photos verified", "ဓာတ်ပုံများ စစ်ဆေးပြီး"),
    tx("Updated recently", "မကြာသေးမီက ပြင်ဆင်ထား"),
  ];
  return (
    <section className="rounded-[20px] border border-[#B9D2F7] bg-[#F3F7FE] p-5" aria-labelledby="verification-title">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0057D9] text-white"><ShieldCheck className="size-5" /></span>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#0057D9]">A7 Property</p>
          <h2 id="verification-title" className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#0F1B2D]">{tx("A7 Verified Home", "A7 စိစစ်ထားသောအိမ်")}</h2>
          <p className="mt-1 text-[10px] leading-5 text-[#667085]">{tx("Key listing details have been independently reviewed for trust.", "ယုံကြည်စိတ်ချရရန် အဓိကအချက်အလက်များကို သီးခြားစစ်ဆေးထားသည်။")}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((item) => <div key={item} className="flex items-center gap-2 text-[11px] font-medium text-[#344054]"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[#0057D9]"><Check className="size-3" strokeWidth={2.5} /></span>{item}</div>)}
      </div>
    </section>
  );
}

function DescriptionSection({ property, tx }: { property: Property; tx: Translate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="border-b border-[#E7E2DB] py-7" aria-labelledby="about-home-title">
      <h2 id="about-home-title" className="text-[24px] font-semibold tracking-[-0.04em] text-[#0F1B2D]">{tx("About this home", "ဤအိမ်အကြောင်း")}</h2>
      <p className={cn("mt-3 text-[13px] leading-7 text-[#566273]", !expanded && "line-clamp-3")}>{property.description} {tx(`This ${property.bedrooms}-bedroom home is close to daily essentials and has been reviewed for clear pricing, recent photos, and reliable contact details.`, `ဤအိပ်ခန်း ${property.bedrooms} ခန်းပါအိမ်သည် နေ့စဉ်လိုအပ်ချက်များနှင့်နီးပြီး ဈေးနှုန်း၊ ဓာတ်ပုံနှင့် ဆက်သွယ်ရန်အချက်များကို စစ်ဆေးထားသည်။`)}</p>
      <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 inline-flex h-11 items-center gap-1 text-[11px] font-semibold text-[#0057D9]" aria-expanded={expanded}>{expanded ? tx("Show less", "အနည်းငယ်ပြရန်") : tx("Show more", "ပိုမိုပြရန်")}{expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
    </section>
  );
}

function amenityIcon(amenity: string) {
  const value = amenity.toLowerCase();
  if (value.includes("air")) return AirVent;
  if (value.includes("parking")) return CarFront;
  if (value.includes("lift") || value.includes("elevator")) return Building2;
  if (value.includes("security") || value.includes("reception")) return ShieldCheck;
  if (value.includes("furn") || value.includes("sofa")) return Sofa;
  if (value.includes("balcony")) return PanelsTopLeft;
  return Check;
}

function AmenitiesGrid({ property, tx }: { property: Property; tx: Translate }) {
  return (
    <section className="border-b border-[#E7E2DB] py-7" aria-labelledby="amenities-title">
      <h2 id="amenities-title" className="text-[24px] font-semibold tracking-[-0.04em] text-[#0F1B2D]">{tx("Amenities", "ဝန်ဆောင်မှုများ")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {property.amenities.slice(0, 8).map((amenity) => {
          const Icon = amenityIcon(amenity);
          return <div key={amenity} className="flex min-h-12 items-center gap-2.5 text-[11px] font-medium text-[#344054]"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F0F5FF] text-[#0057D9]"><Icon className="size-4" strokeWidth={1.8} /></span><span className="leading-4">{amenity}</span></div>;
        })}
      </div>
    </section>
  );
}

function LocationCard({ property, tx }: { property: Property; tx: Translate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="border-b border-[#E7E2DB] py-7" aria-labelledby="location-title">
      <div className="flex items-end justify-between gap-4">
        <div><h2 id="location-title" className="text-[24px] font-semibold tracking-[-0.04em] text-[#0F1B2D]">{tx("Location", "တည်နေရာ")}</h2><p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#667085]"><MapPin className="size-4 text-[#0057D9]" />{property.township}, {property.city}</p></div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="h-11 rounded-[14px] border border-[#C9D8ED] bg-white px-4 text-[10px] font-semibold text-[#0057D9]">{expanded ? tx("Close map", "မြေပုံပိတ်ရန်") : tx("View map", "မြေပုံကြည့်ရန်")}</button>
      </div>
      <div className={cn("mt-4 overflow-hidden rounded-[20px] transition-[height] duration-300", expanded ? "h-[360px]" : "h-[230px]")}>
        <PropertyMap properties={[property]} selectedId={property.id} compact showLiveLabel={false} showPrivacyNotice={false} className="h-full min-h-0 border-[#E4E7EC]" />
      </div>
      <p className="mt-3 flex items-start gap-2 text-[9px] leading-4 text-[#667085]"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#0057D9]" />{tx("The pin shows the approximate area. The exact address stays private until the owner confirms your viewing.", "မြေပုံသည် ခန့်မှန်းတည်နေရာသာ ပြထားသည်။ အိမ်ကြည့်ရန်အတည်ပြုပြီးမှ လိပ်စာအတိအကျကို မျှဝေမည်။")}</p>
    </section>
  );
}

function NearbyPlaces({ tx }: { tx: Translate }) {
  const places = [
    { label: tx("School", "ကျောင်း"), time: tx("5 min", "၅ မိနစ်"), icon: School },
    { label: tx("Hospital", "ဆေးရုံ"), time: tx("8 min", "၈ မိနစ်"), icon: Hospital },
    { label: tx("Market", "ဈေး"), time: tx("3 min", "၃ မိနစ်"), icon: ShoppingBasket },
    { label: tx("Bus stop", "ဘတ်စ်ကားမှတ်တိုင်"), time: tx("2 min", "၂ မိနစ်"), icon: Bus },
  ];
  return (
    <section className="border-b border-[#E7E2DB] py-7" aria-labelledby="nearby-title">
      <h2 id="nearby-title" className="text-[24px] font-semibold tracking-[-0.04em] text-[#0F1B2D]">{tx("Nearby", "အနီးအနား")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {places.map(({ label, time, icon: Icon }) => <div key={label} className="flex items-center gap-3 rounded-[16px] bg-white p-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F0F5FF] text-[#0057D9]"><Icon className="size-4" /></span><span className="min-w-0"><strong className="block truncate text-[11px] text-[#0F1B2D]">{label}</strong><small className="mt-0.5 block text-[9px] text-[#667085]">{time}</small></span></div>)}
      </div>
    </section>
  );
}

function AIAssistantCard({ property, tx }: { property: Property; tx: Translate }) {
  const questions = [
    tx("Is this suitable for a family?", "မိသားစုအတွက် သင့်တော်ပါသလား"),
    tx("Compare with similar homes", "ဆင်တူအိမ်များနှင့် နှိုင်းယှဉ်ပါ"),
    tx("Is this price reasonable?", "ဒီဈေးနှုန်း သင့်တော်ပါသလား"),
  ];
  return (
    <section className="my-7 rounded-[20px] border border-[#D8E3F2] bg-white p-5" aria-labelledby="a7-ai-title">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F0F5FF] text-[#0057D9]"><Sparkles className="size-[18px]" /></span>
        <div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#0057D9]">A7 Assistant</p><h2 id="a7-ai-title" className="mt-1 text-[19px] font-semibold tracking-[-0.03em] text-[#0F1B2D]">{tx("Ask A7 about this home", "ဤအိမ်အကြောင်း A7 ကိုမေးပါ")}</h2></div>
      </div>
      <div className="mt-4 grid gap-2">
        {questions.map((question) => <Link key={question} href={`/assistant?property=${property.id}&question=${encodeURIComponent(question)}`} className="flex min-h-11 items-center justify-between gap-3 rounded-[14px] bg-[#FAF8F5] px-3.5 text-[10px] font-medium text-[#344054]">{question}<ArrowRight className="size-4 shrink-0 text-[#0057D9]" /></Link>)}
      </div>
    </section>
  );
}

function SimilarProperties({ properties, tx }: { properties: Property[]; tx: Translate }) {
  return (
    <section className="py-8" aria-labelledby="similar-properties-title">
      <h2 id="similar-properties-title" className="text-[24px] font-semibold tracking-[-0.04em] text-[#0F1B2D]">{tx("You may also like", "သင်နှစ်သက်နိုင်သောအိမ်များ")}</h2>
      <div className="-mx-3 mt-4 flex snap-x gap-3 overflow-x-auto px-3 pb-4 sm:mx-0 sm:px-0">
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`} className="group min-w-[248px] snap-start overflow-hidden rounded-[20px] border border-[#E7E2DB] bg-white shadow-[0_4px_20px_rgba(15,27,45,.06)]">
            <div className="relative h-[148px] overflow-hidden bg-[#ECEAE5]"><Image src={property.images[0]} alt={property.title} fill sizes="248px" className="object-cover transition-transform duration-300 group-hover:scale-[1.025]" /><span className="absolute left-3 top-3 inline-flex h-7 items-center gap-1 rounded-full bg-white/94 px-2.5 text-[8px] font-semibold text-[#0057D9]"><ShieldCheck className="size-3" />{tx("Verified", "စိစစ်ပြီး")}</span></div>
            <div className="p-3.5"><p className="flex items-center gap-1 text-[9px] text-[#667085]"><MapPin className="size-3 text-[#0057D9]" />{property.township}, {property.city}</p><h3 className="mt-2 line-clamp-2 min-h-10 text-[13px] font-semibold leading-5 text-[#0F1B2D]">{property.title}</h3><div className="mt-3 flex items-end justify-between gap-2"><strong className="text-[14px] text-[#0057D9]">{formatDetailPrice(property)}</strong><span className="text-[9px] text-[#667085]">{property.bedrooms} {tx("beds", "ခန်း")}</span></div></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BottomActionBar({ property, tx, onMessage, onSchedule }: { property: Property; tx: Translate; onMessage: () => void; onSchedule: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#E2DED7] bg-[#FAF8F5]/97 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_20px_rgba(15,27,45,.07)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-[minmax(88px,.85fr)_88px_minmax(124px,1.25fr)] items-center gap-2">
        <div className="min-w-0"><strong className="block truncate text-[12px] font-bold tracking-[-0.02em] text-[#0F1B2D]">{formatDetailPrice(property)}</strong><span className="mt-0.5 block text-[8px] text-[#667085]">{property.purpose === "rent" ? tx("/ month", "/ လ") : tx("total price", "စုစုပေါင်း")}</span></div>
        <Button variant="outline" className="h-12 rounded-[14px] border-[#C9D8ED] bg-white px-2 text-[10px] !text-[#0057D9]" onClick={onMessage}><MessageCircle className="size-4" />{tx("Message", "စာပို့")}</Button>
        <Button className="h-12 rounded-[14px] bg-[#0057D9] px-3 text-[10px] !text-white hover:bg-[#0048B5]" onClick={onSchedule}><CalendarDays className="size-4" />{tx("Schedule", "ချိန်းရန်")}</Button>
      </div>
    </div>
  );
}

function TrustMeta({ property, tx }: { property: Property; tx: Translate }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#667085]"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#0057D9]" />{tx(`Usually replies within ${property.owner.response_time_minutes} minutes`, `ပုံမှန် ${property.owner.response_time_minutes} မိနစ်အတွင်း ပြန်ကြားသည်`)}</span><span className="inline-flex items-center gap-1.5"><Heart className="size-3.5 text-[#0057D9]" />{tx("Saved by 28 home seekers", "အိမ်ရှာသူ ၂၈ ဦး သိမ်းထားသည်")}</span></div>;
}

export { AIAssistantCard, AmenitiesGrid, BottomActionBar, DescriptionSection, FactsCard, formatDetailPrice, LocationCard, NearbyPlaces, PriceCard, SimilarProperties, TrustMeta, VerificationCard };

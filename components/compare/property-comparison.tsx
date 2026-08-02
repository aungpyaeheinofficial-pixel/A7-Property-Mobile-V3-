"use client";

import { ArrowLeft, Bath, BedDouble, Check, ExternalLink, MapPin, Maximize2, Scale, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { formatPropertyPrice, furnitureLabels, propertyTypeLabels, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type ComparisonRow = {
  label: string;
  value: (property: Property) => ReactNode;
  numeric?: (property: Property) => number;
  best?: "high" | "low";
};

function PropertyComparison() {
  const { isMyanmar, tx } = useLanguage();
  const { comparisonProperties, removeProperty, clearComparison } = usePropertyComparison();

  if (comparisonProperties.length < 2) {
    const selected = comparisonProperties[0];
    return (
      <div className="min-h-screen bg-[#F8F3F0] pb-28 text-[#111827]">
        <ComparisonHeader tx={tx} />
        <main className="mx-auto max-w-[920px] px-4 py-10 sm:px-6 sm:py-16">
          <section className="rounded-[24px] border border-[#E2DED7] bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,.07)] sm:p-10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]"><Scale className="size-6" /></span>
            <h1 className="mt-5 text-[30px] font-semibold tracking-[-0.045em] sm:text-[38px]">{selected ? tx("Choose one more home", "နောက်ထပ်အိမ်တစ်လုံး ရွေးပါ") : tx("Build your comparison", "အိမ်များရွေးပြီး နှိုင်းယှဉ်ပါ")}</h1>
            <p className="mx-auto mt-3 max-w-[560px] text-[12px] leading-6 text-[#66716C]">{tx("Compare price, space, amenities and A7 verification in one decision-ready view.", "ဈေးနှုန်း၊ အကျယ်အဝန်း၊ အဆင်ပြေမှုများနှင့် A7 စိစစ်မှုကို တစ်နေရာတည်းတွင် နှိုင်းယှဉ်နိုင်သည်။")}</p>
            {selected && <div className="mx-auto mt-6 flex max-w-[420px] items-center gap-3 rounded-[16px] bg-[#F7F5F1] p-3 text-left"><span className="relative size-16 shrink-0 overflow-hidden rounded-[12px]"><Image src={selected.images[0]} alt={selected.title} fill sizes="64px" className="object-cover" /></span><span className="min-w-0"><strong className="line-clamp-2 text-[12px]">{selected.title}</strong><small className="mt-1 block text-[9px] text-[#6D7671]">{selected.township} · {formatPropertyPrice(selected, isMyanmar ? "my" : "en")}</small></span><button type="button" onClick={() => removeProperty(selected.id)} className="ml-auto grid size-11 shrink-0 place-items-center rounded-full text-[#6D7671]" aria-label={tx("Remove selected home", "ရွေးထားသောအိမ်ကိုဖယ်ရန်")}><X className="size-4" /></button></div>}
            <Link href={`/search?purpose=${selected?.purpose ?? "rent"}`} className="mt-7 inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#014BAA] px-5 text-[11px] font-semibold text-white"><Scale className="size-4" />{tx("Find homes to compare", "နှိုင်းယှဉ်ရန် အိမ်ရှာမယ်")}</Link>
          </section>
        </main>
      </div>
    );
  }

  const comparablePrice = comparisonProperties.every((property) => property.purpose === comparisonProperties[0]?.purpose);
  const rows: ComparisonRow[] = [
    { label: tx("Price", "ဈေးနှုန်း"), value: (property) => <strong className="text-[#014BAA]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")}{property.purpose === "rent" && <small className="ml-1 font-normal text-[#7B837F]">/ {tx("month", "လ")}</small>}</strong>, numeric: comparablePrice ? (property) => property.price : undefined, best: "low" },
    { label: tx("Purpose", "ရည်ရွယ်ချက်"), value: (property) => property.purpose === "rent" ? tx("For rent", "ငှားရန်") : tx("For sale", "ရောင်းရန်") },
    { label: tx("Home type", "အိမ်အမျိုးအစား"), value: (property) => propertyTypeLabels[property.property_type] },
    { label: tx("Bedrooms", "အိပ်ခန်း"), value: (property) => property.bedrooms, numeric: (property) => property.bedrooms, best: "high" },
    { label: tx("Bathrooms", "ရေချိုးခန်း"), value: (property) => property.bathrooms, numeric: (property) => property.bathrooms, best: "high" },
    { label: tx("Area", "အကျယ်အဝန်း"), value: (property) => `${new Intl.NumberFormat("en-US").format(property.area_sqft)} sqft`, numeric: (property) => property.area_sqft, best: "high" },
    { label: tx("Year built", "ဆောက်လုပ်သည့်နှစ်"), value: (property) => property.year_built, numeric: (property) => property.year_built, best: "high" },
    { label: tx("Floor", "အထပ်"), value: (property) => property.floor ?? tx("Ground", "မြေညီ") },
    { label: tx("Furniture", "ပရိဘောဂ"), value: (property) => furnitureLabels[property.furniture] },
    { label: tx("Rating", "အဆင့်သတ်မှတ်ချက်"), value: (property) => `${property.rating.toFixed(1)} ★`, numeric: (property) => property.rating, best: "high" },
    { label: tx("Verification", "စိစစ်မှု"), value: (property) => property.verification_status === "verified" ? <span className="inline-flex items-center gap-1 text-[#014BAA]"><ShieldCheck className="size-4" />{tx("A7 verified", "A7 စိစစ်ပြီး")}</span> : tx("Review pending", "စိစစ်နေဆဲ") },
    { label: tx("Parking", "ကားပါကင်"), value: (property) => property.amenities.some((item) => item.toLowerCase().includes("parking")) ? <span className="inline-flex items-center gap-1 text-[#287A4B]"><Check className="size-4" />{tx("Included", "ပါဝင်")}</span> : "—" },
    { label: tx("Amenities", "အဆင်ပြေမှုများ"), value: (property) => <span className="line-clamp-3 leading-5">{property.amenities.slice(0, 4).join(" · ")}</span> },
  ];

  const labelColumnWidth = 108;
  const propertyColumnWidth = 196;
  const template = `${labelColumnWidth}px repeat(${comparisonProperties.length}, minmax(${propertyColumnWidth}px, 1fr))`;
  const minWidth = labelColumnWidth + comparisonProperties.length * propertyColumnWidth;

  return (
    <div className="min-h-screen bg-[#F8F3F0] pb-28 text-[#111827] lg:pb-16">
      <ComparisonHeader tx={tx} />
      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#014BAA]">{tx("Side-by-side review", "ဘေးချင်းယှဉ်သုံးသပ်မှု")}</p><h1 className="mt-2 text-[34px] font-semibold tracking-[-0.055em] sm:text-[48px]">{tx("Compare homes clearly", "အိမ်များကို ရှင်းလင်းစွာနှိုင်းယှဉ်ပါ")}</h1><p className="mt-2 text-[11px] text-[#68726D]">{tx(`${comparisonProperties.length} homes selected · swipe sideways on mobile`, `အိမ် ${comparisonProperties.length} လုံး ရွေးထားသည် · မိုဘိုင်းတွင် ဘေးသို့ဆွဲကြည့်ပါ`)}</p></div>
          <button type="button" onClick={clearComparison} className="inline-flex h-11 w-fit items-center gap-2 rounded-[12px] border border-[#D8D5CE] bg-white px-4 text-[10px] font-semibold text-[#5F6864]"><Trash2 className="size-4" />{tx("Clear all", "အားလုံးရှင်း")}</button>
        </div>

        <section className="mt-7 overflow-hidden rounded-[22px] border border-[#E0DDD6] bg-white shadow-[0_8px_30px_rgba(15,23,42,.07)]" aria-label={tx("Property comparison table", "အိမ်နှိုင်းယှဉ်ဇယား")}>
          <div className="overflow-x-auto">
            <div style={{ minWidth }}>
              <div className="grid border-b border-[#E7E3DC]" style={{ gridTemplateColumns: template }}>
                <div className="sticky left-0 z-20 flex items-end bg-[#F4F1EC] p-3.5"><span className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#6C7570]">{tx("Homes", "အိမ်များ")}</span></div>
                {comparisonProperties.map((property) => <ComparisonPropertyHeader key={property.id} property={property} onRemove={() => removeProperty(property.id)} tx={tx} isMyanmar={isMyanmar} />)}
              </div>
              {rows.map((row) => {
                const numericValues = row.numeric ? comparisonProperties.map(row.numeric) : [];
                const bestValue = numericValues.length ? (row.best === "low" ? Math.min(...numericValues) : Math.max(...numericValues)) : null;
                return (
                  <div key={row.label} className="grid border-b border-[#EEEAE4] last:border-b-0" style={{ gridTemplateColumns: template }}>
                    <div className="sticky left-0 z-10 flex min-h-16 items-center bg-[#F8F5F0] px-3.5 py-3 text-[9px] font-semibold text-[#626C67]">{row.label}</div>
                    {comparisonProperties.map((property) => {
                      const isBest = row.numeric && bestValue !== null && row.numeric(property) === bestValue;
                      return <div key={property.id} className={cn("flex min-h-16 items-center border-l border-[#EEEAE4] px-4 py-3 text-[11px] text-[#35413C]", isBest && "bg-[#F1F7F3] font-semibold text-[#205C3B]")}>{row.value(property)}</div>;
                    })}
                  </div>
                );
              })}
              <div className="grid" style={{ gridTemplateColumns: template }}>
                <div className="sticky left-0 z-10 bg-[#F4F1EC] p-3.5" />
                {comparisonProperties.map((property) => <div key={property.id} className="border-l border-[#EEEAE4] p-3"><Link href={`/properties/${property.id}`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#014BAA] px-3 text-[10px] font-semibold text-white">{tx("View home", "အိမ်ကြည့်ရန်")}<ExternalLink className="size-3.5" /></Link></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#D8E3F2] bg-white p-4 sm:p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]"><Sparkles className="size-4" /></span><div><h2 className="text-[13px] font-semibold">{tx("A clearer decision, not an automatic answer", "ဆုံးဖြတ်ချက်ကို ရှင်းလင်းစေခြင်းသာ ဖြစ်သည်")}</h2><p className="mt-1 text-[9px] leading-5 text-[#6B7570]">{tx("Green cells highlight stronger numeric values. Location, condition and viewing experience still matter—schedule a visit before deciding.", "အစိမ်းရောင်အကွက်များသည် ကိန်းဂဏန်းအရသာလွန်မှုကို ပြသည်။ နေရာ၊ အခြေအနေနှင့် ကိုယ်တိုင်ကြည့်ရှုမှုကိုပါ ထည့်သွင်းဆုံးဖြတ်ပါ။")}</p></div></section>
      </main>
    </div>
  );
}

function ComparisonHeader({ tx }: { tx: (english: string, myanmar: string) => string }) {
  return <header className="sticky top-0 z-50 border-b border-[#E2DED7] bg-[#F8F3F0]/94 backdrop-blur-2xl"><div className="mx-auto flex h-[70px] max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8"><Link href="/search?purpose=rent" className="grid size-11 place-items-center rounded-full border border-[#DDD9D1] bg-white text-[#014BAA]" aria-label={tx("Back to search", "ရှာဖွေမှုသို့ပြန်ရန်")}><ArrowLeft className="size-[18px]" /></Link><Link href="/" aria-label="A7 Property home"><A7Brand /></Link><div className="ml-auto"><LanguageSwitcher compact /></div></div></header>;
}

function ComparisonPropertyHeader({ property, onRemove, tx, isMyanmar }: { property: Property; onRemove: () => void; tx: (english: string, myanmar: string) => string; isMyanmar: boolean }) {
  return (
    <article className="min-w-0 border-l border-[#E7E3DC] p-3">
      <div className="relative h-[138px] overflow-hidden rounded-[14px] bg-[#E9E7E2]"><Image src={property.images[0]} alt={property.title} fill sizes="240px" className="object-cover" /><div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/28 to-transparent" /><button type="button" onClick={onRemove} className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white/94 text-[#173B66] shadow-sm" aria-label={tx(`Remove ${property.title}`, `${property.title} ကိုဖယ်ရန်`)}><X className="size-4" /></button>{property.verification_status === "verified" && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/94 px-2 py-1 text-[8px] font-semibold text-[#014BAA]"><ShieldCheck className="size-3" />{tx("Verified", "စိစစ်ပြီး")}</span>}</div>
      <p className="mt-3 flex items-center gap-1 truncate text-[8px] text-[#6E7772]"><MapPin className="size-3 text-[#014BAA]" />{property.township}, {property.city}</p>
      <h2 className="mt-1.5 line-clamp-2 min-h-10 text-[12px] font-semibold leading-5 text-[#172033]">{property.title}</h2>
      <p className="mt-2 text-[13px] font-semibold text-[#014BAA]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")}</p>
      <div className="mt-2 flex items-center gap-3 text-[8px] text-[#68726D]"><span className="inline-flex items-center gap-1"><BedDouble className="size-3.5" />{property.bedrooms}</span><span className="inline-flex items-center gap-1"><Bath className="size-3.5" />{property.bathrooms}</span><span className="inline-flex items-center gap-1"><Maximize2 className="size-3.5" />{new Intl.NumberFormat("en-US").format(property.area_sqft)}</span></div>
    </article>
  );
}

export { PropertyComparison };

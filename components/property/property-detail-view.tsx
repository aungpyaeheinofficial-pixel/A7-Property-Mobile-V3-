"use client";

import { ArrowLeft, Bath, BedDouble, Building2, Check, ChevronDown, ChevronUp, MapPin, Maximize2, Phone, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { InquirySheet, type InquiryMode } from "@/components/property/inquiry-sheet";
import { AmenitiesGrid, LocationCard } from "@/components/property/property-detail-sections";
import { PropertyGallery } from "@/components/property/property-gallery";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast-provider";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { formatPropertyPrice, propertyTypeLabels, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

function PropertyDetailView({ property }: { property: Property }) {
  const { tx, isMyanmar } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [favorite, setFavorite] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("schedule");

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
    toast({ tone: "success", title: favorite ? tx("Removed from Saved Homes", "သိမ်းထားသောအိမ်မှ ဖယ်ပြီး") : tx("Saved for later", "နောက်မှကြည့်ရန် သိမ်းပြီး"), description: property.title });
  }

  function openInquiry(mode: InquiryMode) {
    setInquiryMode(mode);
    setInquiryOpen(true);
  }

  function returnToSearch() {
    if (window.sessionStorage.getItem("a7:search-journey") && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(`/search?purpose=${property.purpose}`);
  }

  const price = formatPropertyPrice(property, isMyanmar ? "my" : "en");
  const propertyType = isMyanmar
    ? ({ condo: "ကွန်ဒို", apartment: "တိုက်ခန်း", house: "အိမ်", villa: "ဗီလာ", mini_condo: "မီနီကွန်ဒို" } as const)[property.property_type]
    : propertyTypeLabels[property.property_type];

  return (
    <div className="min-h-screen bg-[#FAF8FF] pb-[104px] text-[#191B24]">
      <header className="sticky top-0 z-50 border-b border-black/[.035] bg-[#FAF8FF]/88 shadow-[0_1px_8px_rgba(0,0,0,.025)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[760px] items-center gap-3 px-4 sm:px-6">
          <button type="button" onClick={returnToSearch} className="grid size-10 shrink-0 place-items-center text-[#191B24] transition-colors hover:text-[#0053D2]" aria-label={tx("Back to search", "ရှာဖွေမှုသို့ပြန်ရန်")}><ArrowLeft className="size-5" /></button>
          <h1 className="min-w-0 flex-1 truncate text-[20px] font-semibold tracking-[-.035em]">{tx("Property Details", "အိမ်အသေးစိတ်")}</h1>
          <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-[#C2C6D8]"><Image src="/images/profile/thiri-win.jpg" alt={mockUser.name} fill sizes="32px" className="object-cover" /></span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px]">
        <PropertyGallery images={property.images} title={property.title} verified={property.verification_status === "verified"} favorite={favorite} onToggleFavorite={toggleFavorite} />

        <div className="px-4 pt-7 sm:px-6 sm:pt-8">
          <section>
            <div className="flex flex-wrap items-center gap-2">
              {property.verification_status === "verified" && <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#0053D2]/10 px-2.5 text-[10px] font-semibold uppercase tracking-[.06em] text-[#0053D2]"><ShieldCheck className="size-3.5 fill-current" />{tx("Verified listing", "စိစစ်ထားသောအိမ်")}</span>}
              <span className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#727687]">{propertyType} · {property.purpose === "rent" ? tx("For rent", "ငှားရန်") : tx("For sale", "ရောင်းရန်")}</span>
            </div>
            <p className="mt-4 text-[26px] font-bold leading-8 tracking-[-.04em] text-[#0053D2]">{price}{property.purpose === "rent" && <span className="ml-1.5 text-[13px] font-normal tracking-normal text-[#424655]">{tx("/ month", "/ လ")}</span>}</p>
            <h2 className="mt-2 text-[28px] font-bold leading-[1.16] tracking-[-.04em] text-[#191B24] sm:text-[34px]">{property.title}</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] text-[#424655]"><MapPin className="size-[18px]" />{property.township}, {property.city}</p>
          </section>

          <section className="mt-6 grid grid-cols-4 divide-x divide-[#E1E2EE] border-y border-[#E1E2EE] py-5" aria-label={tx("Property facts", "အိမ်အချက်အလက်")}>
            <PropertyFact icon={BedDouble} value={property.bedrooms} label={tx("Beds", "အိပ်ခန်း")} />
            <PropertyFact icon={Bath} value={property.bathrooms} label={tx("Baths", "ရေချိုးခန်း")} />
            <PropertyFact icon={Maximize2} value={property.area_sqft.toLocaleString()} label={tx("Sqft", "စတုရန်းပေ")} />
            <PropertyFact icon={Building2} value={property.floor ?? "—"} label={tx("Floor", "အထပ်")} />
          </section>

          <OverviewSection property={property} tx={tx} />
          <AmenitiesGrid property={property} tx={tx} />
          <LocationCard property={property} tx={tx} />
          <ListedByCard property={property} tx={tx} onContact={() => openInquiry("contact")} />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#E1E2EE] bg-[#FAF8FF]/92 px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_20px_rgba(0,0,0,.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[728px] items-center justify-between gap-4">
          <div className="min-w-0"><span className="block text-[11px] text-[#424655]">{property.purpose === "rent" ? tx("Monthly rent", "လစဉ်ငှားရမ်းခ") : tx("Total price", "စုစုပေါင်းဈေးနှုန်း")}</span><strong className="mt-0.5 block truncate text-[20px] font-bold tracking-[-.035em] text-[#0053D2]">{price}</strong></div>
          <button type="button" onClick={() => openInquiry("schedule")} className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-[#0053D2] px-6 text-[12px] font-semibold uppercase tracking-[.05em] text-white shadow-sm transition-[transform,box-shadow] active:scale-[.98]">{tx("Request viewing", "အိမ်ကြည့်ရန်တောင်းဆို")}</button>
        </div>
      </div>

      <InquirySheet open={inquiryOpen} onOpenChange={setInquiryOpen} mode={inquiryMode} property={property} />
    </div>
  );
}

function PropertyFact({ icon: Icon, value, label }: { icon: typeof BedDouble; value: string | number; label: string }) {
  return <div className="flex min-w-0 flex-col items-center px-1 text-center"><Icon className="size-5 text-[#727687]" strokeWidth={1.8} /><strong className="mt-1.5 max-w-full truncate text-[17px] font-semibold text-[#191B24]">{value}</strong><span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.06em] text-[#424655]">{label}</span></div>;
}

function OverviewSection({ property, tx }: { property: Property; tx: (english: string, myanmar: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="border-b border-[#E1E2EE] py-7" aria-labelledby="overview-title">
      <h2 id="overview-title" className="text-[20px] font-semibold tracking-[-.035em]">{tx("Overview", "အကျဉ်းချုပ်")}</h2>
      <p className={cn("mt-3 text-[15px] leading-7 text-[#424655]", !expanded && "line-clamp-4")}>{property.description} {tx("This listing has clear pricing, recent photos, and verified contact details to help you plan with confidence.", "ဤအိမ်တွင် ရှင်းလင်းသောဈေးနှုန်း၊ မကြာသေးမီကဓာတ်ပုံများနှင့် စိစစ်ထားသောဆက်သွယ်ရန်အချက်အလက်များ ပါရှိသည်။")}</p>
      <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 inline-flex h-10 items-center gap-1 text-[11px] font-semibold uppercase tracking-[.05em] text-[#0053D2]" aria-expanded={expanded}>{expanded ? tx("Read less", "အနည်းငယ်ပြရန်") : tx("Read more", "ပိုမိုဖတ်ရန်")}{expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
    </section>
  );
}

function ListedByCard({ property, tx, onContact }: { property: Property; tx: (english: string, myanmar: string) => string; onContact: () => void }) {
  const initials = property.owner.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <section className="py-7" aria-labelledby="listed-by-title">
      <h2 id="listed-by-title" className="text-[20px] font-semibold tracking-[-.035em]">{tx("Listed By", "စာရင်းတင်သူ")}</h2>
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#F2F3FF] p-4">
        <Avatar initials={initials} className="size-14 shrink-0 bg-[#DCE2F3] text-[15px] font-semibold text-[#0053D2]" />
        <div className="min-w-0 flex-1"><strong className="block truncate text-[15px] font-semibold">{property.owner.name}</strong><span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#424655]"><Star className="size-3.5 fill-[#0053D2] text-[#0053D2]" />{property.rating.toFixed(1)} · {property.owner.type === "agent" ? tx("Verified agent", "စိစစ်ထားသောအကျိုးဆောင်") : tx("Verified owner", "စိစစ်ထားသောပိုင်ရှင်")}</span></div>
        <button type="button" onClick={onContact} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E6E7F4] text-[#0053D2] shadow-sm transition-transform active:scale-95" aria-label={tx(`Contact ${property.owner.name}`, `${property.owner.name} ကိုဆက်သွယ်ရန်`)}><Phone className="size-[18px]" /></button>
      </div>
    </section>
  );
}

export { PropertyDetailView };

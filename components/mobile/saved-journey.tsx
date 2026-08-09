"use client";

import { Bath, BedDouble, Heart, Maximize2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type SavedTab = "all" | "buy" | "rent";

function SavedJourney() {
  const { isMyanmar, tx } = useLanguage();
  const [savedIds, setSavedIds] = useState(mockUser.savedPropertyIds);
  const [tab, setTab] = useState<SavedTab>("all");

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => setSavedIds(stored));
  }, []);

  const savedHomes = useMemo(
    () => savedIds
      .map((id) => allProperties.find((property) => property.id === id))
      .filter((property): property is Property => Boolean(property)),
    [savedIds],
  );

  const visibleHomes = useMemo(
    () => savedHomes.filter((property) => tab === "all" || (tab === "buy" ? property.purpose === "sale" : property.purpose === "rent")),
    [savedHomes, tab],
  );

  function removeSaved(property: Property) {
    const next = savedIds.filter((id) => id !== property.id);
    setSavedIds(next);
    writeStoredIds(STORAGE_KEYS.saved, next);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-[118px] text-[#1B1B1F] lg:pb-12">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[.035] bg-[#FAF9FD]/85 shadow-[0_1px_8px_rgba(0,0,0,.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[760px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label={tx("A7 Property home", "A7 Property ပင်မစာမျက်နှာ")}>
            <span className="relative size-8 overflow-hidden rounded-full bg-white shadow-[0_2px_7px_rgba(16,24,40,.12)]">
              <Image src="/images/brand/a7-property-logo.jpg" alt="" fill sizes="32px" className="scale-[2.55] object-contain" />
            </span>
            <span className="text-[20px] font-semibold tracking-[-.035em] text-[#0053D2]">{tx("Saved", "သိမ်းထားသည်")}</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher className="[&_button]:h-9 [&_button]:rounded-lg [&_button]:bg-[#EFEDF1] [&_button]:px-2.5 [&_button]:text-[#424655] [&_button]:hover:bg-[#E3E2E6]" />
            <Link href="/profile" className="relative size-8 overflow-hidden rounded-full border border-[#C2C6D8]" aria-label={tx("Open profile", "ပရိုဖိုင်ဖွင့်ရန်")}>
              <Image src="/images/profile/thiri-win.jpg" alt={mockUser.name} fill sizes="32px" className="object-cover" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-4 pt-[88px] sm:px-6" aria-labelledby="saved-homes-title">
        <section className="pb-4 pt-1">
          <h1 id="saved-homes-title" className="text-[34px] font-bold leading-[1.16] tracking-[-.045em] text-[#1B1B1F] sm:text-[38px]">{tx("Saved Homes", "သိမ်းထားသောအိမ်များ")}</h1>
          <p className="mt-2 text-[16px] leading-6 text-[#424655] sm:text-[17px]">{tx("Properties you want to revisit", "ပြန်လည်ကြည့်ရှုလိုသောအိမ်များ")}</p>
        </section>

        <div className="mb-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex rounded-lg bg-[#EFEDF1] p-1" role="tablist" aria-label={tx("Saved home category", "သိမ်းထားသောအိမ် အမျိုးအစား")}>
            <SavedTabButton active={tab === "all"} label={tx("All", "အားလုံး")} onClick={() => setTab("all")} />
            <SavedTabButton active={tab === "buy"} label={tx("Buy", "ဝယ်ရန်")} onClick={() => setTab("buy")} />
            <SavedTabButton active={tab === "rent"} label={tx("Rent", "ငှားရန်")} onClick={() => setTab("rent")} />
          </div>
        </div>

        {visibleHomes.length > 0 ? (
          <section className="space-y-8" aria-label={tx("Saved home list", "သိမ်းထားသောအိမ်စာရင်း")}>
            {visibleHomes.map((property, index) => (
              <SavedHomeCard key={property.id} property={property} isMyanmar={isMyanmar} tx={tx} priority={index < 2} onRemove={removeSaved} />
            ))}
          </section>
        ) : (
          <section className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-[#EFEDF1] text-[#727687]"><Heart className="size-8" /></span>
            <h2 className="mt-5 text-[22px] font-semibold tracking-[-.03em]">{tx("No saved homes yet", "သိမ်းထားသောအိမ် မရှိသေးပါ")}</h2>
            <p className="mt-2 max-w-[300px] text-[15px] leading-6 text-[#424655]">{tx("Keep track of the properties you love by tapping the heart icon.", "နှစ်သက်သောအိမ်များကို နှလုံးပုံကိုနှိပ်ပြီး သိမ်းထားနိုင်ပါသည်။")}</p>
            <Link href="/search?purpose=rent" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0053D2] px-5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(0,83,210,.18)]">{tx("Explore properties", "အိမ်များရှာဖွေရန်")}</Link>
          </section>
        )}
      </main>
    </div>
  );
}

function SavedTabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "h-9 rounded-md px-5 text-[13px] font-medium transition-[background-color,color,box-shadow]",
        active ? "bg-white text-[#1B1B1F] shadow-[0_1px_3px_rgba(0,0,0,.12)]" : "text-[#424655] hover:bg-white/60",
      )}
    >
      {label}
    </button>
  );
}

function SavedHomeCard({ property, isMyanmar, tx, priority, onRemove }: { property: Property; isMyanmar: boolean; tx: (english: string, myanmar: string) => string; priority: boolean; onRemove: (property: Property) => void }) {
  const price = formatPropertyPrice(property, isMyanmar ? "my" : "en");
  const isVerified = property.verification_status === "verified";

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(27,27,31,.08)] transition-transform duration-200 active:scale-[.985]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EFEDF1]">
        <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={tx(`View ${property.title}`, `${property.title} ကိုကြည့်ရန်`)} />
        <ProgressiveImage src={property.images[0]} alt={property.title} fill priority={priority} sizes="(max-width: 800px) calc(100vw - 32px), 712px" className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/[.44] via-black/[.08] to-transparent" />
        {isVerified && <span className="absolute left-3 top-3 z-20 inline-flex h-7 items-center gap-1.5 rounded-md bg-white/90 px-2.5 text-[10px] font-semibold uppercase tracking-[.08em] text-[#1B1B1F] shadow-sm backdrop-blur-md"><ShieldCheck className="size-3.5 text-[#059669]" fill="currentColor" strokeWidth={2.3} />{tx("Verified", "စိစစ်ပြီး")}</span>}
        <button type="button" onClick={() => onRemove(property)} aria-label={tx(`Remove ${property.title} from saved homes`, `${property.title} ကို သိမ်းထားမှုမှဖယ်ရန်`)} className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-white/90 text-[#0053D2] shadow-sm backdrop-blur-md transition-transform active:scale-95">
          <Heart className="size-5 fill-current" />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[27px] font-bold leading-none tracking-[-.04em] text-[#1B1B1F] sm:text-[30px]">{price}{property.purpose === "rent" && <span className="ml-1.5 text-[13px] font-medium tracking-normal text-[#424655]">{tx("/ mo", "/လ")}</span>}</p>
        <Link href={`/properties/${property.id}`} className="mt-3 block">
          <h2 className="truncate text-[19px] font-semibold leading-6 tracking-[-.03em] text-[#1B1B1F] transition-colors hover:text-[#0053D2] sm:text-[21px]">{property.title}</h2>
          <p className="mt-1 truncate text-[15px] text-[#424655] sm:text-[16px]">{property.township}, {property.city}</p>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[#424655] sm:gap-x-5" aria-label={tx("Property details", "အိမ်အသေးစိတ်")}>
          <PropertyFact icon={BedDouble} label={tx(`${property.bedrooms} ${property.bedrooms === 1 ? "Bed" : "Beds"}`, `${property.bedrooms} အိပ်ခန်း`)} />
          <span className="size-1 rounded-full bg-[#C2C6D8]" aria-hidden="true" />
          <PropertyFact icon={Bath} label={tx(`${property.bathrooms} ${property.bathrooms === 1 ? "Bath" : "Baths"}`, `${property.bathrooms} ရေချိုးခန်း`)} />
          <span className="size-1 rounded-full bg-[#C2C6D8]" aria-hidden="true" />
          <PropertyFact icon={Maximize2} label={tx(`${property.area_sqft.toLocaleString()} sqft`, `${property.area_sqft.toLocaleString()} စတုရန်းပေ`)} />
        </div>
      </div>
    </article>
  );
}

function PropertyFact({ icon: Icon, label }: { icon: typeof BedDouble; label: string }) {
  return <span className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px]"><Icon className="size-[19px]" strokeWidth={1.8} />{label}</span>;
}

export { SavedJourney };

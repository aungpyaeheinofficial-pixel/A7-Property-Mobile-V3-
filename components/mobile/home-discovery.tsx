"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Building,
  Building2,
  Check,
  Ellipsis,
  Heart,
  Home,
  KeyRound,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { PropertyCardBody } from "@/components/property/property-card-system";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { useToast } from "@/components/ui/toast-provider";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockMessages, mockUser } from "@/lib/mock-users";
import { a7Motion } from "@/lib/motion";
import { allProperties, sortProperties, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type HomeMode = "rent" | "sale" | "buy";

type QuickCategory = {
  label: string;
  labelMy: string;
  type?: Property["property_type"];
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const quickCategories: QuickCategory[] = [
  { label: "Houses", labelMy: "အိမ်", type: "house", icon: Home },
  { label: "Condos", labelMy: "ကွန်ဒို", type: "condo", icon: Building2 },
  { label: "Shops", labelMy: "ဆိုင်ခန်း", icon: Store },
  { label: "Apartments", labelMy: "တိုက်ခန်း", type: "apartment", icon: Building },
  { label: "More", labelMy: "နောက်ထပ်", icon: Ellipsis },
];

function HomeDiscovery() {
  const { tx, isMyanmar } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<HomeMode>("rent");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(mockUser.savedPropertyIds);

  const purpose: Property["purpose"] = mode === "rent" ? "rent" : "sale";
  const searchHref = buildSearchHref(mode);
  const unreadMessages = mockMessages.filter((message) => message.unread).length;
  const promoted = useMemo(
    () => sortProperties(allProperties.filter((property) => property.purpose === purpose && property.verification_status === "verified"), "recommended").slice(0, 6),
    [purpose],
  );

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => setSaved(stored));
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ purpose });
    if (mode !== "rent") params.set("mode", mode);
    if (query.trim()) params.set("location", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  function toggleSaved(property: Property) {
    const wasSaved = saved.includes(property.id);
    const next = wasSaved ? saved.filter((id) => id !== property.id) : [...saved, property.id];
    setSaved(next);
    writeStoredIds(STORAGE_KEYS.saved, next);
    toast({
      tone: "success",
      title: wasSaved ? tx("Removed from Saved Homes", "သိမ်းထားသောအိမ်မှ ဖယ်ပြီး") : tx("Saved for later", "နောက်မှကြည့်ရန် သိမ်းပြီး"),
      description: property.title,
    });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFCFE] pb-[116px] text-[#0B1D41]">
      <motion.main
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05, delayChildren: reduceMotion ? 0 : 0.06 } } }}
        className="mx-auto w-full max-w-[1180px] px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[920px]">
          <motion.header variants={reveal(reduceMotion)} className="flex h-[64px] items-center gap-3" aria-label={tx("A7 Property home header", "A7 Property ပင်မခေါင်းစီး")}>
            <Link href="/" className="inline-flex min-w-0 items-center gap-2.5" aria-label="A7 Property home">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-[15px] shadow-[0_8px_24px_rgba(13,35,68,.1)]"><Image src="/images/brand/a7-property-logo.jpg" alt="" fill sizes="48px" className="scale-[2.55] object-contain" /></span>
              <span className="truncate text-[22px] font-semibold tracking-[-0.045em] text-[#095FF1]">A7 <span className="text-[#0B1D41]">Property</span></span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <HeaderAction href="/messages" label={tx("Open messages", "စာများဖွင့်ရန်")} count={Math.max(unreadMessages, 3)}><MessageCircle className="size-[21px]" /></HeaderAction>
              <HeaderAction href="/messages" label={tx("Open notifications", "အသိပေးချက်များဖွင့်ရန်")} count={2}><Bell className="size-[20px]" /></HeaderAction>
            </div>
          </motion.header>

          <motion.form variants={reveal(reduceMotion)} onSubmit={submitSearch} role="search" className="mt-4 flex h-[64px] items-center gap-2 rounded-full border border-[#DDE4EF] bg-white p-1.5 pl-5 shadow-[0_10px_30px_rgba(24,48,86,.06)] focus-within:border-[#AFCBFA] focus-within:ring-4 focus-within:ring-[#0A67FF]/8">
            <Search className="size-[22px] shrink-0 text-[#52617A]" />
            <input data-focus-ring="parent" value={query} onChange={(event) => setQuery(event.target.value)} aria-label={tx("Search for location or property", "နေရာ သို့မဟုတ် အိမ်ရှာရန်")} placeholder={tx("Search for location, property or keyword…", "နေရာ၊ အိမ် သို့မဟုတ် စာလုံးရှာပါ…")} className="min-w-0 flex-1 bg-transparent px-2 text-[13px] font-medium text-[#0B1D41] outline-none placeholder:text-[#66738A] sm:text-[14px]" />
            <Link href={searchHref} className="grid size-[52px] shrink-0 place-items-center rounded-[18px] bg-[#0A67FF] text-white shadow-[0_8px_22px_rgba(10,103,255,.24)] transition-transform active:scale-95" aria-label={tx("Open all filters", "စစ်ထုတ်မှုအားလုံးဖွင့်ရန်")}><SlidersHorizontal className="size-[21px]" /></Link>
          </motion.form>

          <motion.div variants={reveal(reduceMotion)} className="-mx-1 mt-4 grid grid-cols-3 gap-2 px-1" role="tablist" aria-label={tx("Property purpose", "အိမ်ခြံမြေ ရည်ရွယ်ချက်")}>
            <ModeButton selected={mode === "rent"} onClick={() => setMode("rent")} icon={KeyRound} label={tx("For Rent", "ငှားရန်")} />
            <ModeButton selected={mode === "sale"} onClick={() => setMode("sale")} icon={Tag} label={tx("For Sale", "ရောင်းရန်")} />
            <ModeButton selected={mode === "buy"} onClick={() => setMode("buy")} icon={Building2} label={tx("For Buy", "ဝယ်ရန်")} />
          </motion.div>

          <motion.section variants={reveal(reduceMotion)} className="relative mt-2 h-[clamp(258px,52vw,500px)] overflow-hidden rounded-[28px] bg-[#EAF4FF]" aria-labelledby="home-hero-title">
            <ProgressiveImage src="/images/properties/a7-yangon-daylight-hero.png" alt="Modern curved glass residence overlooking Yangon" fill priority sizes="(max-width: 920px) 100vw, 920px" className="object-cover object-center" skeletonClassName="bg-[#EDF5FD]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,253,255,.96)_0%,rgba(250,253,255,.86)_27%,rgba(250,253,255,.32)_48%,rgba(250,253,255,0)_68%)]" />
            <div className="absolute inset-y-0 left-0 z-10 flex w-1/2 max-w-[440px] flex-col justify-center px-6 pb-6 sm:px-10">
              <span className="w-fit rounded-[12px] border border-[#0A67FF]/14 bg-white/65 px-3 py-1.5 text-[9px] font-semibold text-[#0A67FF] shadow-sm backdrop-blur-xl">{tx("Find Your Perfect Space", "သင့်အတွက် ပြီးပြည့်စုံသောနေရာ")}</span>
              <h1 id="home-hero-title" className="mt-4 text-[clamp(34px,7vw,66px)] font-semibold leading-[1.03] tracking-[-0.055em] text-[#0B1D41]">{tx("Discover Your Next Home", "သင့်အိမ်အသစ်ကို ရှာဖွေပါ")} <Sparkles className="inline size-[.76em] -translate-y-0.5 fill-[#0A67FF] text-[#0A67FF]" /></h1>
              <p className="mt-4 max-w-[330px] text-[clamp(10px,2.2vw,15px)] font-medium leading-[1.45] text-[#183153]">{tx("Explore verified properties in Myanmar with A7 Property.", "A7 Property ဖြင့် မြန်မာနိုင်ငံရှိ စိစစ်ပြီးသောအိမ်များကို ရှာဖွေပါ။")}</p>
            </div>
          </motion.section>

          <motion.nav variants={reveal(reduceMotion)} className="relative z-20 mx-3 -mt-9 grid grid-cols-5 gap-1 rounded-[24px] border border-[#E3E9F2] bg-white/94 p-3 shadow-[0_18px_42px_rgba(26,55,96,.12)] backdrop-blur-2xl sm:mx-6 sm:-mt-12 sm:p-4" aria-label={tx("Browse by property type", "အိမ်အမျိုးအစားဖြင့်ရှာရန်")}>
            {quickCategories.map((category) => <QuickCategoryItem key={category.label} category={category} mode={mode} isMyanmar={isMyanmar} />)}
          </motion.nav>
        </div>

        <motion.section variants={reveal(reduceMotion)} className="mx-auto mt-6 w-full max-w-[920px]" aria-labelledby="promoted-title">
          <SectionHeading id="promoted-title" title={tx("Promoted Properties", "အထူးဖော်ပြထားသောအိမ်များ")} href={searchHref} action={tx("See all", "အားလုံးကြည့်ရန်")} />
          <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 hide-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {promoted.slice(0, 4).map((property, index) => (
              <motion.div key={property.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={reduceMotion ? { duration: 0 } : { ...a7Motion.slow, delay: index * 0.04 }} className="min-w-[min(82vw,340px)] snap-start sm:min-w-0">
                <PromotedCard property={property} saved={saved.includes(property.id)} onToggleSaved={toggleSaved} tx={tx} priority={index === 0} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={reveal(reduceMotion)} className="mx-auto mt-4 w-full max-w-[920px]" aria-labelledby="recommendation-title">
          <SectionHeading id="recommendation-title" title={tx("Recommended For You", "သင့်အတွက် အကြံပြုထားသည်")} href="/assistant" action={tx("See all", "အားလုံးကြည့်ရန်")} />
          <div className="mt-4 grid min-h-[132px] grid-cols-[1fr_auto] items-center gap-3 overflow-hidden rounded-[24px] border border-[#DDE8F8] bg-[linear-gradient(105deg,#F8FBFF_0%,#EEF6FF_100%)] p-4 shadow-[0_12px_30px_rgba(36,76,130,.07)] sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid size-14 shrink-0 place-items-center rounded-full border border-white bg-white/76 text-[24px] font-semibold text-[#0A67FF] shadow-[0_8px_22px_rgba(40,83,140,.08)]">AI<Sparkles className="absolute right-1 top-1 size-3 fill-[#0A67FF]" /></span>
              <div className="min-w-0">
                <p className="text-[9px] font-medium text-[#52617A]">{tx("Smart Recommendation", "စမတ်အကြံပြုချက်")}</p>
                <h2 className="mt-1 max-w-[260px] text-[14px] font-semibold leading-5 tracking-[-0.02em] text-[#0B1D41] sm:text-[17px] sm:leading-6">{tx("3 new properties match your preferences", "သင့်စိတ်ကြိုက်နှင့် ကိုက်ညီသည့်အိမ်သစ် ၃ လုံးရှိသည်")}</h2>
                <Link href="/assistant" className="mt-3 inline-flex h-9 items-center rounded-[12px] bg-[#0A67FF] px-4 text-[9px] font-semibold text-white shadow-[0_7px_16px_rgba(10,103,255,.2)]">{tx("View Now", "ယခုကြည့်မယ်")}</Link>
              </div>
            </div>
            <div className="hidden items-center gap-2 min-[430px]:flex">
              <div className="flex -space-x-5">
                {promoted.slice(0, 2).map((property, index) => <span key={property.id} className="relative h-[66px] w-[82px] overflow-hidden rounded-[14px] border-2 border-white bg-[#EDF4FC] shadow-[0_8px_18px_rgba(29,63,109,.12)]" style={{ zIndex: 2 - index, transform: `translateY(${index * -5}px)` }}><Image src={property.images[0]} alt="" fill sizes="82px" className="object-cover" /></span>)}
              </div>
              <span className="grid size-12 place-items-center rounded-full bg-white text-center text-[9px] font-semibold leading-3 text-[#0B1D41] shadow-sm">+3<br />{tx("More", "ထပ်မံ")}</span>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}

function reveal(reduceMotion: boolean | null) {
  return {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : a7Motion.slow },
  };
}

function buildSearchHref(mode: HomeMode, type?: Property["property_type"]) {
  const params = new URLSearchParams({ purpose: mode === "rent" ? "rent" : "sale" });
  if (mode !== "rent") params.set("mode", mode);
  if (type) params.set("type", type);
  return `/search?${params.toString()}`;
}

function HeaderAction({ href, label, count, children }: { href: string; label: string; count?: number; children: ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="relative grid size-12 place-items-center rounded-full border border-[#EEF1F6] bg-white text-[#0B1D41] shadow-[0_8px_24px_rgba(28,55,92,.07)] transition-transform active:scale-95">
      {children}
      {count ? <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#0A67FF] text-[8px] font-bold text-white ring-2 ring-white">{count}</span> : null}
    </Link>
  );
}

function ModeButton({ selected, onClick, icon: Icon, label }: { selected: boolean; onClick: () => void; icon: ComponentType<{ className?: string }>; label: string }) {
  return (
    <button type="button" role="tab" aria-selected={selected} onClick={onClick} className={cn("inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-[18px] border px-2 text-[11px] font-semibold transition-[background-color,border-color,box-shadow,transform] active:scale-[.98] sm:px-4 sm:text-[12px]", selected ? "border-[#0A67FF] bg-[#0A67FF] text-white shadow-[0_8px_22px_rgba(10,103,255,.2)]" : "border-[#DFE5EE] bg-white text-[#344665] shadow-[0_6px_18px_rgba(28,55,92,.03)] hover:border-[#BFD5F8]")}>
      <Icon className="size-4 shrink-0" /> <span className="truncate">{label}</span>
    </button>
  );
}

function QuickCategoryItem({ category, mode, isMyanmar }: { category: QuickCategory; mode: HomeMode; isMyanmar: boolean }) {
  const Icon = category.icon;
  return (
    <Link href={buildSearchHref(mode, category.type)} className="group flex min-w-0 flex-col items-center gap-2 rounded-[16px] py-1 text-[#0B1D41]">
      <span className="grid size-11 place-items-center rounded-full bg-[#F3F5F9] text-[#0A67FF] transition-[transform,background-color] group-hover:-translate-y-0.5 group-hover:bg-[#EAF2FF]"><Icon className="size-[21px]" strokeWidth={2.2} /></span>
      <span className="max-w-full truncate text-[8px] font-medium sm:text-[10px]">{isMyanmar ? category.labelMy : category.label}</span>
    </Link>
  );
}

function SectionHeading({ id, title, action, href }: { id: string; title: string; action: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-[18px] font-semibold tracking-[-0.03em] text-[#0B1D41]">{title}</h2>
      <Link href={href} className="inline-flex h-11 items-center gap-1.5 text-[11px] font-semibold text-[#0A67FF]">{action}<ArrowRight className="size-4" /></Link>
    </div>
  );
}

function PromotedCard({ property, saved, onToggleSaved, tx, priority = false }: { property: Property; saved: boolean; onToggleSaved: (property: Property) => void; tx: (english: string, myanmar: string) => string; priority?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#E2E7EF] bg-white shadow-[0_12px_30px_rgba(27,52,88,.09)]">
      <div className="relative h-[190px] overflow-hidden bg-[#EDF3F9]">
        <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={tx(`View ${property.title}`, `${property.title} ကိုကြည့်ရန်`)} />
        <ProgressiveImage src={property.images[0]} alt={property.title} fill priority={priority} sizes="(max-width: 640px) 82vw, 33vw" className="object-cover" />
        <span className="absolute left-3 top-3 z-20 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/85 bg-white/90 px-3 text-[9px] font-semibold text-[#183153] shadow-sm backdrop-blur-md"><Check className="size-3.5 text-[#0A67FF]" />{formatPropertyType(property.property_type)} · {tx("Verified", "စိစစ်ပြီး")}</span>
        <button type="button" onClick={() => onToggleSaved(property)} className="absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-full border border-white/90 bg-white/92 text-[#183153] shadow-sm backdrop-blur-md transition-transform active:scale-95" aria-label={saved ? tx(`Remove ${property.title} from saved homes`, `${property.title} ကိုသိမ်းထားမှုမှဖယ်ရန်`) : tx(`Save ${property.title}`, `${property.title} ကိုသိမ်းရန်`)} aria-pressed={saved}><Heart className={cn("size-5", saved && "fill-current text-[#0A67FF]")} /></button>
      </div>
      <PropertyCardBody property={property} variant="explore" className="p-4" updatedLabel={tx("Updated today", "ယနေ့ပြင်ထား")} />
    </article>
  );
}

function formatPropertyType(type: Property["property_type"]) {
  return type.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export { HomeDiscovery };

"use client";

import {
  Bookmark,
  Building2,
  Check,
  ChevronDown,
  Folder,
  Heart,
  Plus,
  Scale,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { MobileSearchCard } from "@/components/mobile/mobile-search-card";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { allProperties, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type SavedTab = "all" | "rent" | "buy" | "collections";
type SavedSort = "recent" | "price-low" | "price-high";

function SavedJourney() {
  const { tx } = useLanguage();
  const [savedIds, setSavedIds] = useState(mockUser.savedPropertyIds);
  const [tab, setTab] = useState<SavedTab>("all");
  const [sort, setSort] = useState<SavedSort>("recent");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { comparisonIds, comparisonProperties, toggleProperty, maxComparisonHomes } = usePropertyComparison();

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => setSavedIds(stored));
  }, []);

  const savedHomes = useMemo(
    () => savedIds.map((id) => allProperties.find((property) => property.id === id)).filter((item): item is Property => Boolean(item)),
    [savedIds],
  );

  const visibleHomes = useMemo(() => {
    if (tab === "collections") return [];
    let next = savedHomes.filter((property) => tab === "all" || (tab === "rent" ? property.purpose === "rent" : property.purpose === "sale"));
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) next = next.filter((property) => `${property.title} ${property.township} ${property.city}`.toLowerCase().includes(normalizedQuery));
    if (sort === "price-low") next = [...next].sort((a, b) => a.price - b.price);
    if (sort === "price-high") next = [...next].sort((a, b) => b.price - a.price);
    return next;
  }, [query, savedHomes, sort, tab]);

  function toggleSaved(property: Property) {
    const next = savedIds.includes(property.id) ? savedIds.filter((id) => id !== property.id) : [...savedIds, property.id];
    setSavedIds(next);
    writeStoredIds(STORAGE_KEYS.saved, next);
  }

  return (
    <div className="min-h-screen bg-[#FBFCFE] pb-[188px] text-[#0B1D41] lg:pb-16">
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-10 pt-[max(.875rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <header className="flex min-h-12 items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[27px] font-semibold leading-none tracking-[-0.045em] sm:text-[32px]">{tx("Saved", "သိမ်းထားသည်")}</h1>
            <p className="mt-1.5 text-[10px] text-[#71809A] sm:text-[11px]">{tx("Your saved homes and collections", "သိမ်းထားသောအိမ်များနှင့် စုစည်းမှုများ")}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setSearchOpen((current) => !current)} className="grid size-11 place-items-center rounded-full text-[#0B1D41] transition-colors hover:bg-white hover:text-[#0A67FF]" aria-label={tx("Search saved homes", "သိမ်းထားသောအိမ်များရှာရန်")} aria-expanded={searchOpen}>{searchOpen ? <X className="size-5" /> : <Search className="size-5" />}</button>
            <button type="button" onClick={() => document.getElementById("saved-tabs")?.focus()} className="grid size-11 place-items-center rounded-full text-[#0B1D41] transition-colors hover:bg-white hover:text-[#0A67FF]" aria-label={tx("Saved home filters", "သိမ်းထားသောအိမ် စစ်ထုတ်မှုများ")}><SlidersHorizontal className="size-5" /></button>
          </div>
        </header>

        {searchOpen && <label className="mt-4 flex h-11 items-center gap-2 rounded-full border border-[#DCE3ED] bg-white px-4 shadow-[0_8px_24px_rgba(28,55,92,.06)] transition-[border-color,box-shadow] focus-within:border-[#9DBCE8] focus-within:shadow-[0_0_0_3px_rgba(0,87,217,.08)]"><Search className="size-4 text-[#65738A]" /><span className="sr-only">{tx("Search saved homes", "သိမ်းထားသောအိမ်များရှာရန်")}</span><input data-focus-ring="parent" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx("Search saved homes…", "သိမ်းထားသောအိမ်များရှာပါ…")} className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#8A96A8]" /></label>}

        <nav id="saved-tabs" tabIndex={-1} className="mt-4 grid grid-cols-4 rounded-[22px] border border-[#E2E7EF] bg-white p-1 shadow-[0_8px_22px_rgba(26,52,88,.065)] outline-none" aria-label={tx("Saved categories", "သိမ်းထားမှုအမျိုးအစားများ")}>
          <SavedTabButton active={tab === "all"} onClick={() => setTab("all")} label={tx("All", "အားလုံး")} />
          <SavedTabButton active={tab === "rent"} onClick={() => setTab("rent")} label={tx("Rent", "ငှားရန်")} icon={Building2} />
          <SavedTabButton active={tab === "buy"} onClick={() => setTab("buy")} label={tx("Buy", "ဝယ်ရန်")} icon={ShoppingBag} />
          <SavedTabButton active={tab === "collections"} onClick={() => setTab("collections")} label={tx("Collections", "စုစည်းမှု")} icon={Folder} />
        </nav>

        <section className="mt-4 flex min-h-[64px] items-center gap-2.5 rounded-[20px] border border-[#E2E7EF] bg-white px-4 py-2.5 shadow-[0_8px_22px_rgba(26,52,88,.05)]" aria-label={tx("Saved homes summary", "သိမ်းထားသောအိမ် အကျဉ်းချုပ်")}>
          <Bookmark className="size-[18px] text-[#173257]" />
          <p className="min-w-0 flex-1 text-[12px] font-semibold">{tx(`${visibleHomes.length} saved homes`, `သိမ်းထားသောအိမ် ${visibleHomes.length} လုံး`)}</p>
          <label className="relative flex h-11 w-[146px] items-center rounded-[14px] border border-[#DCE3ED] bg-white transition-[border-color,box-shadow] focus-within:border-[#9DBCE8] focus-within:shadow-[0_0_0_3px_rgba(0,87,217,.08)]">
            <span className="sr-only">{tx("Sort saved homes", "သိမ်းထားသောအိမ်များစီရန်")}</span>
            <select data-focus-ring="parent" value={sort} onChange={(event) => setSort(event.target.value as SavedSort)} className="h-11 min-w-0 flex-1 appearance-none bg-transparent pl-3.5 pr-8 text-[10px] font-semibold text-[#172A49] outline-none">
              <option value="recent">{tx("Recently saved", "မကြာသေးမီက")}</option>
              <option value="price-low">{tx("Lowest price", "ဈေးအနည်းဆုံး")}</option>
              <option value="price-high">{tx("Highest price", "ဈေးအများဆုံး")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-[#172A49]" />
          </label>
        </section>

        {tab === "collections" ? (
          <section className="mt-6 rounded-[24px] border border-dashed border-[#BFD4F1] bg-white px-6 py-14 text-center"><Folder className="mx-auto size-9 text-[#0A67FF]" /><h2 className="mt-4 text-[21px] font-semibold">{tx("Create your first collection", "ပထမဆုံးစုစည်းမှု ဖန်တီးပါ")}</h2><p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-[#71809A]">{tx("Group homes for family, work, or your next neighborhood.", "မိသားစု၊ အလုပ် သို့မဟုတ် နောက်နေရာအလိုက် အိမ်များစုစည်းပါ။")}</p><button type="button" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#0A67FF] px-5 text-[11px] font-semibold text-white"><Plus className="size-4" />{tx("New collection", "စုစည်းမှုအသစ်")}</button></section>
        ) : visibleHomes.length ? (
          <section className="mt-4 space-y-3" aria-label={tx("Saved home list", "သိမ်းထားသောအိမ်စာရင်း")}>
            {visibleHomes.map((property) => <MobileSearchCard key={property.id} variant="compact" property={property} saved onToggleSaved={toggleSaved} compared={comparisonIds.includes(property.id)} compareDisabled={!comparisonIds.includes(property.id) && comparisonIds.length >= maxComparisonHomes} onToggleCompare={toggleProperty} />)}
          </section>
        ) : (
          <section className="mt-6 rounded-[24px] border border-dashed border-[#BFD4F1] bg-white px-6 py-14 text-center"><Heart className="mx-auto size-9 text-[#0A67FF]" /><h2 className="mt-4 text-[21px] font-semibold">{tx("No saved homes here yet", "ဤနေရာတွင် သိမ်းထားသောအိမ် မရှိသေးပါ")}</h2><Link href="/search?purpose=rent" className="mt-5 inline-flex h-11 items-center rounded-full bg-[#0A67FF] px-5 text-[11px] font-semibold text-white">{tx("Explore homes", "အိမ်များရှာဖွေရန်")}</Link></section>
        )}
      </main>

      {comparisonProperties.length > 0 && <CompareTray properties={comparisonProperties} tx={tx} />}
    </div>
  );
}

function SavedTabButton({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon?: typeof Building2 }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[17px] px-1.5 text-[9px] font-semibold transition-[background-color,color,box-shadow] sm:text-[10px]", active ? "bg-[#0A67FF] text-white shadow-[0_6px_16px_rgba(10,103,255,.2)]" : "text-[#0B1D41] hover:bg-[#F3F7FD]")}>{Icon && <Icon className="size-4 shrink-0" />}<span className="truncate">{label}</span></button>;
}

function CompareTray({ properties, tx }: { properties: Property[]; tx: (english: string, myanmar: string) => string }) {
  return (
    <aside className="fixed inset-x-3 bottom-[94px] z-[70] mx-auto flex h-[72px] max-w-[780px] items-center gap-2.5 rounded-[22px] border border-[#E0E6EF] bg-white/94 px-3.5 shadow-[0_12px_32px_rgba(22,50,89,.13)] backdrop-blur-2xl" aria-label={tx("Selected homes comparison", "ရွေးထားသောအိမ်များ နှိုင်းယှဉ်မှု")}>
      <span className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold"><Check className="size-5 rounded-full bg-[#0A67FF] p-1 text-white" />{properties.length} {tx("selected", "ရွေးထား")}</span>
      <div className="hidden items-center gap-1.5 min-[390px]:flex">{properties.slice(0, 3).map((property) => <span key={property.id} className="relative size-10 overflow-hidden rounded-[10px] border border-white shadow-sm"><Image src={property.images[0]} alt="" fill sizes="40px" className="object-cover" /></span>)}<span className="grid size-10 place-items-center rounded-[10px] bg-[#F1F5FB] text-[#0A67FF]"><Plus className="size-5" /></span></div>
      <Link href="/compare" className="ml-auto inline-flex h-11 items-center justify-center gap-2 rounded-[15px] bg-[#0A67FF] px-3.5 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(10,103,255,.2)]"><Scale className="size-4" />{tx(`Compare ${properties.length} homes`, `အိမ် ${properties.length} လုံး နှိုင်းယှဉ်`)}</Link>
    </aside>
  );
}

export { SavedJourney };

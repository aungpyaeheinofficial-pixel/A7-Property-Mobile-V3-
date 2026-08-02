"use client";

import { Bell, BellRing, Check, Heart, MapPin, Scale, Search, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MobilePropertyCard, SectionHeading } from "@/components/mobile/a7-mobile-ui";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { readSavedSearches, updateSavedSearchNotifications, type SavedSearchRecord } from "@/lib/saved-searches";
import { cn } from "@/lib/utils";

const priceDrops: Record<string, number> = {
  "MM-PROP-005": 20_000_000,
  "MM-PROP-012": 50_000,
};

function SavedJourney() {
  const { isMyanmar, tx } = useLanguage();
  const [savedIds, setSavedIds] = useState(mockUser.savedPropertyIds);
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);
  const { comparisonIds, toggleProperty, maxComparisonHomes } = usePropertyComparison();

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => {
      setSavedIds(stored);
      setSavedSearches(readSavedSearches());
    });

    function syncSavedSearches(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === STORAGE_KEYS.savedSearches) setSavedSearches(readSavedSearches());
    }
    window.addEventListener("a7:stored-json-change", syncSavedSearches);
    return () => window.removeEventListener("a7:stored-json-change", syncSavedSearches);
  }, []);

  const savedHomes = useMemo(
    () => savedIds.map((id) => allProperties.find((property) => property.id === id)).filter((item): item is Property => Boolean(item)),
    [savedIds],
  );
  const recommendations = useMemo(() => {
    const current = new Set(savedIds);
    return allProperties
      .filter((property) => !current.has(property.id) && property.verification_status === "verified")
      .sort((a, b) => Number(mockUser.preferredTownships.includes(b.township)) - Number(mockUser.preferredTownships.includes(a.township)) || b.rating - a.rating)
      .slice(0, 3);
  }, [savedIds]);

  function toggleSaved(property: Property) {
    const next = savedIds.includes(property.id) ? savedIds.filter((id) => id !== property.id) : [...savedIds, property.id];
    setSavedIds(next);
    writeStoredIds(STORAGE_KEYS.saved, next);
  }

  function toggleAlert(id: string) {
    const current = savedSearches.find((item) => item.id === id);
    if (!current) return;
    setSavedSearches(updateSavedSearchNotifications(id, !current.notificationsEnabled));
  }

  const feature = savedHomes[0];
  const hasPriceDrop = savedHomes.filter((property) => priceDrops[property.id]);

  return (
    <div className="min-h-screen bg-[#F8F3F0] pb-28 text-[#111827] lg:pb-16">
      <header className="sticky top-0 z-50 border-b border-[#E6E3DC]/80 bg-[#F8F3F0]/92 backdrop-blur-2xl">
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="A7 Property home"><A7Brand /></Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/search?purpose=rent" className="grid size-11 place-items-center rounded-full border border-[#DDDAD2] bg-white text-[#014BAA] shadow-sm" aria-label={tx("Find homes", "အိမ်ရှာရန်")}><Search className="size-[18px]" /></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <section className="pb-8 pt-9 sm:pb-10 sm:pt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#64748B]">{tx("Your home journey", "သင့်အိမ်ခရီးစဉ်")}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[38px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[50px]">{tx("Homes you love", "သင်နှစ်သက်သောအိမ်များ")}</h1>
              <p className="mt-3 text-[13px] text-[#69736F]">{tx(`${savedHomes.length} homes saved for your next chapter`, `သင့်အတွက် အိမ် ${savedHomes.length} လုံး သိမ်းထားသည်`)}</p>
            </div>
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-[#EEF5FC] px-3 text-[10px] font-semibold text-[#014BAA]"><ShieldCheck className="size-4" />{tx("Private to you", "သင်တစ်ဦးတည်းသာမြင်နိုင်")}</span>
          </div>
        </section>

        {feature ? (
          <section className="grid overflow-hidden rounded-[20px] border border-[#E6E2DA] bg-white shadow-[0_4px_20px_rgba(0,0,0,.08)] lg:grid-cols-[1.25fr_.75fr]">
            <div className="relative min-h-[330px] overflow-hidden bg-[#E9E7E1] sm:min-h-[440px]">
              <Link href={`/properties/${feature.id}`} className="absolute inset-0 z-10" aria-label={`View ${feature.title}`} />
              <Image src={feature.images[0]} alt={feature.title} fill priority sizes="(max-width: 1023px) 100vw, 62vw" className="object-cover transition-transform duration-300 hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/70 via-transparent to-black/10" />
              <span className="absolute left-4 top-4 z-20 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/94 px-3 text-[9px] font-semibold text-[#014BAA] shadow-sm backdrop-blur"><ShieldCheck className="size-3.5" />{tx("Verified home", "စိစစ်ထားသောအိမ်")}</span>
              <button type="button" onClick={() => toggleSaved(feature)} className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full bg-white/94 text-[#014BAA] shadow-lg" aria-label={tx("Remove saved home", "သိမ်းထားမှုမှဖယ်ရန်")}><Heart className="size-5 fill-current" /></button>
              <div className="absolute inset-x-5 bottom-5 z-20 text-white"><p className="flex items-center gap-1.5 text-[11px]"><MapPin className="size-4 text-[#B9D3FA]" />{feature.township}, {feature.city}</p><h2 className="mt-2 text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">{feature.title}</h2></div>
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-9">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#64748B]">{tx("Your first choice", "သင့်ပထမဆုံးရွေးချယ်မှု")}</p>
                <p className="mt-4 text-[28px] font-semibold tracking-[-0.045em] text-[#014BAA]">{formatPropertyPrice(feature, isMyanmar ? "my" : "en")}<span className="ml-1 text-[11px] font-normal text-[#78817C]">{feature.purpose === "rent" ? tx("/ month", "/ လ") : ""}</span></p>
                <div className="mt-6 grid grid-cols-3 divide-x divide-[#E8E5DE] rounded-[20px] bg-[#F5F3EE] p-4 text-center">
                  <span><strong className="block text-[14px]">{feature.bedrooms}</strong><small className="mt-1 block text-[9px] text-[#747D78]">{tx("Beds", "အိပ်ခန်း")}</small></span>
                  <span><strong className="block text-[14px]">{feature.bathrooms}</strong><small className="mt-1 block text-[9px] text-[#747D78]">{tx("Baths", "ရေချိုးခန်း")}</small></span>
                  <span><strong className="block text-[14px]">{feature.area_sqft}</strong><small className="mt-1 block text-[9px] text-[#747D78]">sqft</small></span>
                </div>
              </div>
              <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <button type="button" onClick={() => toggleProperty(feature)} disabled={!comparisonIds.includes(feature.id) && comparisonIds.length >= maxComparisonHomes} className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#C9D8E7] bg-white px-4 text-[10px] font-semibold text-[#014BAA] disabled:cursor-not-allowed disabled:opacity-45", comparisonIds.includes(feature.id) && "border-[#173B66] bg-[#173B66] text-white")} aria-pressed={comparisonIds.includes(feature.id)}>{comparisonIds.includes(feature.id) ? <Check className="size-4" /> : <Scale className="size-4" />}{comparisonIds.includes(feature.id) ? tx("Selected", "ရွေးပြီး") : tx("Compare", "နှိုင်းယှဉ်")}</button>
                <Link href={`/properties/${feature.id}`} className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#014BAA] px-5 text-[12px] font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,.08)]">{tx("View this home", "ဤအိမ်ကိုကြည့်ရန်")}</Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[20px] border border-dashed border-[#B9D3FA] bg-white px-6 py-14 text-center"><Heart className="mx-auto size-8 text-[#014BAA]" /><h2 className="mt-4 text-2xl font-semibold">{tx("Your shortlist is ready when you are", "သင့်စိတ်ကြိုက်စာရင်းကို စတင်နိုင်ပါပြီ")}</h2><Link href="/search?purpose=rent" className="mt-5 inline-flex h-11 items-center rounded-[14px] bg-[#014BAA] px-5 text-[12px] font-semibold text-white">{tx("Explore homes", "အိမ်များရှာဖွေရန်")}</Link></section>
        )}

        {savedHomes.length > 1 && <section className="py-12 lg:py-16"><SectionHeading title={tx("Your saved homes", "သိမ်းထားသောအိမ်များ")} /><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{savedHomes.slice(1).map((property) => <MobilePropertyCard key={property.id} property={property} saved onToggleSaved={toggleSaved} compared={comparisonIds.includes(property.id)} compareDisabled={!comparisonIds.includes(property.id) && comparisonIds.length >= maxComparisonHomes} onToggleCompare={toggleProperty} />)}</div></section>}

        <div className="grid gap-6 pb-12 lg:grid-cols-2 lg:pb-16">
          <section className="rounded-[20px] border border-[#E5E2DB] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.08)] sm:p-7">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]"><BellRing className="size-[19px]" /></span><div><h2 className="text-[22px] font-semibold">{tx("Saved searches", "သိမ်းထားသောရှာဖွေမှုများ")}</h2><p className="mt-1 text-[10px] text-[#737C77]">{tx("New homes, without the constant checking", "အိမ်အသစ်များကို အလိုအလျောက် အသိပေးမည်")}</p></div></div>
            <div className="mt-5 divide-y divide-[#ECE9E3]">{savedSearches.map((search) => <div key={search.id} className="flex items-center gap-3 py-4"><Link href={search.href} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F3F1EC] text-[#64748B]" aria-label={tx(`Open ${search.title}`, `${search.title} ကိုဖွင့်ရန်`)}><Search className="size-4" /></Link><Link href={search.href} className="min-w-0 flex-1"><strong className="block truncate text-[12px]">{search.title}</strong><small className="mt-1 block truncate text-[9px] text-[#78817C]">{search.detail} · {search.count} {tx("homes", "အိမ်")}</small></Link><button type="button" role="switch" aria-checked={search.notificationsEnabled} onClick={() => toggleAlert(search.id)} className="relative h-11 w-12 shrink-0" aria-label={`${search.title} alerts`}><span className={`absolute inset-x-0 top-2 h-7 rounded-full transition-colors ${search.notificationsEnabled ? "bg-[#014BAA]" : "bg-[#D4D8D4]"}`} /><span className={`absolute top-3 size-5 rounded-full bg-white shadow-sm transition-transform ${search.notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} /></button></div>)}</div>
          </section>

          <section className="rounded-[20px] border border-[#E5E2DB] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.08)] sm:p-7">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]"><TrendingDown className="size-[19px]" /></span><div><h2 className="text-[22px] font-semibold">{tx("Price alerts", "ဈေးနှုန်းအသိပေးချက်")}</h2><p className="mt-1 text-[10px] text-[#737C77]">{tx("A good moment to look again", "ပြန်ကြည့်ရန် အချိန်ကောင်း")}</p></div></div>
            <div className="mt-5 space-y-3">{hasPriceDrop.length ? hasPriceDrop.map((property) => <Link key={property.id} href={`/properties/${property.id}`} className="flex items-center gap-3 rounded-[14px] bg-[#F8F3F0] p-3 transition-colors hover:bg-[#EEF5FC]"><div className="relative size-14 shrink-0 overflow-hidden rounded-[14px]"><Image src={property.images[0]} alt="" fill sizes="56px" className="object-cover" /></div><span className="min-w-0 flex-1"><strong className="block truncate text-[12px]">{property.title}</strong><small className="mt-1 block text-[9px] text-[#64748B]">{tx("Price reduced by", "ဈေးနှုန်းလျှော့ထားသည်")} {new Intl.NumberFormat("en-US").format(priceDrops[property.id])} MMK</small></span><Bell className="size-4 text-[#014BAA]" /></Link>) : <p className="rounded-[14px] bg-[#F8F3F0] p-4 text-[11px] text-[#64748B]">{tx("We’ll let you know when a saved home changes price.", "သိမ်းထားသောအိမ် ဈေးပြောင်းသည့်အခါ အသိပေးပါမည်။")}</p>}</div>
          </section>
        </div>

        <section className="border-t border-[#E7E3DB] py-12"><div className="flex items-center gap-2 text-[#64748B]"><Sparkles className="size-4" /><p className="text-[10px] font-semibold uppercase tracking-[.16em]">{tx("Because of what you saved", "သင်သိမ်းထားမှုအပေါ်အခြေခံ၍")}</p></div><h2 className="mt-2 text-[28px] font-semibold tracking-[-0.045em]">{tx("You may also love", "သင်နှစ်သက်နိုင်သောအိမ်များ")}</h2><div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">{recommendations.map((property) => <MobilePropertyCard key={property.id} property={property} saved={false} onToggleSaved={toggleSaved} compared={comparisonIds.includes(property.id)} compareDisabled={!comparisonIds.includes(property.id) && comparisonIds.length >= maxComparisonHomes} onToggleCompare={toggleProperty} className="snap-start" />)}</div></section>
      </main>
    </div>
  );
}

export { SavedJourney };

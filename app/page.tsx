"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Check,
  Heart,
  LocateFixed,
  MapPin,
  Maximize2,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { A7AssistantPopover } from "@/components/assistant/a7-assistant-popover";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { IntentNavigation, intentLinks } from "@/components/layout/intent-navigation";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { MyanmarPrice } from "@/components/ui/myanmar-price";
import { Sheet } from "@/components/ui/sheet";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { countLabel } from "@/lib/utils";
import properties from "@/data/properties.json";

type Purpose = "rent" | "sale";

const townships = [
  { name: "Bahan", note: "Quiet streets · Central Yangon", noteMy: "တိတ်ဆိတ်သောလမ်းများ · ရန်ကုန်မြို့လယ်", image: "/images/properties/jade-residence-exterior.jpg", homes: 48 },
  { name: "Kamayut", note: "Hledan · Universities · Easy commute", noteMy: "လှည်းတန်း · တက္ကသိုလ်များ · သွားလာလွယ်", image: "/images/properties/warm-living-room.jpg", homes: 36 },
  { name: "Yankin", note: "Modern homes · Family-friendly", noteMy: "ခေတ်မီအိမ်များ · မိသားစုနှင့်သင့်တော်", image: "/images/properties/hero-yangon-home.jpg", homes: 31 },
  { name: "Sanchaung", note: "Local food · Lively neighbourhood", noteMy: "စားသောက်ဆိုင်များ · စည်ကားသောရပ်ကွက်", image: "/images/properties/family-house.jpg", homes: 29 },
];

const homeSeekerStories = [
  {
    quote: "The photos matched the home, the price was clear, and I knew who I was speaking with before arranging a visit.",
    quoteMy: "ဓာတ်ပုံတွေက အိမ်အတိုင်းတကယ်မှန်တယ်၊ ဈေးနှုန်းလည်းရှင်းပြီး အိမ်ကြည့်ချိန်မချိန်းခင် ဘယ်သူနဲ့ဆက်သွယ်နေလဲ သိရတယ်။",
    name: "Thiri",
    journey: "Found a rental in Yankin",
    journeyMy: "ရန်ကင်းတွင် ငှားရန်အိမ်တွေ့ရှိခဲ့သည်",
  },
  {
    quote: "I could compare homes without chasing agents for basic details. My shortlist finally felt manageable.",
    quoteMy: "အခြေခံအချက်အလက်တွေအတွက် အကျိုးဆောင်တွေနောက်လိုက်စရာမလိုဘဲ အိမ်တွေကို နှိုင်းယှဉ်နိုင်ခဲ့တယ်။",
    name: "Min Khant",
    journey: "First-time buyer in Yangon",
    journeyMy: "ရန်ကုန်ရှိ ပထမဆုံးအိမ်ဝယ်သူ",
  },
  {
    quote: "Moving cities felt less overwhelming because I could understand each neighbourhood before I arrived.",
    quoteMy: "မရောက်ခင်ကတည်းက ရပ်ကွက်တစ်ခုချင်းစီကို နားလည်နိုင်လို့ မြို့ပြောင်းရတာ ပိုလွယ်ကူခဲ့တယ်။",
    name: "May",
    journey: "Relocated to Mandalay",
    journeyMy: "မန္တလေးသို့ ပြောင်းရွှေ့နေထိုင်ခဲ့သည်",
  },
];

const featuredProperties = properties.filter((property) => property.verification_status === "verified").slice(0, 4);
type HomeProperty = (typeof properties)[number];

const homeSearchLocations = [
  { label: "Yangon", value: "Yangon", detail: "City · 44 townships" },
  { label: "Mandalay", value: "Mandalay", detail: "City · Central Myanmar" },
  { label: "Bahan", value: "Bahan", detail: "Township · Central Yangon" },
  { label: "Kamayut", value: "Kamayut", detail: "Township · Yangon" },
  { label: "Yankin", value: "Yankin", detail: "Township · Yangon" },
  { label: "Sanchaung", value: "Sanchaung", detail: "Township · Yangon" },
  { label: "Mayangone", value: "Mayangone", detail: "Township · Yangon" },
  { label: "Hledan", value: "Kamayut", detail: "Landmark · Kamayut, Yangon" },
  { label: "Myanmar Plaza", value: "Bahan", detail: "Landmark · Bahan, Yangon" },
  { label: "Inya Lake", value: "Kamayut", detail: "Landmark · Yangon" },
];

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.14 },
  transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const },
};

export default function HomePage() {
  const { isMyanmar, tx } = useLanguage();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [purpose, setPurpose] = useState<Purpose>("rent");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const reveal = reduceMotion ? {} : fadeUp;

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved);
    if (stored.length) queueMicrotask(() => setSaved(stored));
  }, []);

  function changePurpose(next: Purpose) {
    setPurpose(next);
  }

  function toggleSaved(id: string) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeStoredIds(STORAGE_KEYS.saved, next);
      return next;
    });
  }

  function buildSearchUrl(nextLocation = location) {
    const params = new URLSearchParams({ purpose });
    const normalizedLocation = nextLocation.trim();
    if (normalizedLocation && normalizedLocation !== "All Myanmar") params.set("location", normalizedLocation);
    return `/search?${params.toString()}`;
  }

  function runSearch(nextLocation = location) {
    router.push(buildSearchUrl(nextLocation));
  }

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-[#FCFCFA] pb-16 text-[#172B3F] md:pb-0">
      <header className="sticky top-0 z-50 h-[76px] border-b border-[#172B3F]/7 bg-white/82 shadow-[0_1px_0_rgba(255,255,255,.9)] backdrop-blur-2xl">
        <div className="mx-auto flex h-full max-w-[1480px] items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="A7 Property home"><A7Brand showMyanmar={isMyanmar} /></Link>
          <IntentNavigation className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2">
            <A7AssistantPopover labelClassName="hidden min-[400px]:inline" />
            <LanguageSwitcher className="hidden sm:block" />
            <LanguageSwitcher compact className="sm:hidden" />
            <Link href="/dashboard?section=saved" className="relative hidden h-10 items-center gap-2 rounded-full px-3 text-xs font-medium hover:bg-[#F6F8FC] sm:flex">
              <AnimatedIcon icon="ph:heart-bold" size="sm" hover="scale" />{tx("Saved", "သိမ်းထားသည်")}{saved.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#006AFF] text-[10px] text-white">{saved.length}</span>}
            </Link>
            <Link href="/sign-in" className="grid size-10 place-items-center rounded-xl border border-[#DCE4ED] bg-white text-[#29445F] shadow-sm" aria-label={tx("Sign in", "အကောင့်ဝင်ရန်")}>
              <AnimatedIcon icon="ph:user-circle-bold" size="md" hover="scale" iconClassName="size-5" />
            </Link>
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileMenu(true)} aria-label={tx("Open navigation", "လမ်းညွှန်မီနူး ဖွင့်ရန်")}>
              <AnimatedIcon icon="ph:list-bold" size="md" hover="none" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={mobileMenu} onOpenChange={setMobileMenu} title={tx("Explore A7 Property", "A7 Property ကို လေ့လာပါ")} side="right">
        <nav className="flex flex-col p-5 text-sm font-medium">
          <div className="grid gap-2">
            {intentLinks.map((item) => {
              const Icon = item.icon;
              const description = item.id === "rent"
                ? tx("Browse verified rentals", "စိစစ်ထားသော ငှားရန်အိမ်များကို ကြည့်ပါ")
                : item.id === "buy"
                  ? tx("Explore homes for sale", "ရောင်းရန်အိမ်များကို ရှာဖွေပါ")
                  : tx("List and manage a property", "အိမ်ကို စာရင်းတင်ပြီး စီမံပါ");
              return (
                <Link key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#DCE4ED] bg-white p-3.5 shadow-sm transition-colors hover:border-[#9FC4FF] hover:bg-[#F7FAFF]" href={item.href} onClick={() => setMobileMenu(false)}>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#EAF2FF] text-[#006AFF]"><Icon className="size-[18px]" /></span>
                  <span><strong className="block text-sm">{isMyanmar ? item.labelMy : item.label}</strong><small className="mt-1 block text-[10px] font-normal text-[#667486]">{description}</small></span>
                </Link>
              );
            })}
          </div>
          <Link className="mt-5 flex items-center gap-3 border-b border-[#E1E4E8] py-4" href="/assistant" onClick={() => setMobileMenu(false)}>
            <AnimatedIcon icon="ph:sparkles-bold" size="sm" variant="solid" hover="scale" />{tx("AI home assistant", "AI အိမ်ရှာဖွေရေးအကူ")}
          </Link>
          <Link className="flex items-center gap-3 border-b border-[#E1E4E8] py-4" href="/dashboard?section=saved" onClick={() => setMobileMenu(false)}>
            <AnimatedIcon icon="ph:heart-bold" size="sm" variant="solid" hover="scale" />{tx("Saved homes", "သိမ်းထားသောအိမ်များ")}
          </Link>
        </nav>
      </Sheet>

      <main>
        <section className="relative min-h-[610px] overflow-visible bg-[#0C2133] lg:min-h-[660px]">
          <div className="absolute inset-0 overflow-hidden">
            <Image src="/images/properties/hero-yangon-home.jpg" alt={tx("Contemporary Yangon home surrounded by a tropical garden", "စိမ်းလန်းသောဥယျာဉ်ဖြင့် ဝန်းရံထားသည့် ရန်ကုန်ရှိ ခေတ်မီအိမ်")} fill priority sizes="100vw" className="object-cover object-[67%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,32,.95)_0%,rgba(5,20,32,.8)_34%,rgba(5,20,32,.35)_66%,rgba(5,20,32,.08)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,20,32,.42)_0%,transparent_52%,rgba(5,20,32,.08)_100%)]" />
          </div>

          <motion.div className="relative z-30 mx-auto flex min-h-[610px] max-w-[1380px] flex-col justify-center px-5 pb-14 pt-12 sm:px-8 lg:min-h-[660px] lg:px-12 xl:px-16" initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <span className="inline-flex w-fit items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/76">
              <AnimatedIcon icon="ph:shield-check-bold" size="xs" hover="none" iconClassName="text-[#8FC0FF]" />{tx("Verified homes across Myanmar", "မြန်မာနိုင်ငံတစ်ဝန်း စိစစ်ထားသောအိမ်များ")}
            </span>
            <h1 className="mt-6 max-w-[850px] text-[48px] font-semibold leading-[.92] tracking-[-0.064em] text-white sm:text-[68px] xl:text-[84px]">{isMyanmar ? "ကိုယ့်အိမ်လို ခံစားရမယ့် နေရာကို ရှာဖွေပါ။" : <>Find a home that feels <span className="font-serif font-normal italic tracking-[-0.045em] text-[#A9CCFF]">like yours.</span></>}</h1>
            <p className="mt-5 max-w-[620px] text-[14px] leading-6 text-white/74 sm:mt-6 sm:text-[16px] sm:leading-7">{tx("One trusted place to discover beautiful homes, clear prices, and people you can feel confident speaking with.", "လှပသောအိမ်များ၊ ရှင်းလင်းသောဈေးနှုန်းများနှင့် ယုံကြည်စိတ်ချရသော အိမ်ရှင်များကို တစ်နေရာတည်းတွင် ရှာဖွေပါ။")}</p>
            <HomeSearchPanel purpose={purpose} location={location} reduceMotion={reduceMotion} onPurposeChange={changePurpose} onLocationChange={setLocation} onSearch={runSearch} />
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 border-b border-[#172B3F]/10 py-7 sm:flex-row sm:items-center sm:justify-between lg:py-9">
            <p className="max-w-xs text-[12px] font-semibold leading-5 text-[#172B3F]">{tx("A simpler, safer way to discover your next home.", "သင့်နောက်အိမ်ကို ပိုလွယ်ကူပြီး လုံခြုံစွာ ရှာဖွေပါ။")}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-[#65717E]">
              {(isMyanmar ? ["ဓာတ်ပုံအစစ်များ စိစစ်ထားသည်", "ဆက်သွယ်သူများ အတည်ပြုထားသည်", "ဈေးနှုန်းရှင်းလင်းသည်", "အိမ်ရှာသူများအတွက် အခမဲ့"] : ["Real photos reviewed", "Verified contacts", "Clear prices", "Free for home seekers"]).map((item) => <span key={item} className="inline-flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-[#E8F6ED] text-[#28744B]"><Check className="size-3" strokeWidth={2.5} /></span>{item}</span>)}
            </div>
          </div>
        </section>

        <motion.section className="mx-auto grid max-w-[1380px] gap-12 overflow-hidden px-4 py-20 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:gap-16 lg:px-8 lg:py-28" {...reveal}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#006AFF]">{tx("Made personal with every save", "သိမ်းလိုက်တိုင်း သင့်အကြိုက်ကို ပိုနားလည်လာသည်")}</p>
            <h2 className="mt-4 max-w-[620px] text-[40px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[54px]">{tx("A shortlist that learns what home means to you.", "သင့်အတွက် အိမ်ဆိုတာဘာလဲကို နားလည်လာမယ့် စိတ်ကြိုက်စာရင်း။")}</h2>
            <p className="mt-6 max-w-[560px] text-[14px] leading-7 text-[#65717E] sm:text-[15px]">{tx("Save a few places you like. A7 brings forward homes that fit your preferred neighbourhoods, budget, space, and the details you keep returning to.", "သင်ကြိုက်သည့်အိမ်အချို့ကို သိမ်းထားပါ။ A7 က သင်နှစ်သက်သောရပ်ကွက်၊ ဘတ်ဂျက်၊ နေရာအကျယ်နှင့် လိုအပ်ချက်များကိုက်ညီသည့်အိမ်များကို ရွေးချယ်ပေးမည်။")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/search?purpose=rent" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#172B3F] px-5 text-[13px] font-semibold !text-white shadow-[0_10px_24px_rgba(23,43,63,.16)]">{tx("Start your shortlist", "စိတ်ကြိုက်စာရင်း စတင်မယ်")} <ArrowRight className="size-4" /></Link>
              <Link href="/dashboard?section=saved" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#C9D3DE] bg-white px-5 text-[13px] font-semibold text-[#172B3F]"><Heart className="size-4 text-[#006AFF]" />{tx("View saved homes", "သိမ်းထားသောအိမ်များ ကြည့်မယ်")}</Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[10px] text-[#778390]"><AnimatedIcon icon="ph:shield-check-bold" size="sm" hover="none" iconClassName="text-[#2B704F]" />{tx("Recommendations use your home preferences—not private account data.", "အကြံပြုချက်များသည် ကိုယ်ရေးအချက်အလက်မဟုတ်ဘဲ သင့်အိမ်အကြိုက်များကိုသာ အသုံးပြုသည်။")}</p>
          </div>

          <div className="relative min-h-[470px] sm:min-h-[560px]" aria-label={tx("Personalized home recommendations preview", "သင့်အတွက်ရွေးချယ်ထားသော အိမ်အကြံပြုချက်များ")}>
            <div className="absolute left-[3%] top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#CDE0FF] bg-white px-4 py-2.5 text-[10px] font-semibold text-[#006AFF] shadow-[0_10px_30px_rgba(23,43,63,.12)]"><AnimatedIcon icon="ph:sparkles-fill" size="sm" hover="none" />{tx("Recommended from your saved homes", "သိမ်းထားသောအိမ်များအပေါ် မူတည်၍ အကြံပြုထားသည်")}</div>
            {featuredProperties.slice(0, 3).map((property, index) => {
              const cardStyles = [
                "left-[20%] top-[11%] z-0 rotate-[5deg] opacity-55",
                "left-[11%] top-[17%] z-10 -rotate-[3deg] opacity-80",
                "left-[2%] top-[25%] z-20 rotate-0",
              ];
              return (
                <article key={property.id} className={`absolute w-[86%] max-w-[520px] overflow-hidden rounded-[24px] border border-[#172B3F]/10 bg-white shadow-[0_24px_65px_rgba(23,43,63,.18)] transition-transform duration-500 hover:-translate-y-2 ${cardStyles[index]}`}>
                  <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={`View recommended home ${property.title}`} />
                  <div className="relative h-[220px] overflow-hidden bg-[#EAF2FF] sm:h-[270px]">
                    <Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 82vw, 44vw" className="object-cover" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-2 text-[9px] font-semibold uppercase tracking-[.08em] text-[#2B704F] backdrop-blur"><AnimatedIcon icon="ph:shield-check-bold" size="xs" hover="none" />{tx("Verified match", "စိစစ်ထားသော ကိုက်ညီမှု")}</span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4"><span className="flex items-baseline gap-1.5"><MyanmarPrice price={property.price} purpose={property.purpose} className="text-[20px] font-semibold" />{property.purpose === "rent" && <span className="text-[11px] font-medium text-[#687684]">/ {tx("month", "လ")}</span>}</span><Heart className="size-5 fill-[#006AFF] text-[#006AFF]" /></div>
                    <h3 className="mt-3 truncate text-[14px] font-semibold">{property.title}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#687684]"><MapPin className="size-3.5 text-[#006AFF]" />{property.township}, {property.city} · {countLabel(property.bedrooms, "bed")}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </motion.section>

        <motion.section className="mx-auto max-w-[1480px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24" {...reveal}>
          <SectionHeading eyebrow={tx("Explore Yangon", "ရန်ကုန်ကို လေ့လာပါ")} title={tx("Find your neighbourhood", "သင့်အတွက်သင့်တော်သော ရပ်ကွက်ကိုရှာပါ")} description={tx("Discover places by the way you want to live—not only by a pin on a map.", "မြေပုံပေါ်ကနေရာတစ်ခုအဖြစ်သာမဟုတ်ဘဲ သင်နေထိုင်လိုသည့်ပုံစံအတိုင်း ရပ်ကွက်များကို ရှာဖွေပါ။")} href="/search?location=Yangon" linkLabel={tx("View all locations", "နေရာအားလုံးကြည့်ရန်")} />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {townships.map((township) => (
              <motion.button key={township.name} type="button" className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#EAF2FF] text-left shadow-[0_4px_16px_rgba(42,42,51,.08)]" onClick={() => router.push(buildSearchUrl(township.name))} whileHover={reduceMotion ? undefined : { y: -5 }} transition={{ duration: 0.22 }}>
                <Image src={township.image} alt={tx(`${township.name} neighbourhood`, `${township.name} ရပ်ကွက်`)} fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.045]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/85 via-[#101820]/12 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0B2034]/88 px-3 py-2 text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(5,20,32,.28)] backdrop-blur-xl"><span className="size-1.5 rounded-full bg-[#75AFFF]" />{township.homes} {tx("homes", "အိမ်")}</span>
                <span className="absolute bottom-0 left-0 right-0 p-5 text-white"><strong className="block text-xl font-semibold tracking-[-0.03em]">{township.name}</strong><small className="mt-1.5 block text-xs text-white/75">{isMyanmar ? township.noteMy : township.note}</small><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold">{tx("Explore", "လေ့လာမယ်")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        <section className="bg-[#F6F8FC] py-20 lg:py-28" id="featured">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <motion.div {...reveal}><SectionHeading eyebrow={tx("Handpicked for you", "သင့်အတွက်ရွေးချယ်ထားသည်")} title={tx("Homes worth seeing", "ကြည့်သင့်တဲ့အိမ်များ")} description={tx("Verified homes with complete details and owners who reply.", "အချက်အလက်ပြည့်စုံပြီး အကြောင်းပြန်သောအိမ်ရှင်များပါရှိသည့် စိစစ်ထားသောအိမ်များ။")} href="/search" linkLabel={tx("Explore all homes", "အိမ်အားလုံးကြည့်ရန်")} /></motion.div>
            <div className="mt-9 grid gap-5 lg:grid-cols-[1.18fr_.82fr]">
              <motion.div {...reveal}><EditorialPropertyCard property={featuredProperties[0]} primary isFavorite={saved.includes(featuredProperties[0].id)} onFavoriteToggle={toggleSaved} /></motion.div>
              <div className="grid gap-4">
                {featuredProperties.slice(1).map((property, index) => <motion.div key={property.id} {...reveal} transition={reduceMotion ? undefined : { ...fadeUp.transition, delay: index * 0.06 }}><EditorialPropertyCard property={property} isFavorite={saved.includes(property.id)} onFavoriteToggle={toggleSaved} /></motion.div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F1F0EC] py-20 lg:py-28" id="verified">
          <div className="mx-auto grid max-w-[1380px] gap-12 px-4 sm:px-6 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-20 lg:px-8">
            <motion.div className="relative min-h-[500px] overflow-hidden rounded-[28px] bg-[#DCE6EE] shadow-[0_20px_55px_rgba(23,43,63,.13)] sm:min-h-[620px] lg:rounded-[34px]" {...reveal}>
              <Image src="/images/properties/family-house.jpg" alt={tx("Verified family home in a quiet Yangon neighbourhood", "ရန်ကုန်ရှိ တိတ်ဆိတ်သောရပ်ကွက်မှ စိစစ်ထားသည့် မိသားစုအိမ်")} fill sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2235]/62 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[20px] border border-white/25 bg-[#0C2133]/82 p-5 text-white shadow-[0_16px_36px_rgba(7,22,34,.24)] backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-[330px]">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#A9CCFF]"><AnimatedIcon icon="ph:shield-check-bold" size="sm" hover="none" />{tx("A7 reviewed", "A7 စိစစ်ပြီး")}</span>
                <p className="mt-3 text-[13px] leading-6 text-white/82">{tx("Photos, essential details, owner contact and availability checked before you enquire.", "မမေးမြန်းမီ ဓာတ်ပုံများ၊ အဓိကအချက်အလက်များ၊ အိမ်ရှင်ဆက်သွယ်ရန်နှင့် လက်ရှိရရှိနိုင်မှုကို စိစစ်ထားသည်။")}</p>
              </div>
            </motion.div>

            <motion.div {...reveal}>
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#2B704F]">{tx("Trust, built into every search", "ရှာဖွေမှုတိုင်းတွင် ယုံကြည်မှုပါဝင်သည်")}</p>
              <h2 className="mt-4 max-w-[680px] text-[39px] font-semibold leading-[1.03] tracking-[-0.052em] sm:text-[54px]">{tx("Feel confident before you step through the door.", "အိမ်တံခါးမဝင်ခင်ကတည်းက ယုံကြည်စိတ်ချပါ။")}</h2>
              <p className="mt-6 max-w-[620px] text-[14px] leading-7 text-[#65717E] sm:text-[16px]">{tx("We review the details that usually create doubt, so your attention stays on the home—not on chasing missing information.", "သံသယဖြစ်စေတတ်သော အချက်အလက်များကို ကျွန်ုပ်တို့စိစစ်ထားသောကြောင့် သင်က ပျောက်နေသောအချက်အလက်များနောက်လိုက်မနေဘဲ အိမ်ကိုသာအာရုံစိုက်နိုင်သည်။")}</p>
              <div className="mt-8 border-y border-[#172B3F]/10">
                {(isMyanmar ? [
                  { title: "ဘယ်သူနဲ့ပြောနေလဲ သိပါ", text: "ဖုန်းနှင့် ကိုယ်ရေးအတည်ပြုချက်များက အိမ်ရှင်နှင့် အကျိုးဆောင်များကို ပိုယုံကြည်စွာ ဆက်သွယ်နိုင်စေသည်။" },
                  { title: "အိမ်ကို ရှင်းလင်းစွာကြည့်ပါ", text: "ဓာတ်ပုံ၊ နေရာ၊ ဈေးနှုန်းနှင့် အဓိကအချက်များ ပြည့်စုံမှုရှိမရှိ စိစစ်ထားသည်။" },
                  { title: "သက်တမ်းလွန်စာရင်းများကို ရှောင်ပါ", text: "လက်ရှိရရှိနိုင်မှုကို ပုံမှန်ပြန်စစ်ပေးသောကြောင့် မရှိတော့သောအိမ်များအတွက် အချိန်မကုန်စေပါ။" },
                ] : [
                  { title: "Know who you’re speaking with", text: "Phone and identity signals help you approach owners and agents with more confidence." },
                  { title: "See the home clearly", text: "Photos, location, price and essential facts are reviewed for completeness." },
                  { title: "Avoid stale listings", text: "Availability is refreshed so you spend less time enquiring about homes that are gone." },
                ]).map((item) => (
                  <div key={item.title} className="grid gap-2 border-b border-[#172B3F]/10 py-5 last:border-b-0 sm:grid-cols-[190px_1fr] sm:gap-6">
                    <strong className="text-[13px] font-semibold leading-5 text-[#172B3F]">{item.title}</strong>
                    <p className="text-[12px] leading-5 text-[#697581]">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/search" className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#006AFF]">{tx("Explore verified homes", "စိစစ်ထားသောအိမ်များ ကြည့်မယ်")} <ArrowRight className="size-4" /></Link>
            </motion.div>
          </div>
        </section>

        <motion.section className="mx-auto max-w-[1380px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28" {...reveal}>
          <div className="max-w-[760px]">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#006AFF]">{tx("Home seeker stories", "အိမ်ရှာသူများ၏ အတွေ့အကြုံ")}</p>
            <h2 className="mt-4 text-[38px] font-semibold leading-[1.04] tracking-[-0.052em] sm:text-[52px]">{tx("Finding home should feel clear, personal, and hopeful.", "အိမ်ရှာဖွေခြင်းက ရှင်းလင်း၊ ကိုယ်ပိုင်ဆန်ပြီး မျှော်လင့်ချက်ရှိသင့်သည်။")}</h2>
          </div>
          <div className="mt-12 grid gap-10 border-t border-[#172B3F]/10 pt-10 md:grid-cols-3 md:gap-0">
            {homeSeekerStories.map((story) => (
              <article key={story.name} className="flex min-h-[260px] flex-col border-[#172B3F]/10 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
                <span className="font-serif text-[54px] leading-none text-[#8CB8F4]">“</span>
                <p className="mt-4 text-[17px] leading-8 tracking-[-0.018em] text-[#263A4D]">{isMyanmar ? story.quoteMy : story.quote}</p>
                <div className="mt-auto flex items-center gap-3 pt-8">
                  <span className="grid size-10 place-items-center rounded-full bg-[#172B3F] text-[11px] font-semibold text-white">{story.name.slice(0, 1)}</span>
                  <span><strong className="block text-[12px] font-semibold">{story.name}</strong><small className="mt-1 block text-[10px] text-[#73808C]">{isMyanmar ? story.journeyMy : story.journey}</small></span>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28" id="assistant" {...reveal}>
          <div className="grid overflow-hidden rounded-[30px] bg-[#10283D] text-white shadow-[0_24px_70px_rgba(16,40,61,.18)] lg:grid-cols-[1.02fr_.98fr] lg:rounded-[38px]">
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20">
              <span className="inline-flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[.13em] text-[#9FC4FF]"><AnimatedIcon icon="ph:sparkles-fill" size="sm" hover="none" />{tx("Ask A7 AI", "A7 AI ကိုမေးမယ်")}</span>
              <h2 className="mt-5 max-w-[640px] text-[40px] font-semibold leading-[1.02] tracking-[-0.052em] sm:text-[56px]">{tx("Tell us how life should feel at home.", "သင့်အိမ်မှာ ဘယ်လိုနေထိုင်ချင်လဲ ပြောပြပါ။")}</h2>
              <p className="mt-6 max-w-[600px] text-[14px] leading-7 text-white/68 sm:text-[15px]">{tx("Describe the commute, budget, light, space or neighbourhood you want. A7 turns it into a focused shortlist with reasons that make sense.", "လိုချင်သော သွားလာရေး၊ ဘတ်ဂျက်၊ အလင်းရောင်၊ နေရာအကျယ် သို့မဟုတ် ရပ်ကွက်ကို ဖော်ပြပါ။ A7 က အကြောင်းပြချက်ရှင်းလင်းသော စိတ်ကြိုက်စာရင်းအဖြစ် ပြောင်းပေးမည်။")}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {(isMyanmar ? ["အလုပ်နီးပေမယ့် တိတ်ဆိတ်တဲ့နေရာ", "၈ သိန်းအောက် မိသားစုအိမ်", "ရန်ကင်းက အလင်းရောင်ကောင်းတဲ့တိုက်ခန်း"] : ["Near work, but quiet", "Family home under 8 သိန်း", "Bright apartment in Yankin"]).map((prompt) => <Link key={prompt} href="/assistant" className="rounded-full border border-white/16 bg-white/7 px-4 py-2.5 text-[11px] font-medium text-white/84 transition-colors hover:bg-white/12 hover:text-white">{prompt}</Link>)}
              </div>
              <Link href="/assistant" className="mt-9 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold !text-[#10283D] shadow-[0_10px_28px_rgba(0,0,0,.15)] transition-transform hover:-translate-y-0.5">{tx("Start with Ask A7 AI", "A7 AI နဲ့ စတင်မယ်")} <ArrowRight className="size-4" /></Link>
            </div>
            <div className="relative min-h-[440px] overflow-hidden lg:min-h-[620px]">
              <Image src="/images/properties/warm-living-room.jpg" alt={tx("Warm, light-filled living room recommended by A7", "A7 အကြံပြုထားသော အလင်းရောင်ကောင်းပြီး နွေးထွေးသည့်ဧည့်ခန်း")} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10283D]/52 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#10283D]/30 lg:to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[20px] border border-white/30 bg-white/92 p-4 text-[#172B3F] shadow-[0_18px_45px_rgba(8,25,39,.24)] backdrop-blur-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-[340px]">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.1em] text-[#2D7D46]"><AnimatedIcon icon="ph:shield-check-bold" size="xs" hover="none" />{tx("A7 match · Verified", "A7 ကိုက်ညီမှု · စိစစ်ပြီး")}</span>
                <strong className="mt-2 block text-[15px] font-semibold tracking-[-0.02em]">{tx("Bright 2-bed home in Yankin", "ရန်ကင်းရှိ အလင်းရောင်ကောင်းသော အိပ်ခန်း ၂ ခန်းပါအိမ်")}</strong>
                <span className="mt-1.5 block text-[11px] text-[#667486]">{tx("Quiet street · Natural light · 8 သိန်း/month", "တိတ်ဆိတ်သောလမ်း · သဘာဝအလင်းရောင် · တစ်လ ၈ သိန်း")}</span>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="relative min-h-[460px] overflow-hidden rounded-[30px] bg-[#10283D] sm:min-h-[520px] lg:rounded-[38px]">
            <Image src="/images/properties/jade-residence-exterior.jpg" alt={tx("A welcoming residence in Yangon", "ရန်ကုန်ရှိ နွေးထွေးစွာကြိုဆိုသည့် လူနေအိမ်")} fill sizes="100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,24,38,.9)_0%,rgba(7,24,38,.66)_48%,rgba(7,24,38,.2)_100%)]" />
            <div className="relative flex min-h-[460px] max-w-[790px] flex-col justify-center p-8 text-white sm:min-h-[520px] sm:p-12 lg:p-16 xl:p-20">
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#A9CCFF]">{tx("Your home journey starts here", "သင့်အိမ်ခရီးစဉ် ဒီနေရာက စတင်သည်")}</p>
              <h2 className="mt-5 text-[42px] font-semibold leading-[1.01] tracking-[-0.055em] sm:text-[60px]">{tx("Your next home could be one search away.", "သင့်နောက်အိမ်က ရှာဖွေမှုတစ်ချက်အကွာမှာ ရှိနိုင်တယ်။")}</h2>
              <p className="mt-5 max-w-[600px] text-[14px] leading-7 text-white/72">{tx("Explore verified homes across Myanmar and save the places that already feel a little like yours.", "မြန်မာနိုင်ငံတစ်ဝန်းရှိ စိစစ်ထားသောအိမ်များကို လေ့လာပြီး ကိုယ့်အိမ်လို ခံစားရသည့်နေရာများကို သိမ်းထားပါ။")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/search?purpose=rent" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#006AFF] px-5 text-[13px] font-semibold !text-white shadow-[0_10px_28px_rgba(0,106,255,.28)]">{tx("Find a rental", "ငှားရန်အိမ်ရှာမယ်")} <ArrowRight className="size-4" /></Link>
                <Link href="/search?purpose=sale" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/32 bg-white/10 px-5 text-[13px] font-semibold !text-white backdrop-blur-md">{tx("Explore homes for sale", "ရောင်းရန်အိမ်များ ကြည့်မယ်")}</Link>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-b border-[#172B3F]/10 pb-8 text-[12px] text-[#667486] sm:flex-row sm:items-center sm:justify-between">
            <span>{tx("Own a home you’d like someone to love?", "တစ်ယောက်ယောက် ကြိုက်နှစ်သက်မယ့်အိမ် ပိုင်ဆိုင်ပါသလား။")}</span>
            <Link href="/owner?create=1" className="inline-flex items-center gap-2 font-semibold text-[#006AFF]">{tx("List your property with A7", "သင့်အိမ်ကို A7 တွင် စာရင်းတင်မယ်")} <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#172B3F] text-white/70">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.8fr_repeat(3,1fr)] lg:px-8">
          <div>
            <A7Brand inverted />
            <p className="mt-5 max-w-xs text-xs leading-6">{tx("A simpler, safer way to discover verified homes across Myanmar.", "မြန်မာနိုင်ငံတစ်ဝန်းရှိ စိစစ်ထားသောအိမ်များကို ပိုလွယ်ကူ၊ လုံခြုံစွာ ရှာဖွေပါ။")}</p>
            <div className="mt-5"><LanguageSwitcher menuAlign="left" /></div>
            <div className="mt-5 flex gap-2">
              <a href="#" aria-label="Facebook" className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/60 transition-colors hover:bg-[#1877F2] hover:text-white"><AnimatedIcon icon="ph:facebook-logo-bold" size="sm" hover="scale" /></a>
              <a href="#" aria-label="Messenger" className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/60 transition-colors hover:bg-[#0084FF] hover:text-white"><AnimatedIcon icon="ph:chat-circle-bold" size="sm" hover="scale" /></a>
              <a href="#" aria-label="Viber" className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/60 transition-colors hover:bg-[#7360F2] hover:text-white"><AnimatedIcon icon="ph:phone-bold" size="sm" hover="scale" /></a>
              <a href="#" aria-label="Telegram" className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/60 transition-colors hover:bg-[#2AABEE] hover:text-white"><AnimatedIcon icon="ph:paper-plane-tilt-bold" size="sm" hover="scale" /></a>
              <a href="#" aria-label="YouTube" className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/60 transition-colors hover:bg-[#FF0000] hover:text-white"><AnimatedIcon icon="ph:youtube-logo-bold" size="sm" hover="scale" /></a>
              <a href="#" aria-label="Google" className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/60 transition-colors hover:bg-white hover:text-[#4285F4]"><AnimatedIcon icon="ph:google-logo-bold" size="sm" hover="scale" /></a>
            </div>
          </div>
          <FooterLinks title={tx("Discover", "ရှာဖွေပါ")} links={[{ label: tx("Rent a home", "အိမ်ငှားမယ်"), href: "/search?purpose=rent" }, { label: tx("Buy a home", "အိမ်ဝယ်မယ်"), href: "/search?purpose=sale" }, { label: tx("Popular locations", "လူကြိုက်များသောနေရာများ"), href: "/search" }, { label: tx("AI home assistant", "AI အိမ်ရှာဖွေရေးအကူ"), href: "/assistant" }]} />
          <FooterLinks title={tx("List with us", "A7 နှင့် စာရင်းတင်ပါ")} links={[{ label: tx("List a property", "အိမ်စာရင်းတင်မယ်"), href: "/owner?create=1" }, { label: tx("Owner dashboard", "အိမ်ရှင်စာမျက်နှာ"), href: "/owner" }, { label: tx("Agent tools", "အကျိုးဆောင်ကိရိယာများ"), href: "/agent" }, { label: tx("Verification", "စိစစ်အတည်ပြုခြင်း"), href: "#verified" }]} />
          <FooterLinks title="A7 Property" links={[{ label: tx("Trust & safety", "ယုံကြည်မှုနှင့် လုံခြုံရေး"), href: "#verified" }, { label: tx("Help centre", "အကူအညီစင်တာ"), href: "/help" }, { label: tx("Saved homes", "သိမ်းထားသောအိမ်များ"), href: "/dashboard?section=saved" }, { label: tx("Contact", "ဆက်သွယ်ရန်"), href: "/assistant" }]} />
        </div>
        <div className="mx-auto flex max-w-[1380px] flex-col gap-3 border-t border-white/10 px-6 py-6 text-[11px] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>{tx("© 2026 A7 Property. Built with care for Myanmar.", "© 2026 A7 Property။ မြန်မာနိုင်ငံအတွက် ဂရုတစိုက် ဖန်တီးထားသည်။")}</span><span className="flex gap-5"><Link href="/privacy">{tx("Privacy", "ကိုယ်ရေးအချက်အလက်")}</Link><Link href="/terms">{tx("Terms", "စည်းမျဉ်းများ")}</Link><Link href="/community">{tx("Community standards", "လူမှုအသိုင်းအဝိုင်းစံနှုန်းများ")}</Link></span></div>
      </footer>

      <nav className="fixed inset-x-2 bottom-2 z-50 grid h-[66px] grid-cols-5 rounded-[22px] border border-[#172B3F]/10 bg-white/92 p-1.5 shadow-[0_14px_36px_rgba(23,43,63,.18)] backdrop-blur-2xl md:hidden" aria-label={tx("Mobile navigation", "မိုဘိုင်း လမ်းညွှန်")}>
        {[{ id: "home", label: "Home", labelMy: "ပင်မ", href: "/", iconName: "ph:house-bold" }, ...intentLinks.map(i => ({ id: i.id, label: i.label, labelMy: i.labelMy, href: i.href, iconName: i.iconName })), { id: "saved", label: "Saved", labelMy: "သိမ်းထား", href: "/dashboard?section=saved", iconName: "ph:heart-bold" }].map((item) => { const active = item.id === "home"; return <Link key={item.id} href={item.href} aria-current={active ? "page" : undefined} className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition-[transform,background-color,color] duration-200 active:scale-[.94] ${active ? "bg-[#EAF2FF] text-[#006AFF]" : "text-[#667486]"}`}><AnimatedIcon icon={item.iconName} size="sm" hover="none" iconClassName="size-[18px]" />{isMyanmar ? item.labelMy : item.label}{item.id === "saved" && saved.length > 0 && <span className="absolute right-[18%] top-1 grid size-4 place-items-center rounded-full bg-[#006AFF] text-[8px] text-white">{saved.length}</span>}</Link>; })}
      </nav>
    </div>
  );
}

interface HomeSearchPanelProps {
  purpose: Purpose;
  location: string;
  reduceMotion: boolean | null;
  onPurposeChange: (purpose: Purpose) => void;
  onLocationChange: (value: string) => void;
  onSearch: (location?: string) => void;
}

function HomeSearchPanel({ purpose, location, reduceMotion, onPurposeChange, onLocationChange, onSearch }: HomeSearchPanelProps) {
  const { tx } = useLanguage();
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const normalizedQuery = location.trim().toLowerCase();
  const suggestions = (normalizedQuery
    ? homeSearchLocations.filter((item) => `${item.label} ${item.value} ${item.detail}`.toLowerCase().includes(normalizedQuery))
    : homeSearchLocations
  ).slice(0, 6);

  useEffect(() => {
    function handleOutsidePress(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSuggestionsOpen(false);
    }
    document.addEventListener("pointerdown", handleOutsidePress);
    return () => document.removeEventListener("pointerdown", handleOutsidePress);
  }, []);

  function chooseLocation(item: (typeof homeSearchLocations)[number]) {
    onLocationChange(item.label);
    setSuggestionsOpen(false);
    onSearch(item.value);
  }

  function submitSearch(event?: FormEvent) {
    event?.preventDefault();
    const exact = homeSearchLocations.find((item) => item.label.toLowerCase() === normalizedQuery);
    const contextual = homeSearchLocations.find((item) => normalizedQuery.includes(item.label.toLowerCase()));
    const match = exact ?? contextual;
    if (match) onLocationChange(match.label);
    setSuggestionsOpen(false);
    onSearch(match?.value ?? location);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionsOpen(true);
      if (suggestions.length) setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter" && suggestionsOpen && suggestions[activeIndex]) {
      event.preventDefault();
      chooseLocation(suggestions[activeIndex]);
    }
    if (event.key === "Escape") setSuggestionsOpen(false);
  }

  return (
    <motion.form className="relative z-20 mt-8 max-w-[720px]" onSubmit={submitSearch} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <div className="mb-3 inline-flex rounded-full border border-white/18 bg-[#071C2D]/50 p-1 shadow-[0_8px_24px_rgba(3,14,24,.16)] backdrop-blur-xl" role="tablist" aria-label={tx("Search purpose", "ရှာဖွေမှုအမျိုးအစား")}>
          {(["rent", "sale"] as const).map((item) => {
            const selected = purpose === item;
            return (
              <button key={item} type="button" role="tab" aria-selected={selected} className={`relative h-10 min-w-[86px] rounded-full px-5 text-xs font-medium transition-colors ${selected ? "text-[#172B3F]" : "text-white/70 hover:text-white"}`} onClick={() => onPurposeChange(item)}>
                {selected && <motion.span layoutId="home-search-purpose" className="absolute inset-0 rounded-full bg-white shadow-[0_8px_20px_rgba(3,14,24,.16)]" transition={{ type: "spring", stiffness: 440, damping: 34 }} />}
                <span className="relative z-10">{item === "rent" ? tx("Rent", "ငှားရန်") : tx("Buy", "ဝယ်ရန်")}</span>
              </button>
            );
          })}
      </div>

      <div ref={searchRef} className="relative">
        <label className="flex h-[68px] items-center gap-3 rounded-[18px] border-2 border-white bg-white px-2.5 shadow-[0_18px_50px_rgba(3,14,24,.32)] transition-shadow focus-within:border-[#79B0FF] focus-within:shadow-[0_0_0_4px_rgba(0,106,255,.2),0_22px_58px_rgba(3,14,24,.34)] sm:h-[76px] sm:px-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl text-[#006AFF] sm:size-11"><MapPin className="size-5 sm:size-[22px]" /></span>
          <input
            role="combobox"
            aria-label={tx("Search by address, township, city or landmark", "လိပ်စာ၊ မြို့နယ်၊ မြို့ သို့မဟုတ် အထင်ကရနေရာဖြင့် ရှာရန်")}
            aria-expanded={suggestionsOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={suggestionsOpen && suggestions[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#172B3F] placeholder:font-normal placeholder:text-[#8A96A3] focus-visible:!outline-none sm:text-[16px]"
            placeholder={tx("Address, township, city or landmark", "လိပ်စာ၊ မြို့နယ်၊ မြို့ သို့မဟုတ် အထင်ကရနေရာ")}
            value={location}
            onFocus={() => setSuggestionsOpen(true)}
            onChange={(event) => { onLocationChange(event.target.value); setActiveIndex(0); setSuggestionsOpen(true); }}
            onKeyDown={handleKeyDown}
          />
          {location && <button type="button" className="grid size-9 shrink-0 place-items-center rounded-full text-[#6B7078] hover:bg-[#F1F3F6]" aria-label={tx("Clear search", "ရှာဖွေမှု ရှင်းရန်")} onClick={() => { onLocationChange(""); setActiveIndex(0); setSuggestionsOpen(true); }}><X className="size-4" /></button>}
          <motion.button type="submit" className="inline-flex h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#006AFF] px-3 !text-white shadow-[0_10px_24px_rgba(0,106,255,.28)] transition-[transform,background-color] hover:bg-[#005EE5] sm:h-14 sm:px-5" aria-label={tx("Search homes", "အိမ်များရှာရန်")} whileTap={reduceMotion ? undefined : { scale: 0.96 }}><Search className="size-5" strokeWidth={2.5} /><span className="hidden text-xs font-medium sm:inline">{tx("Search homes", "အိမ်ရှာမယ်")}</span></motion.button>
        </label>

        {suggestionsOpen && (
          <div id={listboxId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 max-h-[220px] overflow-y-auto overscroll-contain rounded-2xl border border-[#172B3F]/10 bg-white p-2 text-[#172B3F] shadow-[0_24px_65px_rgba(7,20,32,.3)] sm:max-h-[340px]">
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#F1F6FF]" onClick={() => { onLocationChange(""); setSuggestionsOpen(false); onSearch("All Myanmar"); }}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF2FF] text-[#006AFF]"><LocateFixed className="size-5" /></span>
              <span><strong className="block text-sm font-semibold">{tx("Browse all Myanmar", "မြန်မာနိုင်ငံတစ်ဝန်း ရှာဖွေပါ")}</strong><span className="mt-0.5 block text-[11px] text-[#6B7078]">{tx("See every available A7 verified home", "လက်ရှိရရှိနိုင်သော A7 စိစစ်ပြီးအိမ်အားလုံး ကြည့်ပါ")}</span></span>
            </button>
            <div className="mx-3 my-1 border-t border-[#E8EAED]" />
            {suggestions.length ? suggestions.map((item, index) => (
              <button
                id={`${listboxId}-${index}`}
                key={`${item.label}-${item.detail}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${index === activeIndex ? "bg-[#F1F6FF]" : "hover:bg-[#F6F8FC]"}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseLocation(item)}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#F1F6FF] text-[#006AFF]"><MapPin className="size-[18px]" /></span>
                <span><strong className="block text-sm font-semibold">{item.label}</strong><span className="mt-0.5 block text-[11px] text-[#6B7078]">{tx(item.detail, item.detail.replace("City", "မြို့").replace("Township", "မြို့နယ်").replace("Landmark", "အထင်ကရနေရာ").replace("Central Myanmar", "မြန်မာနိုင်ငံအလယ်ပိုင်း"))}</span></span>
              </button>
            )) : (
              <div className="px-4 py-5 text-sm text-[#6B7078]">{tx("No matching location yet. Press Search to explore your request.", "ကိုက်ညီသောနေရာ မတွေ့သေးပါ။ ဆက်ရှာရန် အိမ်ရှာမယ်ကို နှိပ်ပါ။")}</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-[10px] text-white/62 sm:text-[11px]">
        <span>{tx("Popular:", "လူကြိုက်များသောနေရာများ:")}</span>
        {["Bahan", "Kamayut", "Yankin"].map((item) => <button key={item} type="button" onClick={() => { onLocationChange(item); onSearch(item); }} className="rounded-full border border-white/16 bg-white/8 px-3 py-1.5 font-medium text-white/88 backdrop-blur transition-colors hover:bg-white/16 hover:text-white">{item}</button>)}
        <Link href="/assistant" className="ml-auto hidden items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-[#B7D3FF] transition-colors hover:bg-white/10 sm:inline-flex"><AnimatedIcon icon="ph:sparkles-fill" size="xs" hover="none" />{tx("Describe it to A7 AI", "လိုချင်တာကို A7 AI အား ပြောမယ်")}</Link>
      </div>
    </motion.form>
  );
}

function EditorialPropertyCard({ property, primary = false, isFavorite, onFavoriteToggle }: { property: HomeProperty; primary?: boolean; isFavorite: boolean; onFavoriteToggle: (id: string) => void }) {
  const { tx } = useLanguage();
  const href = `/properties/${property.id}`;

  if (primary) {
    return (
      <article className="group relative min-h-[560px] overflow-hidden rounded-[26px] bg-[#172B3F] shadow-[0_12px_36px_rgba(23,43,63,.16)] lg:min-h-[626px]">
        <Link href={href} className="absolute inset-0 z-10 rounded-[26px] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#78A9FF]" aria-label={tx(`View ${property.title}`, `${property.title} ကို ကြည့်ရန်`)} />
        <Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/92 via-[#101820]/12 to-[#101820]/12" />
        <div className="absolute left-5 top-5 flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/88 px-3 py-2 text-[11px] font-semibold text-[#006AFF] backdrop-blur"><AnimatedIcon icon="ph:shield-check-bold" size="sm" hover="none" />{tx("Verified home", "စိစစ်ထားသောအိမ်")}</span><span className="rounded-full bg-[#172B3F]/70 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur">{tx("Featured", "အထူးရွေးချယ်ထားသည်")}</span></div>
        <button type="button" className={`absolute right-5 top-5 z-20 grid size-11 place-items-center rounded-full border border-white/40 bg-white/90 shadow-sm backdrop-blur ${isFavorite ? "text-[#006AFF]" : "text-[#202124]"}`} aria-label={isFavorite ? tx(`Remove ${property.title} from saved homes`, `${property.title} ကို သိမ်းထားမှုမှဖယ်ရန်`) : tx(`Save ${property.title}`, `${property.title} ကို သိမ်းရန်`)} aria-pressed={isFavorite} onClick={() => onFavoriteToggle(property.id)}><Heart className="size-5" fill={isFavorite ? "currentColor" : "none"} /></button>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/72"><MapPin className="size-4 text-[#9FC4FF]" />{property.township}, {property.city}</p>
          <h3 className="mt-3 max-w-2xl text-[28px] font-semibold leading-8 tracking-[-0.04em] sm:text-[34px] sm:leading-10">{property.title}</h3>
          <div className="mt-5 flex flex-col gap-4 border-t border-white/20 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div><MyanmarPrice price={property.price} purpose={property.purpose} className="text-2xl font-semibold" /><span className="ml-2 text-xs text-white/65">{property.purpose === "rent" ? tx("/ month", "/ လ") : tx("total", "စုစုပေါင်း")}</span><div className="mt-3 flex gap-4 text-xs text-white/78"><span className="inline-flex items-center gap-1.5"><BedDouble className="size-4" />{tx(countLabel(property.bedrooms, "bed"), `အိပ်ခန်း ${property.bedrooms}`)}</span><span className="inline-flex items-center gap-1.5"><Bath className="size-4" />{tx(countLabel(property.bathrooms, "bath"), `ရေချိုးခန်း ${property.bathrooms}`)}</span><span className="inline-flex items-center gap-1.5"><Maximize2 className="size-4" />{property.area_sqft.toLocaleString()} sqft</span></div></div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#B7D3FF]">{tx("Explore this home", "ဒီအိမ်ကို ကြည့်မယ်")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative grid min-h-[198px] overflow-hidden rounded-2xl border border-[#D7DADE] bg-white shadow-[0_3px_12px_rgba(42,42,51,.06)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#006AFF]/35 hover:shadow-[0_10px_26px_rgba(42,42,51,.1)] sm:grid-cols-[42%_58%]">
      <Link href={href} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#006AFF]/35" aria-label={tx(`View ${property.title}`, `${property.title} ကို ကြည့်ရန်`)} />
      <div className="relative min-h-[190px] overflow-hidden bg-[#EAF2FF]"><Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 640px) 100vw, 36vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" /><span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1.5 text-[10px] font-semibold text-[#006AFF] backdrop-blur"><AnimatedIcon icon="ph:shield-check-bold" size="xs" hover="none" />{tx("Verified", "စိစစ်ပြီး")}</span></div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex items-start justify-between gap-3"><span><MyanmarPrice price={property.price} purpose={property.purpose} className="text-xl font-semibold" /><small className="mt-1 block text-[11px] text-[#6B7078]">{property.purpose === "rent" ? tx("per month", "တစ်လလျှင်") : tx("total price", "စုစုပေါင်းဈေးနှုန်း")}</small></span><button type="button" className={`relative z-20 grid size-9 shrink-0 place-items-center rounded-full border border-[#D7DADE] bg-white ${isFavorite ? "text-[#006AFF]" : "text-[#59616A]"}`} aria-label={isFavorite ? tx(`Remove ${property.title} from saved homes`, `${property.title} ကို သိမ်းထားမှုမှဖယ်ရန်`) : tx(`Save ${property.title}`, `${property.title} ကို သိမ်းရန်`)} aria-pressed={isFavorite} onClick={() => onFavoriteToggle(property.id)}><Heart className="size-[17px]" fill={isFavorite ? "currentColor" : "none"} /></button></div>
        <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-5 tracking-[-0.02em] group-hover:text-[#0057D9]">{property.title}</h3>
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#59616A]"><MapPin className="size-3.5 text-[#006AFF]" />{property.township}, {property.city}</p>
        <div className="mt-auto flex flex-wrap gap-3 pt-4 text-[11px] font-medium text-[#59616A]"><span>{tx(countLabel(property.bedrooms, "bed"), `အိပ်ခန်း ${property.bedrooms}`)}</span><span>{tx(countLabel(property.bathrooms, "bath"), `ရေချိုးခန်း ${property.bathrooms}`)}</span><span>{property.area_sqft.toLocaleString()} sqft</span></div>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description, href, linkLabel }: { eyebrow: string; title: string; description: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#006AFF]">{eyebrow}</p><h2 className="mt-3 text-[34px] font-semibold tracking-[-0.045em] sm:text-[44px]">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#59616A]">{description}</p></div><Link href={href} className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[#006AFF]">{linkLabel}<ArrowRight className="size-4" /></Link></div>
  );
}

function FooterLinks({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return <div className="flex flex-col gap-3 text-xs"><strong className="mb-1 text-sm text-white">{title}</strong>{links.map((item) => <Link key={item.label} href={item.href} className="transition-colors hover:text-white">{item.label}</Link>)}</div>;
}

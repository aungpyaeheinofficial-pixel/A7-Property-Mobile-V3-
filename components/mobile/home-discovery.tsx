"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, MapPin, MessageCircle, Search, SlidersHorizontal, Sparkles, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MobilePropertyCard, SectionHeading, SegmentedControl } from "@/components/mobile/a7-mobile-ui";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { useToast } from "@/components/ui/toast-provider";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { a7Motion } from "@/lib/motion";
import { allProperties, sortProperties, type Property } from "@/lib/properties";

const townshipMeta = [
  { name: "Bahan", subtitle: "Quiet streets", subtitleMy: "တိတ်ဆိတ်သောလမ်းများ" },
  { name: "Kamayut", subtitle: "City convenience", subtitleMy: "မြို့ပြသွားလာလွယ်" },
  { name: "Yankin", subtitle: "Family friendly", subtitleMy: "မိသားစုနှင့်သင့်တော်" },
  { name: "Hlaing", subtitle: "Easy commute", subtitleMy: "သွားလာရေးကောင်း" },
];

function HomeDiscovery() {
  const { tx, isMyanmar } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const stickySearchRef = useRef(false);
  const [purpose, setPurpose] = useState<"rent" | "sale">("rent");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(mockUser.savedPropertyIds);
  const [stickySearch, setStickySearch] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState("");
  const { scrollY } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(heroProgress, [0, 1], [0, 88]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextStickyState = latest > 470;
    if (nextStickyState === stickySearchRef.current) return;
    stickySearchRef.current = nextStickyState;
    setStickySearch(nextStickyState);
  });

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => setSaved(stored));
  }, []);

  const recommended = useMemo(() => sortProperties(allProperties.filter((property) => property.verification_status === "verified" && property.purpose === purpose), "recommended").slice(0, 6), [purpose]);
  const recent = useMemo(() => mockUser.recentlyViewedIds.map((id) => allProperties.find((property) => property.id === id)).filter((item): item is Property => Boolean(item)), []);
  const greetingName = user?.fullName?.split(" ")[0] || "Thiri";

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

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ purpose });
    if (query.trim()) params.set("location", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  function submitAssistant(event: FormEvent) {
    event.preventDefault();
    const question = assistantQuery.trim();
    router.push(question ? `/assistant?question=${encodeURIComponent(question)}` : "/assistant");
  }

  const revealTransition = reduceMotion ? { duration: 0 } : a7Motion.slow;

  return (
    <div className="a7-page overflow-hidden pb-28 lg:pb-0">
      <header className="a7-glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:h-[78px] lg:px-8">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : a7Motion.base}><Link href="/" aria-label="A7 Property home"><A7Brand /></Link></motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={reduceMotion ? { duration: 0 } : a7Motion.base} className="ml-auto flex items-center gap-1">
            <Link href="/messages" className="hidden size-11 place-items-center rounded-full text-[#52605C] hover:bg-[#EEF5FC] sm:grid" aria-label={tx("Messages", "စာများ")}><MessageCircle className="size-[19px]" /></Link>
            <LanguageSwitcher compact />
            <Link href={user ? "/profile" : "/sign-in"} className="grid size-11 place-items-center rounded-full border border-a7-line bg-white text-a7-blue shadow-[var(--shadow-hairline)]" aria-label={user ? tx("Open profile", "ပရိုဖိုင်ဖွင့်ရန်") : tx("Sign in", "အကောင့်ဝင်ရန်")}><UserRound className="size-[19px]" /></Link>
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {stickySearch && (
          <motion.form initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={reduceMotion ? { duration: 0 } : a7Motion.base} onSubmit={submitSearch} className="a7-glass fixed inset-x-4 top-[78px] z-40 flex h-14 items-center gap-2 rounded-[var(--radius-control)] p-1.5 pl-4 shadow-[var(--shadow-lifted)] lg:hidden" role="search">
            <Search className="size-[18px] shrink-0 text-[#0057D9]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={tx("Sticky home search", "အမြဲမြင်ရသော အိမ်ရှာဖွေမှု")} placeholder={tx("Township or landmark", "မြို့နယ် သို့မဟုတ် နေရာ")} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#969D99]" />
            <button type="submit" className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-[#0057D9] text-white" aria-label={tx("Search homes", "အိမ်များရှာရန်")}><ArrowRight className="size-4" /></button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.main initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={reduceMotion ? { duration: 0 } : a7Motion.slow}>
        <section ref={heroRef} className="relative mx-auto max-w-[1320px] px-3 pt-3 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative min-h-[540px] overflow-hidden rounded-[var(--radius-sheet)] bg-a7-navy shadow-[var(--shadow-soft)] sm:min-h-[590px] lg:min-h-[590px]">
            <motion.div style={{ y: reduceMotion ? 0 : heroImageY, willChange: "transform" }} className="absolute -inset-y-12 inset-x-0">
              <motion.div initial={reduceMotion ? false : { scale: 1.035 }} animate={{ scale: 1 }} transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                <ProgressiveImage src="/images/properties/hero-yangon-home.jpg" alt={tx("Premium home in Yangon", "ရန်ကုန်ရှိ အရည်အသွေးမြင့်အိမ်")} fill priority sizes="100vw" className="object-cover object-center lg:object-[65%_center]" skeletonClassName="bg-[#C9D0D3]" />
              </motion.div>
            </motion.div>
            <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.55 }} className="absolute inset-0 bg-gradient-to-r from-a7-navy/90 via-a7-navy/58 to-a7-navy/15" />

            <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.09, delayChildren: reduceMotion ? 0 : 0.16 } } }} className="relative z-10 flex min-h-[540px] max-w-[720px] flex-col px-5 pb-5 pt-6 text-white sm:min-h-[590px] sm:px-10 sm:pb-10 sm:pt-10 lg:min-h-[590px] lg:px-14 lg:py-12">
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: revealTransition } }} className="flex items-center justify-between">
                <div><p className="text-[12px] font-medium text-white/70">{tx("Good morning", "မင်္ဂလာနံနက်ခင်းပါ")}</p><h1 className="mt-1 text-[24px] font-semibold tracking-[-0.035em] sm:text-[28px]">{greetingName}</h1></div>
                <button type="button" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/22 bg-white/12 px-3 text-[11px] font-semibold backdrop-blur-md"><MapPin className="size-4 text-[#B9D3FA]" />Yangon<ChevronDown className="size-3" /></button>
              </motion.div>

              <div className="mt-auto">
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: revealTransition } }} className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#B9D3FA]"><span className="size-1.5 rounded-full bg-[#B9D3FA]" />{tx("Home discovery, made personal", "သင့်အတွက် ရွေးချယ်ထားသော အိမ်ရှာဖွေမှု")}</motion.p>
                <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: revealTransition } }} className="max-w-[620px] text-[42px] font-bold leading-[.98] tracking-[-0.055em] sm:text-[56px] lg:text-[64px]">{tx("Find a home that feels like you.", "ကိုယ့်အိမ်လို ခံစားရမယ့်နေရာ။")}</motion.h2>
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: revealTransition } }} className="mt-3 max-w-[520px] text-[12px] leading-5 text-white/72 sm:mt-4 sm:text-[15px] sm:leading-6">{tx("Trusted homes, clear prices, and people you can feel confident speaking with.", "ယုံကြည်ရသောအိမ်များ၊ ရှင်းလင်းသောဈေးနှုန်းများနှင့် စိတ်ချစွာဆက်သွယ်နိုင်သူများ။")}</motion.p>

                <motion.form variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : a7Motion.slow } }} onSubmit={submitSearch} className="mt-5 rounded-[var(--radius-control)] border border-white/55 bg-white p-2 shadow-[var(--shadow-lifted)] sm:mt-6 sm:max-w-[640px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="ml-2 size-5 shrink-0 text-[#0057D9]" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={tx("Find your next home", "သင့်နောက်အိမ်ကို ရှာပါ")} placeholder={tx("Find your next home", "သင့်နောက်အိမ်ကို ရှာပါ")} className="h-12 min-w-0 flex-1 bg-transparent px-1 text-[14px] text-[#111827] outline-none placeholder:text-[#929A96]" />
                    <button type="submit" className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-[#0057D9] text-white shadow-[0_4px_20px_rgba(0,0,0,.08)] transition-colors duration-200 hover:bg-[#003F91]" aria-label={tx("Search homes", "အိမ်များရှာရန်")}><Search className="size-5" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 border-t border-[#ECE9E3] px-1 pt-2">
                    <button type="button" onClick={() => setPurpose("rent")} className={`h-11 rounded-[10px] text-[10px] font-semibold ${purpose === "rent" ? "bg-[#EEF5FC] text-[#0057D9]" : "text-[#6C7571]"}`}>{tx("Rent", "ငှားရန်")}</button>
                    <button type="button" onClick={() => setPurpose("sale")} className={`h-11 rounded-[10px] text-[10px] font-semibold ${purpose === "sale" ? "bg-[#EEF5FC] text-[#0057D9]" : "text-[#6C7571]"}`}>{tx("Buy", "ဝယ်ရန်")}</button>
                    <Link href={`/search?purpose=${purpose}`} className="flex h-11 items-center justify-center gap-1 rounded-[10px] text-[10px] font-semibold text-[#6C7571]"><SlidersHorizontal className="size-3.5" />{tx("Filters", "စစ်ထုတ်")}</Link>
                  </div>
                </motion.form>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <SectionHeading eyebrow={tx("Explore Yangon", "ရန်ကုန်ကို လေ့လာပါ")} title={tx("Popular locations", "လူကြိုက်များသောနေရာများ")} action={tx("See all", "အားလုံးကြည့်ရန်")} href="/search?location=Yangon" />
          <div className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
            {townshipMeta.map((item, index) => {
              const property = allProperties.find((candidate) => candidate.township === item.name) ?? allProperties[index];
              return (
                <motion.div key={item.name} initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.28 }} transition={reduceMotion ? { duration: 0 } : { ...a7Motion.slow, delay: index * 0.055 }} className="min-w-[168px] snap-start sm:min-w-0">
                  <Link href={`/search?purpose=rent&location=${item.name}`} className="group relative block overflow-hidden rounded-[20px]">
                    <div className="relative aspect-[4/5] bg-[#E8E6DF]"><ProgressiveImage src={property.images[0]} alt={`${item.name} neighbourhood`} fill sizes="(max-width: 640px) 168px, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-gradient-to-t from-[#111827]/78 via-transparent to-transparent" /></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white"><strong className="text-[16px] font-semibold">{item.name}</strong><p className="mt-1 text-[10px] text-white/70">{isMyanmar ? item.subtitleMy : item.subtitle}</p></div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-a7-line bg-[#F3F1ED] py-12 lg:py-16">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading eyebrow={tx("Chosen for you", "သင့်အတွက် ရွေးချယ်ထားသည်")} title={tx("Homes worth seeing", "ကြည့်သင့်တဲ့အိမ်များ")} />
              <SegmentedControl value={purpose} onChange={setPurpose} ariaLabel={tx("Property purpose", "အိမ်အမျိုးအစား")} options={[{ value: "rent", label: tx("Rent", "ငှားရန်") }, { value: "sale", label: tx("Buy", "ဝယ်ရန်") }]} className="w-full max-w-[240px]" />
            </div>
            <div className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 md:mx-0 md:grid md:grid-cols-3 md:px-0">
              {recommended.slice(0, 3).map((property, index) => (
                <motion.div key={property.id} initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.5, margin: "0px -12% 0px -12%" }} transition={reduceMotion ? { duration: 0 } : { ...a7Motion.slow, delay: index * 0.035 }} className="min-w-[86vw] snap-center md:min-w-0">
                  <MobilePropertyCard property={property} saved={saved.includes(property.id)} onToggleSaved={toggleSaved} priority={index === 0} className="min-w-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionHeading title={tx("Recently viewed", "မကြာသေးမီက ကြည့်ခဲ့သည်")} action={tx("Saved journey", "သိမ်းထားမှုကြည့်ရန်")} href="/saved" />
          <div className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {recent.map((property) => <MobilePropertyCard key={property.id} property={property} variant="compact" saved={saved.includes(property.id)} onToggleSaved={toggleSaved} className="snap-start" />)}
          </div>
        </section>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={reduceMotion ? { duration: 0 } : a7Motion.slow} className="mx-auto max-w-[1240px] px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <div className="a7-card relative overflow-hidden px-6 py-7 text-a7-navy sm:px-8 sm:py-8 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
            <div className="relative"><span className="inline-flex items-center gap-2 rounded-full bg-[#EEF5FC] px-3 py-1.5 text-[10px] font-semibold text-[#0057D9]"><Sparkles className="size-3.5" />A7 Assistant</span><h2 className="mt-4 text-[30px] font-semibold leading-[1.15] tracking-[-0.045em] sm:text-[38px]">{tx("Tell us what you need.", "သင်လိုချင်တာကို ပြောပါ။")}</h2><p className="mt-3 max-w-[650px] text-[13px] leading-6 text-[#64748B]">{tx("“I need a 2 bedroom condo near Hledan under 800,000 MMK.”", "“လှည်းတန်းအနီး ၈ သိန်းအောက် အိပ်ခန်း ၂ ခန်းကွန်ဒို လိုချင်တယ်။”")}</p></div>
            <Link href="/assistant" className="relative mt-6 inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#0057D9] px-5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-[#003F91] lg:mt-0"><Sparkles className="size-5" />{tx("Ask A7", "A7 ကိုမေးမယ်")}<ArrowRight className="size-4" /></Link>
          </div>
        </motion.section>
      </motion.main>

      <AnimatePresence mode="wait">
        {!assistantOpen ? (
          <motion.button key="ask-a7-button" layoutId="ask-a7-home" type="button" onClick={() => setAssistantOpen(true)} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={reduceMotion ? { duration: 0 } : a7Motion.fast} className="fixed bottom-[88px] right-4 z-[70] inline-flex h-11 items-center gap-2 rounded-full border border-white bg-a7-blue px-4 text-[11px] font-semibold text-white shadow-[var(--shadow-action)] lg:bottom-6" aria-label={tx("Ask A7 assistant about a home", "အိမ်အကြောင်း A7 အကူကိုမေးရန်")}><Sparkles className="size-4" />{tx("Ask A7", "A7 ကိုမေး")}</motion.button>
        ) : (
          <motion.aside key="ask-a7-panel" layoutId="ask-a7-home" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }} className="fixed bottom-[88px] left-4 right-4 z-[70] mx-auto max-w-[390px] rounded-[20px] border border-[#DCE4EC] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,.16)] lg:bottom-6 lg:left-auto lg:right-6 lg:w-[360px]">
            <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EEF5FC] text-[#0057D9]"><Sparkles className="size-4" /></span><div className="min-w-0 flex-1"><strong className="block text-[14px] font-semibold">Ask A7</strong><p className="mt-1 text-[10px] leading-4 text-[#69736F]">{tx("Describe the home you need in your own words.", "လိုချင်သောအိမ်ကို ကိုယ့်စကားဖြင့် ဖော်ပြပါ။")}</p></div><button type="button" onClick={() => setAssistantOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F4F2ED] text-[#66736F]" aria-label={tx("Close A7 assistant", "A7 အကူကိုပိတ်ရန်")}><X className="size-4" /></button></div>
            <form onSubmit={submitAssistant} className="mt-3 flex min-h-12 items-center gap-2 rounded-[14px] border border-[#DCD9D1] bg-[#FAFAF8] p-1.5 pl-3"><input autoFocus value={assistantQuery} onChange={(event) => setAssistantQuery(event.target.value)} aria-label={tx("Ask A7 a question", "A7 ကိုမေးရန်")} placeholder={tx("Condo near Hledan under 800K…", "လှည်းတန်းအနီး ၈ သိန်းအောက်…")} className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#969D99]" /><button type="submit" className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#0057D9] text-white" aria-label={tx("Send to A7", "A7 ထံပို့ရန်")}><ArrowRight className="size-4" /></button></form>
            <Link href="/assistant" className="mt-2 inline-flex h-11 items-center gap-1 text-[10px] font-semibold text-[#0057D9]">{tx("Open full assistant", "အကူအပြည့်အစုံဖွင့်ရန်")}<ArrowRight className="size-3.5" /></Link>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export { HomeDiscovery };

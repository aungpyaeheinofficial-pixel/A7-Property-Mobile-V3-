"use client";

import { Bell, Check, ChevronRight, Globe2, HelpCircle, LockKeyhole, MapPin, Pencil, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Sheet } from "@/components/ui/sheet";
import { readStoredIds, readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { cn } from "@/lib/utils";

type Journey = "rent" | "buy";
type SettingId = "notifications" | "language" | "privacy" | "help";

interface Preferences {
  journey: Journey;
  locations: string[];
  budget: string;
  propertyTypes: string[];
}

const defaultPreferences: Preferences = {
  journey: "rent",
  locations: ["Kamayut", "Sanchaung", "Hlaing"],
  budget: "500,000 – 1,500,000 MMK / month",
  propertyTypes: ["Condo", "Apartment"],
};

const locationOptions = ["Kamayut", "Sanchaung", "Hlaing", "Bahan", "Yankin", "Mayangone"];
const propertyTypeOptions = ["Condo", "Apartment", "House", "Mini condo"];

function ProfileExperience() {
  const { tx } = useLanguage();
  const [profile, setProfile] = useState({ name: mockUser.name, city: mockUser.city });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [preferenceDraft, setPreferenceDraft] = useState(defaultPreferences);
  const [profileOpen, setProfileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState<SettingId | null>(null);
  const [savedCount, setSavedCount] = useState(mockUser.savedPropertyIds.length);
  const [notifications, setNotifications] = useState({ saved: true, messages: true, viewings: true });

  useEffect(() => {
    const storedProfile = readStoredJson(STORAGE_KEYS.profile, { name: mockUser.name, city: mockUser.city });
    const storedPreferences = readStoredJson(STORAGE_KEYS.preferences, defaultPreferences);
    const storedSaved = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => {
      setProfile(storedProfile);
      setProfileDraft(storedProfile);
      setPreferences(storedPreferences);
      setPreferenceDraft(storedPreferences);
      setSavedCount(storedSaved.length);
    });
  }, []);

  function saveProfile() {
    setProfile(profileDraft);
    writeStoredJson(STORAGE_KEYS.profile, profileDraft);
    setProfileOpen(false);
  }

  function savePreferences() {
    setPreferences(preferenceDraft);
    writeStoredJson(STORAGE_KEYS.preferences, preferenceDraft);
    setPreferencesOpen(false);
  }

  function toggleLocation(location: string) {
    setPreferenceDraft((current) => ({ ...current, locations: current.locations.includes(location) ? current.locations.filter((item) => item !== location) : [...current.locations, location] }));
  }

  function toggleType(type: string) {
    setPreferenceDraft((current) => ({ ...current, propertyTypes: current.propertyTypes.includes(type) ? current.propertyTypes.filter((item) => item !== type) : [...current.propertyTypes, type] }));
  }

  return (
    <div className="min-h-screen bg-[#F8F3F0] pb-28 text-[#111827] lg:pb-16">
      <header className="sticky top-0 z-50 border-b border-[#E4E1DA] bg-[#F8F3F0]/94 backdrop-blur-2xl">
        <div className="mx-auto flex h-[70px] max-w-[1120px] items-center px-4 sm:px-6 lg:px-8"><Link href="/" aria-label="A7 Property home"><A7Brand /></Link><div className="ml-auto flex items-center gap-2"><LanguageSwitcher compact /><Link href="/search?purpose=rent" className="grid size-11 place-items-center rounded-full border border-[#DDDAD2] bg-white text-[#014BAA]" aria-label={tx("Search homes", "အိမ်ရှာရန်")}><Search className="size-[18px]" /></Link></div></div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="rounded-[20px] border border-[#E2DFD8] bg-white px-6 py-8 shadow-[0_4px_20px_rgba(0,0,0,.08)] sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative w-fit"><Avatar initials={mockUser.initials} size="lg" className="size-24 text-[25px]" /><span className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-[3px] border-white bg-[#014BAA] text-white"><Check className="size-3.5 stroke-[3]" /></span></div>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#014BAA]">{tx("Your A7 profile", "သင့် A7 ပရိုဖိုင်")}</p><h1 className="mt-2 text-[35px] font-semibold tracking-[-0.05em] sm:text-[40px]">{profile.name}</h1><div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#64748B]"><span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-[#014BAA]" />{profile.city}, Myanmar</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#014BAA]" />{tx("Phone & email verified", "ဖုန်းနှင့် အီးမေးလ် အတည်ပြုပြီး")}</span><span>{savedCount} {tx("saved homes", "အိမ်သိမ်းထား")}</span></div></div>
            <Button variant="outline" className="h-11 shrink-0 rounded-[14px] px-4" onClick={() => { setProfileDraft(profile); setProfileOpen(true); }}><Pencil className="size-4" />{tx("Edit profile", "ပရိုဖိုင်ပြင်ရန်")}</Button>
          </div>
        </section>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[20px] border border-[#E2DFD8] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.08)] sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#64748B]">{tx("Made personal", "သင့်အတွက်ကိုယ်ပိုင်")}</p><h2 className="mt-2 text-[27px] font-semibold tracking-[-0.045em]">{tx("Home preferences", "အိမ်အကြိုက်များ")}</h2><p className="mt-2 text-[11px] leading-5 text-[#707A75]">{tx("A7 uses these choices to keep recommendations useful.", "အသုံးဝင်သောအကြံပြုချက်များအတွက် ဤရွေးချယ်မှုများကို အသုံးပြုသည်။")}</p></div><button type="button" onClick={() => { setPreferenceDraft(preferences); setPreferencesOpen(true); }} className="grid size-11 shrink-0 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]" aria-label={tx("Edit preferences", "အကြိုက်များပြင်ရန်")}><Pencil className="size-4" /></button></div>
            <dl className="mt-5 divide-y divide-[#ECE9E3]">
              <PreferenceRow label={tx("Looking for", "ရှာဖွေနေသည်")}><span className="rounded-full bg-[#EEF5FC] px-3 py-1.5 text-[10px] font-semibold text-[#014BAA]">{preferences.journey === "rent" ? tx("Rent", "ငှားရန်") : tx("Buy", "ဝယ်ရန်")}</span></PreferenceRow>
              <PreferenceRow label={tx("Preferred locations", "နှစ်သက်သောနေရာများ")}><span className="flex flex-wrap justify-end gap-1.5">{preferences.locations.map((location) => <span key={location} className="rounded-full bg-[#F3F1EC] px-2.5 py-1 text-[9px]">{location}</span>)}</span></PreferenceRow>
              <PreferenceRow label={tx("Budget", "ဘတ်ဂျက်")}><span className="text-right">{preferences.budget}</span></PreferenceRow>
              <PreferenceRow label={tx("Property type", "အိမ်အမျိုးအစား")}><span className="text-right">{preferences.propertyTypes.join(" · ") || tx("Any home", "မည်သည့်အိမ်မဆို")}</span></PreferenceRow>
            </dl>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-[#E2DFD8] bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,.08)]">
            <div className="px-4 pb-3 pt-4"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#64748B]">{tx("Your account", "သင့်အကောင့်")}</p><h2 className="mt-2 text-[25px] font-semibold">{tx("Settings", "ဆက်တင်များ")}</h2></div>
            <div className="divide-y divide-[#ECE9E3]">
              <SettingRow icon={Bell} label={tx("Notifications", "အသိပေးချက်များ")} detail={tx("Saved homes, messages, viewings", "အိမ်၊ စာနှင့် အိမ်ကြည့်အသိပေးချက်")} onClick={() => setActiveSetting("notifications")} />
              <SettingRow icon={Globe2} label={tx("Language", "ဘာသာစကား")} detail={tx("English / မြန်မာ", "မြန်မာ / English")} onClick={() => setActiveSetting("language")} />
              <SettingRow icon={LockKeyhole} label={tx("Privacy", "ကိုယ်ရေးလုံခြုံမှု")} detail={tx("Data and contact preferences", "ဒေတာနှင့် ဆက်သွယ်မှုအကြိုက်") } onClick={() => setActiveSetting("privacy")} />
              <SettingRow icon={HelpCircle} label={tx("Help", "အကူအညီ")} detail={tx("Support and safety", "အကူအညီနှင့် လုံခြုံရေး")} onClick={() => setActiveSetting("help")} />
            </div>
          </section>
        </div>
      </main>

      <Modal open={profileOpen} onOpenChange={setProfileOpen} title={tx("Edit profile", "ပရိုဖိုင်ပြင်ရန်")} description={tx("Keep the details owners see accurate.", "အိမ်ရှင်များမြင်ရသောအချက်အလက်ကို မှန်ကန်စွာထားပါ။")} footer={<Button className="w-full" onClick={saveProfile}>{tx("Save changes", "ပြောင်းလဲမှုသိမ်းရန်")}</Button>}>
        <div className="space-y-5 p-5 sm:p-7"><Avatar initials={mockUser.initials} size="lg" /><label className="block"><span className="text-[11px] font-semibold">{tx("Full name", "အမည်အပြည့်အစုံ")}</span><input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} className="mt-2 h-12 w-full rounded-[14px] border border-[#D9D6CF] bg-white px-4 text-[12px] outline-none focus:border-[#014BAA]" /></label><label className="block"><span className="text-[11px] font-semibold">{tx("Location", "နေရာ")}</span><select value={profileDraft.city} onChange={(event) => setProfileDraft({ ...profileDraft, city: event.target.value })} className="mt-2 h-12 w-full rounded-[14px] border border-[#D9D6CF] bg-white px-4 text-[12px] outline-none focus:border-[#014BAA]"><option>Yangon</option><option>Mandalay</option></select></label><p className="rounded-[14px] bg-[#F8F3F0] p-4 text-[10px] leading-5 text-[#637284]">{tx("Your phone and email stay private until you contact an owner.", "အိမ်ရှင်ကို ဆက်သွယ်သည့်အထိ ဖုန်းနှင့် အီးမေးလ်ကို လျှို့ဝှက်ထားသည်။")}</p></div>
      </Modal>

      <BottomSheet open={preferencesOpen} onOpenChange={setPreferencesOpen} title={tx("Home preferences", "အိမ်အကြိုက်များ")} description={tx("A few choices make every recommendation better.", "ရွေးချယ်မှုအနည်းငယ်က အကြံပြုချက်များကို ပိုကောင်းစေသည်။")} footer={<Button className="w-full" onClick={savePreferences}>{tx("Save preferences", "အကြိုက်များသိမ်းရန်")}</Button>}>
        <div className="space-y-7 p-5 sm:p-7"><div><p className="text-[11px] font-semibold">{tx("Looking for", "ရှာဖွေနေသည်")}</p><div className="mt-3 grid grid-cols-2 rounded-[14px] bg-[#EEF2F6] p-1">{(["rent", "buy"] as Journey[]).map((journey) => <button key={journey} type="button" onClick={() => setPreferenceDraft({ ...preferenceDraft, journey })} className={cn("h-10 rounded-[11px] text-[11px] font-semibold capitalize", preferenceDraft.journey === journey ? "bg-white text-[#014BAA] shadow-sm" : "text-[#6A7581]")}>{journey === "rent" ? tx("Rent", "ငှားရန်") : tx("Buy", "ဝယ်ရန်")}</button>)}</div></div><div><p className="text-[11px] font-semibold">{tx("Preferred locations", "နှစ်သက်သောနေရာများ")}</p><div className="mt-3 flex flex-wrap gap-2">{locationOptions.map((location) => <Choice key={location} selected={preferenceDraft.locations.includes(location)} onClick={() => toggleLocation(location)}>{location}</Choice>)}</div></div><label className="block"><span className="text-[11px] font-semibold">{tx("Budget", "ဘတ်ဂျက်")}</span><select value={preferenceDraft.budget} onChange={(event) => setPreferenceDraft({ ...preferenceDraft, budget: event.target.value })} className="mt-3 h-12 w-full rounded-[14px] border border-[#D9D6CF] bg-white px-4 text-[11px] outline-none focus:border-[#014BAA]"><option>300,000 – 800,000 MMK / month</option><option>500,000 – 1,500,000 MMK / month</option><option>1,500,000 – 3,000,000 MMK / month</option><option>Up to 300M MMK</option></select></label><div><p className="text-[11px] font-semibold">{tx("Property type", "အိမ်အမျိုးအစား")}</p><div className="mt-3 grid grid-cols-2 gap-2">{propertyTypeOptions.map((type) => <Choice key={type} selected={preferenceDraft.propertyTypes.includes(type)} onClick={() => toggleType(type)} block>{type}</Choice>)}</div></div></div>
      </BottomSheet>

      <Sheet open={Boolean(activeSetting)} onOpenChange={(open) => !open && setActiveSetting(null)} title={settingTitle(activeSetting, tx)} description={settingDescription(activeSetting, tx)}>
        <div className="p-5 sm:p-7">{activeSetting === "notifications" && <div className="divide-y divide-[#ECE9E3]">{([['saved', tx('Saved-home updates', 'သိမ်းထားသောအိမ်အသိပေးချက်')], ['messages', tx('New messages', 'စာအသစ်များ')], ['viewings', tx('Viewing reminders', 'အိမ်ကြည့်သတိပေးချက်')]] as const).map(([id, label]) => <div key={id} className="flex items-center gap-4 py-4"><span className="min-w-0 flex-1 text-[12px] font-medium">{label}</span><Toggle checked={notifications[id]} onChange={() => setNotifications({ ...notifications, [id]: !notifications[id] })} label={label} /></div>)}</div>}{activeSetting === "language" && <div className="rounded-[20px] bg-[#F3F6FA] p-5"><p className="mb-4 text-[11px] leading-5 text-[#65717E]">{tx("Choose the language used throughout A7 Property.", "A7 Property တစ်ခုလုံးတွင် အသုံးပြုမည့် ဘာသာစကားကို ရွေးပါ။")}</p><LanguageSwitcher /></div>}{activeSetting === "privacy" && <div className="space-y-3"><p className="rounded-[20px] bg-[#F3F6FA] p-4 text-[11px] leading-5 text-[#65717E]">{tx("A7 only shares your contact details after you choose to send an inquiry.", "သင်ကိုယ်တိုင် စုံစမ်းမေးမြန်းပြီးမှသာ A7 က ဆက်သွယ်ရန်အချက်အလက်ကို မျှဝေသည်။")}</p><Button variant="outline" className="w-full rounded-[14px]">{tx("Download my data", "ကျွန်ုပ်၏ဒေတာကို ရယူရန်")}</Button></div>}{activeSetting === "help" && <div className="space-y-3"><Link href="/help" className="flex items-center justify-between rounded-[20px] border border-[#E2DFD8] p-4 text-[12px] font-semibold">{tx("Help center", "အကူအညီစင်တာ")}<ChevronRight className="size-4" /></Link><button type="button" className="flex w-full items-center justify-between rounded-[20px] border border-[#E2DFD8] p-4 text-left text-[12px] font-semibold">{tx("Report a safety issue", "လုံခြုံရေးပြဿနာတင်ပြရန်")}<ChevronRight className="size-4" /></button></div>}</div>
      </Sheet>
    </div>
  );
}

function PreferenceRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex items-center justify-between gap-5 py-4"><dt className="shrink-0 text-[10px] font-semibold uppercase tracking-[.1em] text-[#838B87]">{label}</dt><dd className="text-[11px] font-medium leading-5 text-[#34403B]">{children}</dd></div>; }

function SettingRow({ icon: Icon, label, detail, onClick }: { icon: typeof Bell; label: string; detail: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-[20px] px-3 py-4 text-left transition-colors hover:bg-[#F5F4EF]"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EEF3F9] text-[#53606E] group-hover:bg-[#EEF5FC] group-hover:text-[#014BAA]"><Icon className="size-[17px]" /></span><span className="min-w-0 flex-1"><strong className="block text-[12px]">{label}</strong><small className="mt-1 block truncate text-[9px] text-[#7C8580]">{detail}</small></span><ChevronRight className="size-4 text-[#A0A7AE]" /></button>; }

function Choice({ selected, onClick, children, block = false }: { selected: boolean; onClick: () => void; children: React.ReactNode; block?: boolean }) { return <button type="button" onClick={onClick} className={cn("rounded-[14px] border px-3 py-2.5 text-[10px] font-semibold", block && "w-full", selected ? "border-[#014BAA] bg-[#EEF5FC] text-[#014BAA]" : "border-[#D9D6CF] bg-white text-[#64706B]")}>{selected && <Check className="mr-1 inline size-3" />}{children}</button>; }

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) { return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className="relative h-11 w-12 shrink-0"><span className={cn("absolute inset-x-0 top-2 h-7 rounded-full transition-colors", checked ? "bg-[#014BAA]" : "bg-[#D2D6D2]")} /><span className={cn("absolute top-3 size-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-6" : "translate-x-1")} /></button>; }

function settingTitle(setting: SettingId | null, tx: (english: string, myanmar: string) => string) { if (setting === "notifications") return tx("Notifications", "အသိပေးချက်များ"); if (setting === "language") return tx("Language", "ဘာသာစကား"); if (setting === "privacy") return tx("Privacy", "ကိုယ်ရေးလုံခြုံမှု"); if (setting === "help") return tx("Help", "အကူအညီ"); return tx("Settings", "ဆက်တင်များ"); }
function settingDescription(setting: SettingId | null, tx: (english: string, myanmar: string) => string) { if (setting === "notifications") return tx("Choose the updates that help your home search.", "အိမ်ရှာဖွေရာတွင် အသုံးဝင်သောအသိပေးချက်များကို ရွေးပါ။"); if (setting === "language") return tx("A7 Property works in English and Myanmar.", "A7 Property ကို English နှင့် မြန်မာ နှစ်မျိုးသုံးနိုင်သည်။"); if (setting === "privacy") return tx("You stay in control of your personal information.", "သင့်ကိုယ်ရေးအချက်အလက်ကို သင်ကိုယ်တိုင် ထိန်းချုပ်နိုင်သည်။"); if (setting === "help") return tx("Support for your home journey.", "သင့်အိမ်ခရီးစဉ်အတွက် အကူအညီ။"); return undefined; }

export { ProfileExperience };

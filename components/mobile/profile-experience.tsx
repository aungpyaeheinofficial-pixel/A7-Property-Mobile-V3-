"use client";

import {
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe2,
  LockKeyhole,
  LogOut,
  Moon,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ElementType, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/components/i18n/language-provider";
import { MobileAppHeader } from "@/components/layout/mobile-app-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast-provider";
import { readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { cn } from "@/lib/utils";

type SettingId = "notifications" | "language" | "verification" | "help";

function ProfileExperience() {
  const { tx, language, setLanguage } = useLanguage();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: mockUser.name, city: mockUser.city });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState<SettingId | null>(null);
  const [notifications, setNotifications] = useState({ saved: true, messages: true, viewings: true });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedProfile = readStoredJson(STORAGE_KEYS.profile, { name: mockUser.name, city: mockUser.city });
    queueMicrotask(() => {
      setProfile(storedProfile);
      setProfileDraft(storedProfile);
    });
  }, []);

  function saveProfile() {
    setProfile(profileDraft);
    writeStoredJson(STORAGE_KEYS.profile, profileDraft);
    setProfileOpen(false);
    toast({ tone: "success", title: tx("Profile updated", "ပရိုဖိုင် ပြင်ဆင်ပြီးပါပြီ") });
  }

  function handleSignOut() {
    signOut();
    toast({ tone: "info", title: tx("Signed out", "အကောင့်မှ ထွက်ပြီးပါပြီ") });
    router.push("/sign-in");
  }

  const surface = darkMode ? "bg-[#202124] text-[#F3F4F6]" : "bg-[#F7F8FA] text-[#1B1B1F]";
  const headerSurface = darkMode ? "border-white/10 bg-[#202124]/88" : "border-black/[.04] bg-white/82";

  return (
    <div className={cn("min-h-screen pb-28 transition-colors lg:pb-16", surface)}>
      <header className={cn("fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl", headerSurface)}>
        <MobileAppHeader
          avatarAlt={profile.name}
          onAvatarClick={() => { setProfileDraft(profile); setProfileOpen(true); }}
          onNotificationClick={() => setActiveSetting("notifications")}
          theme={darkMode ? "dark" : "light"}
        />
      </header>

      <main className="mx-auto w-full max-w-[760px] px-4 pb-8 pt-[calc(88px+env(safe-area-inset-top))] sm:px-6">
        <section className="flex flex-col items-center text-center" aria-labelledby="profile-title">
          <button type="button" onClick={() => { setProfileDraft(profile); setProfileOpen(true); }} className="relative rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0053D2]/20" aria-label={tx("Edit personal information", "ကိုယ်ရေးအချက်အလက်ပြင်ရန်")}>
            <Avatar src="/images/profile/thiri-win.jpg" alt={profile.name} initials={mockUser.initials} size="lg" className="size-24 border border-[#E5E7EB] bg-[#E9EEF5] shadow-sm" />
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-white p-1 shadow-sm"><ShieldCheck className="size-5 fill-[#0053D2] text-white" /></span>
          </button>
          <h1 id="profile-title" className="mt-3 text-[28px] font-bold leading-9 tracking-[-.025em]">{profile.name}</h1>
          <p className={cn("mt-1 text-[15px]", darkMode ? "text-[#BFC3CA]" : "text-[#6B7280]")}>{tx("Member since 2024", "၂၀၂၄ ခုနှစ်မှ အဖွဲ့ဝင်")}</p>
        </section>

        <div className="mt-8 space-y-6">
          <SettingsGroup title={tx("Account", "အကောင့်")} dark={darkMode}>
            <SettingsRow icon={UserRound} label={tx("Personal Information", "ကိုယ်ရေးအချက်အလက်")} onClick={() => { setProfileDraft(profile); setProfileOpen(true); }} dark={darkMode} />
            <SettingsRow icon={ShieldCheck} label={tx("Verification Status", "အတည်ပြုအခြေအနေ")} trailing={tx("Verified", "အတည်ပြုပြီး")} onClick={() => setActiveSetting("verification")} dark={darkMode} />
            <SettingsRow icon={Building2} label={tx("My Properties", "ကျွန်ုပ်၏အိမ်များ")} href="/saved" dark={darkMode} />
          </SettingsGroup>

          <SettingsGroup title={tx("Preferences", "စိတ်ကြိုက်ရွေးချယ်မှု")} dark={darkMode}>
            <SettingsRow icon={Globe2} label={tx("Language", "ဘာသာစကား")} trailing={language === "en" ? "EN" : "မြန်မာ"} onClick={() => setActiveSetting("language")} dark={darkMode} />
            <SettingsRow icon={Bell} label={tx("Notifications", "အသိပေးချက်များ")} onClick={() => setActiveSetting("notifications")} dark={darkMode} />
            <ToggleRow checked={darkMode} onChange={() => setDarkMode((current) => !current)} dark={darkMode} label={tx("Dark Mode", "အမှောင်ပုံစံ")} />
          </SettingsGroup>

          <SettingsGroup title={tx("Support & Legal", "အကူအညီနှင့် စည်းမျဉ်းများ")} dark={darkMode}>
            <SettingsRow icon={CircleHelp} label={tx("Help Center", "အကူအညီစင်တာ")} onClick={() => setActiveSetting("help")} dark={darkMode} />
            <SettingsRow icon={LockKeyhole} label={tx("Privacy Policy", "ကိုယ်ရေးလုံခြုံမှု မူဝါဒ")} href="/privacy" dark={darkMode} />
            <SettingsRow icon={FileText} label={tx("Terms of Service", "ဝန်ဆောင်မှု စည်းကမ်းများ")} href="/terms" dark={darkMode} />
          </SettingsGroup>
        </div>

        <button type="button" onClick={handleSignOut} className={cn("mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium shadow-sm transition-colors", darkMode ? "bg-[#2C2F34] text-[#FFB4AB]" : "bg-white text-[#BA1A1A]")}><LogOut className="size-5" />{tx("Sign Out", "အကောင့်မှ ထွက်ရန်")}</button>
      </main>

      <Modal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title={tx("Personal information", "ကိုယ်ရေးအချက်အလက်")}
        description={tx("Keep the details owners see accurate.", "အိမ်ရှင်များမြင်ရသော အချက်အလက်ကို မှန်ကန်စွာထားပါ။")}
        footer={<Button className="w-full" onClick={saveProfile}>{tx("Save changes", "ပြောင်းလဲမှုသိမ်းရန်")}</Button>}
      >
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-center gap-4"><Avatar src="/images/profile/thiri-win.jpg" alt="" initials={mockUser.initials} size="lg" className="size-20 bg-[#EFE8DD] ring-4 ring-[#DCEBFF]" /><div><p className="text-[12px] font-semibold">{profileDraft.name}</p><p className="mt-1 text-[10px] text-[#667085]">{tx("A7 verified profile", "A7 အတည်ပြုပရိုဖိုင်")}</p></div></div>
          <label className="block"><span className="text-[11px] font-semibold">{tx("Full name", "အမည်အပြည့်အစုံ")}</span><input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} className="mt-2 h-12 w-full rounded-[14px] border border-[#D0DEF0] bg-[#F8FBFF] px-4 text-[12px] outline-none focus:border-[#123B73] focus:ring-3 focus:ring-[#123B73]/12" /></label>
          <label className="block"><span className="text-[11px] font-semibold">{tx("Location", "နေရာ")}</span><select value={profileDraft.city} onChange={(event) => setProfileDraft({ ...profileDraft, city: event.target.value })} className="mt-2 h-12 w-full rounded-[14px] border border-[#D0DEF0] bg-[#F8FBFF] px-4 text-[12px] outline-none focus:border-[#123B73] focus:ring-3 focus:ring-[#123B73]/12"><option>Yangon</option><option>Mandalay</option></select></label>
          <div className="rounded-[14px] bg-[#F8FBFF] p-4 text-[10px] leading-5 text-[#5A6577]"><strong className="block text-[#101828]">{mockUser.email}</strong>{tx("Your phone and email stay private until you contact an owner.", "အိမ်ရှင်ကို ဆက်သွယ်သည့်အထိ ဖုန်းနှင့် အီးမေးလ်ကို လျှို့ဝှက်ထားသည်။")}</div>
        </div>
      </Modal>

      <Sheet open={Boolean(activeSetting)} onOpenChange={(open) => !open && setActiveSetting(null)} title={settingTitle(activeSetting, tx)} description={settingDescription(activeSetting, tx)}>
        <div className="p-5 sm:p-7">
          {activeSetting === "verification" && <div className="rounded-[18px] bg-[#ECFDF5] p-5 text-center"><ShieldCheck className="mx-auto size-9 fill-[#059669] text-white" /><h2 className="mt-3 text-[15px] font-semibold text-[#064E3B]">{tx("Your account is verified", "သင့်အကောင့်ကို အတည်ပြုပြီးပါပြီ")}</h2><p className="mt-2 text-[11px] leading-5 text-[#047857]">{tx("Verified profiles help owners respond with confidence.", "အတည်ပြုပြီးသော ပရိုဖိုင်များကို အိမ်ရှင်များ ပိုမိုယုံကြည်စွာ တုံ့ပြန်နိုင်သည်။")}</p></div>}
          {activeSetting === "notifications" && <div className="divide-y divide-[#D0DEF0]">{([["saved", tx("Saved-home updates", "သိမ်းထားသောအိမ်အသိပေးချက်")], ["messages", tx("New messages", "စာအသစ်များ")], ["viewings", tx("Viewing reminders", "အိမ်ကြည့်သတိပေးချက်")]] as const).map(([id, label]) => <div key={id} className="flex min-h-16 items-center gap-4 py-3"><span className="min-w-0 flex-1 text-[12px] font-medium">{label}</span><Toggle checked={notifications[id]} onChange={() => setNotifications({ ...notifications, [id]: !notifications[id] })} label={label} /></div>)}</div>}
          {activeSetting === "language" && <div className="grid gap-3"><p className="text-[12px] leading-5 text-[#5A6577]">{tx("Choose the language used throughout A7 Property.", "A7 Property တစ်ခုလုံးတွင် အသုံးပြုမည့် ဘာသာစကားကို ရွေးပါ။")}</p>{(["en", "my"] as const).map((option) => <button key={option} type="button" onClick={() => { setLanguage(option); setActiveSetting(null); }} className={cn("flex min-h-12 items-center justify-between rounded-[14px] border px-4 text-left text-[12px] font-semibold", language === option ? "border-[#0053D2] bg-[#EEF5FC] text-[#0053D2]" : "border-[#D0DEF0]")}>{option === "en" ? "English" : "မြန်မာ"}{language === option && <ShieldCheck className="size-4" />}</button>)}</div>}
          {activeSetting === "help" && <div className="space-y-3"><Link href="/help" className="flex min-h-14 items-center justify-between rounded-[16px] border border-[#D0DEF0] px-4 text-[12px] font-semibold">{tx("Help center", "အကူအညီစင်တာ")}<ChevronRight className="size-4" /></Link><Link href="/help#safety" className="flex min-h-14 items-center justify-between rounded-[16px] border border-[#D0DEF0] px-4 text-[12px] font-semibold">{tx("Report a safety issue", "လုံခြုံရေးပြဿနာတင်ပြရန်")}<ChevronRight className="size-4" /></Link></div>}
        </div>
      </Sheet>
    </div>
  );
}

function SettingsGroup({ title, dark, children }: { title: string; dark: boolean; children: ReactNode }) {
  return <section><h2 className={cn("mb-2 ml-2 text-[12px] font-medium tracking-[.06em]", dark ? "text-[#BFC3CA]" : "text-[#6B7280]")}>{title.toUpperCase()}</h2><div className={cn("overflow-hidden rounded-xl shadow-sm", dark ? "bg-[#2C2F34]" : "bg-[#EFEDF1]")}>{children}</div></section>;
}

function SettingsRow({ icon: Icon, label, trailing, href, onClick, dark }: { icon: ElementType; label: string; trailing?: string; href?: string; onClick?: () => void; dark: boolean }) {
  const content = <><Icon className="size-5 shrink-0 text-[#0053D2]" /><span className="min-w-0 flex-1 text-[15px]">{label}</span>{trailing && <span className={cn("shrink-0 text-[14px]", dark ? "text-[#BFC3CA]" : "text-[#6B7280]")}>{trailing}</span>}<ChevronRight className={cn("size-5 shrink-0", dark ? "text-[#9FA4AD]" : "text-[#9CA3AF]")} /></>;
  const className = cn("flex min-h-[58px] w-full items-center gap-3 px-4 text-left transition-colors", dark ? "bg-[#2C2F34] hover:bg-[#34373C]" : "bg-white hover:bg-[#F7F8FA]");
  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} className={className}>{content}</button>;
}

function ToggleRow({ checked, onChange, dark, label }: { checked: boolean; onChange: () => void; dark: boolean; label: string }) {
  return <div className={cn("flex min-h-[58px] items-center gap-3 px-4", dark ? "bg-[#2C2F34]" : "bg-white")}><Moon className="size-5 shrink-0 text-[#0053D2]" /><span className="min-w-0 flex-1 text-[15px]">{label}</span><Toggle checked={checked} onChange={onChange} label={label} /></div>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={cn("relative h-8 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0053D2]/18", checked ? "bg-[#0053D2]" : "bg-[#E3E2E6]")}><span className={cn("absolute top-1 size-6 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5" : "translate-x-1")} /></button>;
}

function settingTitle(setting: SettingId | null, tx: (english: string, myanmar: string) => string) {
  if (setting === "notifications") return tx("Notifications", "အသိပေးချက်များ");
  if (setting === "language") return tx("Language", "ဘာသာစကား");
  if (setting === "verification") return tx("Verification status", "အတည်ပြုအခြေအနေ");
  if (setting === "help") return tx("Help center", "အကူအညီစင်တာ");
  return tx("Settings", "ဆက်တင်များ");
}

function settingDescription(setting: SettingId | null, tx: (english: string, myanmar: string) => string) {
  if (setting === "notifications") return tx("Choose the updates that help your home search.", "အိမ်ရှာဖွေရာတွင် အသုံးဝင်သောအသိပေးချက်များကို ရွေးပါ။");
  if (setting === "language") return tx("A7 Property works in English and Myanmar.", "A7 Property ကို English နှင့် မြန်မာ နှစ်မျိုးသုံးနိုင်သည်။");
  if (setting === "verification") return tx("Your identity and contact details have been checked.", "သင့်ကိုယ်ရေးနှင့် ဆက်သွယ်ရန်အချက်အလက်ကို စစ်ဆေးပြီးပါပြီ။");
  if (setting === "help") return tx("Support for every step of your home journey.", "သင့်အိမ်ခရီးစဉ်အဆင့်တိုင်းအတွက် အကူအညီ။");
  return undefined;
}

export { ProfileExperience };

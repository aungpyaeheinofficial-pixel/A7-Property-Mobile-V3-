"use client";

import {
  Bell,
  Camera,
  CalendarCheck2,
  ChevronRight,
  Eye,
  Heart,
  HelpCircle,
  Info,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Pencil,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast-provider";
import { readStoredIds, readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { mockAppointments, mockMessages, mockUser } from "@/lib/mock-users";
import { cn } from "@/lib/utils";

type SettingId = "notifications" | "language" | "privacy" | "help";

function ProfileExperience() {
  const { tx } = useLanguage();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: mockUser.name, city: mockUser.city });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState<SettingId | null>(null);
  const [savedCount, setSavedCount] = useState(mockUser.savedPropertyIds.length);
  const [notifications, setNotifications] = useState({ saved: true, messages: true, viewings: true });

  useEffect(() => {
    const storedProfile = readStoredJson(STORAGE_KEYS.profile, { name: mockUser.name, city: mockUser.city });
    const storedSaved = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => {
      setProfile(storedProfile);
      setProfileDraft(storedProfile);
      setSavedCount(storedSaved.length);
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

  return (
    <div className="min-h-screen bg-[#EAF4FF] pb-28 text-[#101828] lg:pb-16">
      <main className="mx-auto max-w-[760px] px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <section className="relative -mx-4 overflow-hidden px-4 pb-6 sm:-mx-6 sm:px-6" aria-labelledby="profile-title">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full" aria-hidden="true">
            <ProgressiveImage src="/images/properties/a7-yangon-daylight-hero.png" alt="" fill priority sizes="760px" className="object-cover object-[68%_center] opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#EAF4FF_0%,rgba(248,250,254,.96)_38%,rgba(248,250,254,.68)_70%,rgba(248,250,254,.3)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#EAF4FF] to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex min-h-[70px] items-center justify-between gap-4">
              <Link href="/" aria-label={tx("A7 Property home", "A7 Property ပင်မစာမျက်နှာ")} className="w-fit"><A7Brand /></Link>
              <button type="button" onClick={() => setActiveSetting("notifications")} aria-label={tx("Notification settings", "အသိပေးချက်ဆက်တင်များ")} className="relative grid size-12 place-items-center rounded-full border border-white/90 bg-[#F8FBFF]/88 text-[#101828] shadow-[0_8px_24px_rgba(24,53,96,.09)] backdrop-blur-xl"><Bell className="size-5" /><span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#123B73] ring-2 ring-white" /></button>
            </div>

            <div className="mt-7">
              <h1 id="profile-title" className="text-[32px] font-semibold leading-none tracking-[-0.05em] sm:text-[38px]">{tx("Profile", "ပရိုဖိုင်")}</h1>
              <p className="mt-2.5 text-[13px] font-medium text-[#667085] sm:text-[15px]">{tx("Manage your account and activity", "သင့်အကောင့်နှင့် လှုပ်ရှားမှုများကို စီမံပါ")}</p>
            </div>

            <div className="mt-6 flex items-center gap-4 sm:gap-6">
              <button type="button" onClick={() => { setProfileDraft(profile); setProfileOpen(true); }} className="group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#123B73]/20" aria-label={tx("Edit profile photo and information", "ပရိုဖိုင်ဓာတ်ပုံနှင့် အချက်အလက်ပြင်ရန်")}>
                <span className="block rounded-full bg-[#F8FBFF] p-1 shadow-[0_12px_30px_rgba(17,48,91,.14)] ring-1 ring-white"><Avatar src="/images/profile/thiri-win.jpg" alt={tx("Thiri Win profile photo", "သီရိဝင်း ပရိုဖိုင်ဓာတ်ပုံ")} initials={mockUser.initials} size="lg" className="size-[112px] bg-[#E9EEF5] sm:size-[132px]" /></span>
                <span className="absolute bottom-0 right-0 z-20 grid size-10 place-items-center rounded-full border-4 border-[#EAF4FF] bg-[#F8FBFF] text-[#123B73] shadow-[0_6px_16px_rgba(23,54,95,.12)]"><Camera className="size-[19px]" /></span>
              </button>

              <div className="min-w-0 flex-1">
                <h2 id="profile-name" className="truncate text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">{profile.name}</h2>
                <span className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-[#DCEBFF] px-3 text-[11px] font-semibold text-[#123B73]"><ShieldCheck className="size-[17px] fill-[#123B73] text-white" />{tx("Verified Seeker", "စိစစ်ပြီးသော အိမ်ရှာသူ")}</span>
                <p className="mt-3 text-[11px] font-medium text-[#667085] sm:text-[12px]">{tx("Member since May 2023", "၂၀၂၃ မေလမှ အဖွဲ့ဝင်")}</p>
              </div>

              <button type="button" onClick={() => { setProfileDraft(profile); setProfileOpen(true); }} className="hidden h-12 shrink-0 items-center gap-2 rounded-full border border-white bg-[#F8FBFF]/90 px-5 text-[12px] font-semibold shadow-[0_8px_22px_rgba(24,53,96,.08)] backdrop-blur-xl min-[520px]:inline-flex"><Pencil className="size-4 text-[#123B73]" />{tx("Edit Profile", "ပရိုဖိုင်ပြင်ရန်")}</button>
            </div>

            <button type="button" onClick={() => { setProfileDraft(profile); setProfileOpen(true); }} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white bg-[#F8FBFF]/88 text-[11px] font-semibold shadow-sm backdrop-blur-xl min-[520px]:hidden"><Pencil className="size-4 text-[#123B73]" />{tx("Edit Profile", "ပရိုဖိုင်ပြင်ရန်")}</button>
          </div>
        </section>

        <section className="grid grid-cols-4 overflow-hidden rounded-[24px] border border-white bg-[#F8FBFF]/94 px-1 py-4 shadow-[0_12px_34px_rgba(25,57,102,.08)]" aria-label={tx("Account activity", "အကောင့်လှုပ်ရှားမှု")}>
          <JourneyStat href="/saved" icon={Heart} value={savedCount} label={tx("Saved", "သိမ်းထား")} color="text-[#123B73]" />
          <JourneyStat href="/search?purpose=rent" icon={Eye} value={12} label={tx("Viewed", "ကြည့်ခဲ့")} color="text-[#13B979]" />
          <JourneyStat href="/messages" icon={MessageCircle} value={mockMessages.length} label={tx("Inquiries", "စုံစမ်းမှု")} color="text-[#7C3AED]" />
          <JourneyStat href="/dashboard?section=viewings" icon={CalendarCheck2} value={mockAppointments.length} label={tx("Appointments", "ချိန်းဆိုမှု")} color="text-[#F97316]" />
        </section>

        <section className="mt-5 rounded-[24px] border border-white bg-[#F8FBFF]/94 p-4 shadow-[0_12px_34px_rgba(25,57,102,.07)]" aria-labelledby="quick-access-title">
          <h2 id="quick-access-title" className="text-[15px] font-semibold tracking-[-0.025em]">{tx("Quick Access", "အမြန်သုံးရန်")}</h2>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            <ProfileQuickAccess href="/saved" icon={Heart} label={tx("Saved Homes", "သိမ်းထားသောအိမ်")} tone="blue" />
            <ProfileQuickAccess href="/compare" icon={Scale} label={tx("Compare", "နှိုင်းယှဉ်")} tone="green" />
            <ProfileQuickAccess href="/messages" icon={MessageCircle} label={tx("Messages", "စာများ")} tone="purple" />
            <ProfileQuickAccess href="/dashboard?section=viewings" icon={CalendarCheck2} label={tx("My Appointments", "ကျွန်ုပ်၏ချိန်းဆိုမှု")} tone="orange" />
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-white bg-[#F8FBFF]/94 px-4 shadow-[0_12px_34px_rgba(25,57,102,.07)]" aria-label={tx("Profile settings", "ပရိုဖိုင်ဆက်တင်များ")}>
          <ProfileRow icon={UserRound} label={tx("Personal Information", "ကိုယ်ရေးအချက်အလက်")} onClick={() => { setProfileDraft(profile); setProfileOpen(true); }} />
          <ProfileRow icon={Bell} label={tx("Notification Settings", "အသိပေးချက်ဆက်တင်များ")} onClick={() => setActiveSetting("notifications")} />
          <ProfileRow icon={LockKeyhole} label={tx("Privacy & Security", "ကိုယ်ရေးနှင့် လုံခြုံရေး")} onClick={() => setActiveSetting("privacy")} />
          <ProfileRow icon={HelpCircle} label={tx("Help & Support", "အကူအညီနှင့် ပံ့ပိုးမှု")} onClick={() => setActiveSetting("help")} />
          <ProfileRow icon={Info} label={tx("About A7 Property", "A7 Property အကြောင်း")} href="/terms" />
        </section>

        <button type="button" onClick={handleSignOut} className="mt-5 flex h-16 w-full items-center justify-center gap-2.5 rounded-[22px] border border-white bg-[#F8FBFF] text-[14px] font-semibold text-[#F04452] shadow-[0_10px_28px_rgba(25,57,102,.06)]"><LogOut className="size-5" />{tx("Log Out", "အကောင့်ထွက်ရန်")}</button>
      </main>

      <Modal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title={tx("Personal information", "ကိုယ်ရေးအချက်အလက်")}
        description={tx("Keep the details owners see accurate.", "အိမ်ရှင်များမြင်ရသော အချက်အလက်ကို မှန်ကန်စွာထားပါ။")}
        footer={<Button className="w-full" onClick={saveProfile}>{tx("Save changes", "ပြောင်းလဲမှုသိမ်းရန်")}</Button>}
      >
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <Avatar src="/images/profile/thiri-win.jpg" alt="" initials={mockUser.initials} size="lg" className="size-20 bg-[#EFE8DD] ring-4 ring-[#DCEBFF]" />
            <div><p className="text-[12px] font-semibold">{profileDraft.name}</p><p className="mt-1 text-[10px] text-[#667085]">{tx("A7 verified profile", "A7 အတည်ပြုပရိုဖိုင်")}</p></div>
          </div>
          <label className="block"><span className="text-[11px] font-semibold">{tx("Full name", "အမည်အပြည့်အစုံ")}</span><input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} className="mt-2 h-12 w-full rounded-[14px] border border-[#D0DEF0] bg-[#F8FBFF] px-4 text-[12px] outline-none focus:border-[#123B73] focus:ring-3 focus:ring-[#123B73]/12" /></label>
          <label className="block"><span className="text-[11px] font-semibold">{tx("Location", "နေရာ")}</span><select value={profileDraft.city} onChange={(event) => setProfileDraft({ ...profileDraft, city: event.target.value })} className="mt-2 h-12 w-full rounded-[14px] border border-[#D0DEF0] bg-[#F8FBFF] px-4 text-[12px] outline-none focus:border-[#123B73] focus:ring-3 focus:ring-[#123B73]/12"><option>Yangon</option><option>Mandalay</option></select></label>
          <div className="rounded-[14px] bg-[#F8FBFF] p-4 text-[10px] leading-5 text-[#5A6577]"><strong className="block text-[#101828]">{mockUser.email}</strong>{tx("Your phone and email stay private until you contact an owner.", "အိမ်ရှင်ကို ဆက်သွယ်သည့်အထိ ဖုန်းနှင့် အီးမေးလ်ကို လျှို့ဝှက်ထားသည်။")}</div>
        </div>
      </Modal>

      <Sheet open={Boolean(activeSetting)} onOpenChange={(open) => !open && setActiveSetting(null)} title={settingTitle(activeSetting, tx)} description={settingDescription(activeSetting, tx)}>
        <div className="p-5 sm:p-7">
          {activeSetting === "notifications" && <div className="divide-y divide-[#D0DEF0]">{([["saved", tx("Saved-home updates", "သိမ်းထားသောအိမ်အသိပေးချက်")], ["messages", tx("New messages", "စာအသစ်များ")], ["viewings", tx("Viewing reminders", "အိမ်ကြည့်သတိပေးချက်")]] as const).map(([id, label]) => <div key={id} className="flex min-h-16 items-center gap-4 py-3"><span className="min-w-0 flex-1 text-[12px] font-medium">{label}</span><Toggle checked={notifications[id]} onChange={() => setNotifications({ ...notifications, [id]: !notifications[id] })} label={label} /></div>)}</div>}
          {activeSetting === "language" && <div className="rounded-[18px] bg-[#F8FBFF] p-5"><p className="mb-4 text-[11px] leading-5 text-[#5A6577]">{tx("Choose the language used throughout A7 Property.", "A7 Property တစ်ခုလုံးတွင် အသုံးပြုမည့် ဘာသာစကားကို ရွေးပါ။")}</p><LanguageSwitcher /></div>}
          {activeSetting === "privacy" && <div className="space-y-3"><p className="rounded-[18px] bg-[#F8FBFF] p-4 text-[11px] leading-5 text-[#5A6577]">{tx("A7 only shares your contact details after you choose to send an inquiry.", "သင်ကိုယ်တိုင် စုံစမ်းမေးမြန်းပြီးမှသာ A7 က ဆက်သွယ်ရန်အချက်အလက်ကို မျှဝေသည်။")}</p><Link href="/privacy" className="flex min-h-12 items-center justify-between rounded-[14px] border border-[#D0DEF0] px-4 text-[11px] font-semibold">{tx("Read privacy policy", "ကိုယ်ရေးလုံခြုံမှု မူဝါဒဖတ်ရန်")}<ChevronRight className="size-4" /></Link></div>}
          {activeSetting === "help" && <div className="space-y-3"><Link href="/help" className="flex min-h-14 items-center justify-between rounded-[16px] border border-[#D0DEF0] px-4 text-[12px] font-semibold">{tx("Help center", "အကူအညီစင်တာ")}<ChevronRight className="size-4" /></Link><Link href="/help#safety" className="flex min-h-14 items-center justify-between rounded-[16px] border border-[#D0DEF0] px-4 text-[12px] font-semibold">{tx("Report a safety issue", "လုံခြုံရေးပြဿနာတင်ပြရန်")}<ChevronRight className="size-4" /></Link></div>}
        </div>
      </Sheet>
    </div>
  );
}

function JourneyStat({ href, icon: Icon, value, label, color }: { href: string; icon: ElementType; value: number; label: string; color: string }) {
  return <Link href={href} className="group flex min-h-[92px] flex-col items-center justify-center border-r border-[#D0DEF0] px-1.5 text-center last:border-r-0 hover:bg-[#F8FBFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-[#123B73]/18 sm:min-h-[108px]"><Icon className={cn("size-6 transition-transform group-hover:scale-105 sm:size-7", color)} /><strong className="mt-2 text-[18px] tracking-[-0.035em] sm:text-[21px]">{value}</strong><span className="mt-1 text-[8px] font-medium text-[#66748F] sm:text-[10px]">{label}</span></Link>;
}

function ProfileQuickAccess({ href, icon: Icon, label, tone }: { href: string; icon: ElementType; label: string; tone: "blue" | "green" | "purple" | "orange" }) {
  const tones = {
    blue: "bg-[#DCEBFF] text-[#123B73] border-[#DFEAFB]",
    green: "bg-[#ECFAF4] text-[#13A970] border-[#DDF3E9]",
    purple: "bg-[#F5F0FF] text-[#7C3AED] border-[#EAE0FC]",
    orange: "bg-[#FFF4EA] text-[#F97316] border-[#F9E6D6]",
  };
  return <Link href={href} className={cn("flex min-h-[106px] min-w-0 flex-col items-center justify-center gap-3 rounded-[18px] border px-1.5 text-center transition-transform active:scale-[.98] sm:min-h-[122px]", tones[tone])}><Icon className="size-7 sm:size-8" /><span className="line-clamp-2 text-[8px] font-semibold leading-3 text-[#101828] sm:text-[10px] sm:leading-4">{label}</span></Link>;
}

function ProfileRow({ icon: Icon, label, href, onClick }: { icon: ElementType; label: string; href?: string; onClick?: () => void }) {
  const content = <><span className="grid size-10 shrink-0 place-items-center text-[#687895]"><Icon className="size-[21px]" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-semibold">{label}</strong></span><ChevronRight className="size-[18px] shrink-0 text-[#71809B] transition-transform group-hover:translate-x-0.5" /></>;
  const className = "group flex min-h-[68px] w-full items-center gap-2.5 border-b border-[#D0DEF0] px-1 text-left transition-colors last:border-b-0 hover:bg-[#F8FBFF] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-[#123B73]/16 sm:min-h-[74px]";
  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} className={className}>{content}</button>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className="relative h-11 w-12 shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#123B73]/18"><span className={cn("absolute inset-x-0 top-2 h-7 rounded-full transition-colors", checked ? "bg-[#123B73]" : "bg-[#B8CCE4]")} /><span className={cn("absolute top-3 size-5 rounded-full bg-[#F8FBFF] shadow-sm transition-transform", checked ? "translate-x-6" : "translate-x-1")} /></button>;
}

function settingTitle(setting: SettingId | null, tx: (english: string, myanmar: string) => string) {
  if (setting === "notifications") return tx("Notifications", "အသိပေးချက်များ");
  if (setting === "language") return tx("Language", "ဘာသာစကား");
  if (setting === "privacy") return tx("Privacy & security", "ကိုယ်ရေးလုံခြုံမှု");
  if (setting === "help") return tx("Help & support", "အကူအညီ");
  return tx("Settings", "ဆက်တင်များ");
}

function settingDescription(setting: SettingId | null, tx: (english: string, myanmar: string) => string) {
  if (setting === "notifications") return tx("Choose the updates that help your home search.", "အိမ်ရှာဖွေရာတွင် အသုံးဝင်သောအသိပေးချက်များကို ရွေးပါ။");
  if (setting === "language") return tx("A7 Property works in English and Myanmar.", "A7 Property ကို English နှင့် မြန်မာ နှစ်မျိုးသုံးနိုင်သည်။");
  if (setting === "privacy") return tx("You stay in control of your personal information.", "သင့်ကိုယ်ရေးအချက်အလက်ကို သင်ကိုယ်တိုင် ထိန်းချုပ်နိုင်သည်။");
  if (setting === "help") return tx("Support for every step of your home journey.", "သင့်အိမ်ခရီးစဉ်အဆင့်တိုင်းအတွက် အကူအညီ။");
  return undefined;
}

export { ProfileExperience };

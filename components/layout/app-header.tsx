"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { A7AssistantPopover } from "@/components/assistant/a7-assistant-popover";
import { useAuth } from "@/components/auth/auth-provider";
import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { IntentNavigation, intentLinks } from "@/components/layout/intent-navigation";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

interface AppHeaderProps {
  compact?: boolean;
}

function AppHeader({ compact = false }: AppHeaderProps) {
  const { isMyanmar, tx } = useLanguage();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const intentDescriptions = {
    rent: tx("Browse verified rentals", "စိစစ်ထားသော ငှားရန်အိမ်များကို ကြည့်ပါ"),
    buy: tx("Explore homes for sale", "ရောင်းရန်အိမ်များကို ရှာဖွေပါ"),
    sell: tx("List and manage a property", "အိမ်ကို စာရင်းတင်ပြီး စီမံပါ"),
  };

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header className={`sticky top-0 z-50 border-b border-[#172B3F]/8 bg-white/88 shadow-[0_1px_0_rgba(255,255,255,.7)] backdrop-blur-2xl ${compact ? "h-[68px]" : "h-[76px]"}`}>
      <div className="mx-auto flex h-full w-full max-w-[1480px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="A7 Property home"><A7Brand /></Link>

        <IntentNavigation className="hidden md:flex" />

        <div className="flex items-center gap-2">
          <A7AssistantPopover labelClassName="hidden min-[400px]:inline" />
          <LanguageSwitcher className="hidden sm:block" />
          <LanguageSwitcher compact className="sm:hidden" />
          <Link href="/dashboard?section=saved" className="hidden size-10 place-items-center rounded-xl text-[#526172] transition-colors hover:bg-[#EEF3F9] hover:text-[#006AFF] sm:grid" aria-label={tx("Saved homes", "သိမ်းထားသောအိမ်များ")}>
            <AnimatedIcon icon="ph:heart-bold" size="sm" hover="scale" />
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href={user.accountType === "lister" ? "/owner" : "/dashboard"} className="hidden max-w-[140px] truncate rounded-xl bg-[#F1F6FF] px-3 py-2 text-xs font-semibold text-[#006AFF] sm:block">{user.fullName}</Link>
              <button type="button" onClick={handleSignOut} className="grid size-10 place-items-center rounded-xl border border-[#DCE4ED] bg-white text-[#29445F] shadow-sm transition-colors hover:border-[#FF6B6B] hover:text-[#D92D20]" aria-label={tx("Sign out", "အကောင့်ထွက်ရန်")}>
                <AnimatedIcon icon="ph:sign-out-bold" size="sm" hover="scale" />
              </button>
            </div>
          ) : (
            <Link href="/sign-in" className="grid size-10 place-items-center rounded-xl border border-[#DCE4ED] bg-white text-[#29445F] shadow-sm transition-colors hover:border-[#9FC4FF] hover:text-[#006AFF]" aria-label={tx("Sign in", "အကောင့်ဝင်ရန်")}>
              <AnimatedIcon icon="ph:user-circle-bold" size="md" hover="scale" iconClassName="size-5" />
            </Link>
          )}
          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMenuOpen(true)} aria-label={tx("Open navigation", "လမ်းညွှန်မီနူး ဖွင့်ရန်")}>
            <AnimatedIcon icon="ph:list-bold" size="md" hover="none" />
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title={tx("Explore A7 Property", "A7 Property ကို လေ့လာပါ")} side="right">
        <nav className="flex flex-col p-5 text-sm font-medium">
          <div className="grid gap-2">
            {intentLinks.map((item) => {
              return (
                <Link key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#DCE4ED] bg-white p-3.5 shadow-sm transition-colors hover:border-[#9FC4FF] hover:bg-[#F7FAFF]" href={item.href} onClick={() => setMenuOpen(false)}>
                  <AnimatedIcon icon={item.iconName ?? "ph:house-bold"} size="md" variant="solid" hover="scale" />
                  <span><strong className="block text-sm">{isMyanmar ? item.labelMy : item.label}</strong><small className="mt-1 block text-[10px] font-normal text-[#667486]">{intentDescriptions[item.id]}</small></span>
                </Link>
              );
            })}
          </div>
          <Link className="mt-5 flex items-center gap-3 border-b border-[#D1D1D5] py-4" href="/assistant" onClick={() => setMenuOpen(false)}>
            <AnimatedIcon icon="ph:chats-circle-bold" size="sm" variant="solid" hover="scale" />{tx("AI home assistant", "AI အိမ်ရှာဖွေရေးအကူ")}
          </Link>
          <Link className="flex items-center gap-3 border-b border-[#D1D1D5] py-4" href="/dashboard?section=saved" onClick={() => setMenuOpen(false)}>
            <AnimatedIcon icon="ph:heart-bold" size="sm" variant="solid" hover="scale" />{tx("Saved homes", "သိမ်းထားသောအိမ်များ")}
          </Link>
          {user && <button type="button" onClick={() => { handleSignOut(); setMenuOpen(false); }} className="flex items-center gap-3 border-b border-[#D1D1D5] py-4 text-[#D92D20]">
            <AnimatedIcon icon="ph:sign-out-bold" size="sm" hover="scale" />{tx("Sign out", "အကောင့်ထွက်ရန်")}
          </button>}
        </nav>
      </Sheet>
    </header>
  );
}

export { AppHeader };

"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { cn } from "@/lib/utils";

interface MobileAppHeaderProps {
  avatarAlt?: string;
  className?: string;
  notificationHref?: string;
  onAvatarClick?: () => void;
  onNotificationClick?: () => void;
  theme?: "light" | "dark";
}

/** Shared primary header for the mobile A7 Property journeys. */
function MobileAppHeader({
  avatarAlt = "Thiri Win",
  className,
  notificationHref = "/messages",
  onAvatarClick,
  onNotificationClick,
  theme = "light",
}: MobileAppHeaderProps) {
  const { tx } = useLanguage();
  const isDark = theme === "dark";
  const iconColor = isDark ? "text-[#E7E9EE] hover:bg-white/10" : "text-[#424655] hover:bg-[#EFEDF1]";
  const languageButton = isDark
    ? "h-9 gap-1.5 rounded-full bg-white/10 px-2.5 text-[#E7E9EE] hover:bg-white/15 hover:text-white sm:h-11 sm:gap-2 sm:px-4"
    : "h-9 gap-1.5 rounded-full bg-[#EFEDF1] px-2.5 text-[#424655] hover:bg-[#E3E2E6] hover:text-[#424655] sm:h-11 sm:gap-2 sm:px-4";

  const avatar = (
    <span className="relative block size-9 overflow-hidden rounded-full border border-[#D9DDE8] bg-[#EFE8DD] shadow-[0_2px_8px_rgba(16,24,40,.10)] sm:size-11">
      <Image src="/images/profile/thiri-win.jpg" alt={avatarAlt} fill sizes="44px" className="object-cover" />
    </span>
  );

  return (
    <div className={cn("mx-auto flex h-16 w-full max-w-[920px] items-center justify-between gap-2 px-3 sm:px-6", className)}>
      <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3" aria-label={tx("A7 Property home", "A7 Property ပင်မစာမျက်နှာ")}>
        <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_2px_8px_rgba(16,24,40,.12)] sm:size-11">
          <Image src="/images/brand/a7-property-logo.jpg" alt="" fill sizes="44px" className="scale-[2.55] object-contain" />
        </span>
        <span className="truncate text-[19px] font-semibold tracking-[-.045em] text-[#0053D2] sm:text-[26px]">A7 Property</span>
      </Link>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <LanguageSwitcher className="shrink-0" buttonClassName={languageButton} />
        {onNotificationClick ? (
          <button type="button" onClick={onNotificationClick} className={cn("relative grid size-9 place-items-center rounded-full transition-colors sm:size-11", iconColor)} aria-label={tx("Notifications", "အသိပေးချက်များ")}>
            <Bell className="size-5 sm:size-6" strokeWidth={1.9} />
            <span className={cn("absolute right-1 top-1 size-1.5 rounded-full bg-[#007AFF] ring-2 sm:right-1.5 sm:top-1.5 sm:size-2", isDark ? "ring-[#202124]" : "ring-white")} />
          </button>
        ) : (
          <Link href={notificationHref} className={cn("relative grid size-9 place-items-center rounded-full transition-colors sm:size-11", iconColor)} aria-label={tx("Messages and alerts", "မက်ဆေ့ချ်နှင့် အသိပေးချက်များ")}>
            <Bell className="size-5 sm:size-6" strokeWidth={1.9} />
            <span className={cn("absolute right-1 top-1 size-1.5 rounded-full bg-[#007AFF] ring-2 sm:right-1.5 sm:top-1.5 sm:size-2", isDark ? "ring-[#202124]" : "ring-white")} />
          </Link>
        )}
        {onAvatarClick ? (
          <button type="button" onClick={onAvatarClick} aria-label={tx("Edit profile", "ပရိုဖိုင်ပြင်ရန်")} className="rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0053D2]/25">
            {avatar}
          </button>
        ) : (
          <Link href="/profile" aria-label={tx("Open profile", "ပရိုဖိုင်ဖွင့်ရန်")}>
            {avatar}
          </Link>
        )}
      </div>
    </div>
  );
}

export { MobileAppHeader };

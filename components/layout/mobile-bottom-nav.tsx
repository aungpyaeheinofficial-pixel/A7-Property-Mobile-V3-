"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, Home, MessageCircle, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/components/i18n/language-provider";
import { a7Motion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const items = [
  { id: "home", href: "/", label: "Home", labelMy: "ပင်မ", icon: Home },
  { id: "search", href: "/search?purpose=rent", label: "Explore", labelMy: "လေ့လာ", icon: Search },
  { id: "saved", href: "/saved", label: "Saved", labelMy: "သိမ်းထား", icon: Heart },
  { id: "messages", href: "/messages", label: "Messages", labelMy: "စာများ", icon: MessageCircle },
  { id: "profile", href: "/profile", label: "Profile", labelMy: "ပရိုဖိုင်", icon: UserRound },
] as const;

function MobileBottomNav() {
  const pathname = usePathname();
  const { isMyanmar, tx } = useLanguage();
  const reduceMotion = useReducedMotion();
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/owner") || pathname.startsWith("/agent") || pathname.startsWith("/properties")) return null;

  const activeId = pathname === "/"
    ? "home"
    : pathname.startsWith("/search") || pathname.startsWith("/properties")
      ? "search"
      : pathname.startsWith("/saved") || pathname.startsWith("/dashboard") || pathname.startsWith("/compare")
        ? "saved"
        : pathname.startsWith("/messages")
          ? "messages"
          : pathname.startsWith("/profile")
            ? "profile"
            : "home";

  return (
    <nav
      className="fixed inset-x-2.5 bottom-[max(.625rem,env(safe-area-inset-bottom))] z-[80] mx-auto grid h-[72px] max-w-[520px] grid-cols-5 rounded-[28px] border border-white/80 bg-[rgba(255,255,255,.55)] px-2.5 py-2 shadow-[0_8px_30px_rgba(31,71,136,.12),inset_0_1px_0_rgba(255,255,255,.92),inset_0_-1px_0_rgba(160,190,255,.12)] backdrop-blur-[22px] backdrop-saturate-[1.8] lg:hidden"
      aria-label={tx("Primary mobile navigation", "မိုဘိုင်းအဓိက လမ်းညွှန်")}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeId;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-[20px] px-0.5 text-[10px] font-medium transition-[color,transform] duration-200 active:scale-[.96]",
              active ? "text-[#0A67FF]" : "text-[#7D8BA0] hover:text-[#0A67FF]",
            )}
          >
            <motion.span animate={reduceMotion ? undefined : { scale: active ? 1.06 : 1, y: active ? -1 : 0 }} transition={reduceMotion ? { duration: 0 } : a7Motion.base} className="relative z-10 flex h-9 w-11 items-center justify-center rounded-[18px] transition-colors duration-200 group-hover:bg-white/28">
              {active && <motion.span layoutId="a7-mobile-nav-active" className="absolute -inset-x-1.5 -inset-y-1 rounded-[22px] border border-white/85 bg-[rgba(10,103,255,.14)] shadow-[0_6px_18px_rgba(10,103,255,.18),inset_0_1px_0_rgba(255,255,255,.94),inset_0_-1px_0_rgba(145,185,255,.16)] backdrop-blur-[20px] backdrop-saturate-[1.8]" transition={reduceMotion ? { duration: 0 } : a7Motion.spring} aria-hidden="true" />}
              <Icon className={cn("relative z-10 size-5 transition-[color,fill] duration-200", active ? "text-[#0A67FF]" : "text-[#7D8BA0]", active && item.id === "saved" && "fill-current")} strokeWidth={active ? 2.3 : 1.9} />
            </motion.span>
            <span className={cn("relative z-10 max-w-full truncate px-0.5 leading-none", active ? "font-semibold text-[#243247]" : "text-[#7D8BA0]")}>{isMyanmar ? item.labelMy : item.label}</span>
            {item.id === "messages" && <span className="absolute right-[26%] top-2 z-20 size-[7px] rounded-full bg-[#0A67FF] shadow-[0_0_0_2px_rgba(255,255,255,.8)]" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export { MobileBottomNav };

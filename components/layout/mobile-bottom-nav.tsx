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
  { id: "search", href: "/search?purpose=rent", label: "Search", labelMy: "ရှာဖွေ", icon: Search },
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
      className="a7-glass fixed inset-x-0 bottom-0 z-[80] grid h-[72px] grid-cols-5 border-x-0 border-b-0 px-2 pb-[max(.375rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_20px_rgba(15,27,45,.055)] lg:hidden"
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
              "relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-[14px] px-1 text-[9px] font-semibold transition-[color,transform] duration-200 active:scale-[.96]",
              active ? "text-a7-blue" : "text-[#747B86]",
            )}
          >
            {active && <motion.span layoutId="a7-mobile-nav-indicator" className="absolute top-1.5 h-8 w-12 rounded-full bg-[#EDF4FF]" transition={reduceMotion ? { duration: 0 } : a7Motion.spring} aria-hidden="true" />}
            <motion.span animate={reduceMotion ? undefined : { y: active ? -1 : 0 }} transition={reduceMotion ? { duration: 0 } : a7Motion.base} className="relative z-10 grid place-items-center">
              <Icon className={cn("size-[20px] transition-[color,fill] duration-200", active && item.id === "saved" && "fill-a7-blue")} strokeWidth={active ? 2.3 : 1.9} />
            </motion.span>
            <motion.span animate={reduceMotion ? undefined : { opacity: active ? 1 : 0.78 }} className="relative z-10 truncate">{isMyanmar ? item.labelMy : item.label}</motion.span>
            {item.id === "messages" && <span className="absolute right-[26%] top-2 z-20 size-2 rounded-full border-2 border-white bg-a7-blue" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export { MobileBottomNav };

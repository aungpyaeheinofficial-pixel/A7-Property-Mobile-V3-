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
      className="fixed inset-x-3 bottom-[max(.625rem,env(safe-area-inset-bottom))] z-[80] mx-auto grid h-[68px] max-w-[520px] grid-cols-5 rounded-[28px] border border-white/75 bg-[rgba(255,255,255,.68)] px-1.5 shadow-[0_8px_30px_rgba(15,23,42,.12),inset_0_1px_0_rgba(255,255,255,.85)] backdrop-blur-[22px] backdrop-saturate-[1.8] lg:hidden"
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
              "relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[20px] px-0.5 text-[9px] font-semibold transition-[color,transform] duration-200 active:scale-[.96]",
              active ? "text-[#0667E8]" : "text-[#667085] hover:text-a7-blue",
            )}
          >
            {active && (
              <motion.span
                layoutId="a7-mobile-nav-bubble"
                className="absolute top-1.5 left-[calc(50%-22px)] size-11 rounded-full border border-white/65 bg-[rgba(6,103,232,.14)] shadow-[0_4px_12px_rgba(6,103,232,.18),inset_0_1px_1px_rgba(255,255,255,.8)] backdrop-blur-md"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 440, damping: 34, mass: 0.72 }}
                aria-hidden="true"
              />
            )}
            <motion.span animate={reduceMotion ? undefined : { y: active ? -2 : 0, scale: active ? 1.05 : 1 }} transition={reduceMotion ? { duration: 0 } : a7Motion.spring} className="relative z-10 grid place-items-center">
              <Icon className={cn("size-[20px] transition-[color,fill] duration-200", active && item.id === "saved" && "fill-current")} strokeWidth={active ? 2.3 : 1.9} />
            </motion.span>
            <motion.span animate={reduceMotion ? undefined : { opacity: active ? 1 : 0.76 }} transition={reduceMotion ? { duration: 0 } : a7Motion.base} className="relative z-10 max-w-full truncate px-0.5">{isMyanmar ? item.labelMy : item.label}</motion.span>
            {item.id === "messages" && <span className="absolute right-[25%] top-2 z-20 size-2 rounded-full border-2 border-white bg-a7-blue" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export { MobileBottomNav };

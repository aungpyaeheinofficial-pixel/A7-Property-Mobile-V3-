"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardRole = "user" | "owner" | "agent";

interface DashboardShellProps {
  role: DashboardRole;
  name: string;
  initials: string;
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  onNotifications?: () => void;
  children: ReactNode;
}

const userNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Saved homes", href: "/dashboard?section=saved", icon: Heart },
  { label: "Messages", href: "/dashboard?section=messages", icon: MessageCircle },
  { label: "Viewings", href: "/dashboard?section=viewings", icon: CalendarDays },
  { label: "Profile", href: "/profile", icon: UserRound },
];

const crmNav = (role: "owner" | "agent") => [
  { label: "Overview", href: `/${role}`, icon: LayoutDashboard },
  { label: "Properties", href: `/${role}?section=properties`, icon: Building2 },
  { label: "Messages", href: `/${role}?section=messages`, icon: MessageCircle },
  { label: "Analytics", href: `/${role}?section=analytics`, icon: BarChart3 },
  { label: "Verification", href: `/${role}?section=verification`, icon: ShieldCheck },
  { label: "Settings", href: `/${role}?section=settings`, icon: Settings },
];

function DashboardShell({ role, name, initials, title, description, primaryAction, onNotifications, children }: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") ?? "overview";
  const nav = role === "user" ? userNav : crmNav(role);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_78%_-10%,rgba(18,59,115,.08),transparent_28rem),#EAF4FF] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#101828_0%,#101828_100%)] text-white shadow-[12px_0_36px_rgba(23,43,63,.08)] lg:flex">
        <Link href="/" className="flex h-[76px] items-center gap-2.5 border-b border-white/10 px-6">
          <A7Brand inverted />
          {role !== "user" && <span className="ml-auto rounded-full bg-[#F8FBFF]/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-wider">{role}</span>}
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Dashboard navigation">
          {nav.map((item) => {
            const section = new URL(item.href, "https://a7.local").searchParams.get("section") ?? "overview";
            const active = item.href.split("?")[0] === pathname && section === activeSection;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/68 transition-all hover:bg-[#F8FBFF]/8 hover:text-white", active && "bg-[#F8FBFF]/12 text-white shadow-[inset_0_0_0_1px_rgba(248,251,255,.08)]")}>
                <Icon className="size-[18px]" />{item.label}
              </Link>
            );
          })}
          <Link href="/search?purpose=rent" className="mt-auto flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/68 hover:bg-[#F8FBFF]/8 hover:text-white"><Search className="size-[18px]" />Browse marketplace</Link>
        </nav>
        <Link href={role === "user" ? "/profile" : `/${role}?section=settings`} className="m-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#F8FBFF]/6 p-3 transition-colors hover:bg-[#F8FBFF]/10">
          <span className="grid size-10 place-items-center rounded-full bg-[#DCEBFF] text-sm font-semibold text-[#101828]">{initials}</span>
          <span className="min-w-0"><strong className="block truncate text-xs">{name}</strong><small className="mt-1 block text-[9px] text-white/55">View account</small></span>
        </Link>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#101828]/8 bg-[#F8FBFF]/82 px-4 shadow-[0_1px_0_rgba(248,251,255,.8)] backdrop-blur-2xl sm:px-7 lg:px-9">
          <Link href="/" className="inline-flex items-center lg:hidden" aria-label="A7 Property home"><A7Brand /></Link>
          <div className="hidden lg:block"><span className="text-xs font-medium text-[#667085]">{role === "user" ? "My A7 Property" : `${role[0].toUpperCase()}${role.slice(1)} workspace`}</span></div>
          <div className="flex items-center gap-2">
            {primaryAction && <div className="hidden sm:block"><Button className="h-10 rounded-xl text-xs" onClick={primaryAction.onClick}><Plus className="size-4" />{primaryAction.label}</Button></div>}
            <LanguageSwitcher className="hidden sm:block" />
            <LanguageSwitcher compact className="sm:hidden" />
            <Button size="icon" variant="ghost" className="relative rounded-xl" aria-label="Notifications" onClick={onNotifications}><Bell className="size-5" /><span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-[#123B73]" /></Button>
            <span className="grid size-9 place-items-center rounded-full bg-[#DCEBFF] text-xs font-semibold text-[#123B73]">{initials}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1460px] px-4 pb-28 pt-6 sm:px-7 lg:px-9 lg:pb-12 lg:pt-9">
          <div className="mb-6 flex items-end justify-between gap-5 sm:mb-8">
            <div><p className="eyebrow mb-2">{role === "user" ? "My A7 Property" : `${role} workspace`}</p><h1 className="text-[28px] font-semibold tracking-[-0.045em] sm:text-[34px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#667085] sm:text-sm">{description}</p>}</div>
            {primaryAction && <div className="sm:hidden"><Button size="icon" onClick={primaryAction.onClick} aria-label={primaryAction.label}><Plus className="size-5" /></Button></div>}
          </div>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-2 z-50 grid h-[66px] grid-cols-4 rounded-[22px] border border-[#101828]/10 bg-[#F8FBFF]/92 p-1.5 shadow-[0_14px_36px_rgba(23,43,63,.18)] backdrop-blur-2xl lg:hidden" aria-label="Mobile dashboard navigation">
        {nav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const section = new URL(item.href, "https://a7.local").searchParams.get("section") ?? "overview";
          const active = section === activeSection;
          return <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition-colors", active ? "bg-[#DCEBFF] text-[#123B73]" : "text-[#667085] hover:bg-[#F8FBFF] hover:text-[#123B73]")}><Icon className="size-[19px]" />{item.label}</Link>;
        })}
      </nav>
    </div>
  );
}

export { DashboardShell };
export type { DashboardRole };

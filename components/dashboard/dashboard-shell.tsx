"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Heart,
  House,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

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
  children: ReactNode;
}

const userNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Saved homes", href: "/dashboard?section=saved", icon: Heart },
  { label: "Messages", href: "/dashboard?section=messages", icon: MessageCircle },
  { label: "Viewings", href: "/dashboard?section=viewings", icon: CalendarDays },
  { label: "Profile", href: "/dashboard?section=profile", icon: UserRound },
];

const crmNav = (role: "owner" | "agent") => [
  { label: "Overview", href: `/${role}`, icon: LayoutDashboard },
  { label: "Properties", href: `/${role}?section=properties`, icon: Building2 },
  { label: "Messages", href: `/${role}?section=messages`, icon: MessageCircle },
  { label: "Analytics", href: `/${role}?section=analytics`, icon: BarChart3 },
  { label: "Verification", href: `/${role}?section=verification`, icon: ShieldCheck },
  { label: "Settings", href: `/${role}?section=settings`, icon: Settings },
];

function DashboardShell({ role, name, initials, title, description, primaryAction, children }: DashboardShellProps) {
  const pathname = usePathname();
  const nav = role === "user" ? userNav : crmNav(role);

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#17211e]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[250px] flex-col border-r border-white/10 bg-[#123c33] text-white lg:flex">
        <Link href="/" className="flex h-[76px] items-center gap-2.5 border-b border-white/10 px-6">
          <span className="grid size-9 place-items-center rounded-xl bg-[#ead5b4] text-[#123c33]"><House className="size-5" /></span>
          <span className="text-[23px] font-semibold tracking-[-0.04em]">eain<span className="text-[#c97850]">.</span></span>
          {role !== "user" && <span className="ml-auto rounded-full bg-white/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-wider">{role}</span>}
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Dashboard navigation">
          {nav.map((item) => {
            const active = item.href.split("?")[0] === pathname && item.label === "Overview";
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/68 transition-colors hover:bg-white/8 hover:text-white", active && "bg-white/12 text-white")}>
                <Icon className="size-[18px]" />{item.label}
              </Link>
            );
          })}
          <Link href="/search" className="mt-auto flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/68 hover:bg-white/8 hover:text-white"><Search className="size-[18px]" />Browse marketplace</Link>
        </nav>
        <div className="m-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#ead5b4] text-sm font-semibold text-[#123c33]">{initials}</span>
          <span className="min-w-0"><strong className="block truncate text-xs">{name}</strong><small className="mt-1 block text-[9px] text-white/55">View account</small></span>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#123c33]/8 bg-[#f4f5f2]/92 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <Link href="/" className="inline-flex items-center gap-2 lg:hidden"><span className="grid size-8 place-items-center rounded-[10px] bg-[#194e42] text-white"><House className="size-[17px]" /></span><strong className="text-lg">eain.</strong></Link>
          <div className="hidden lg:block"><span className="text-xs font-medium text-[#7b837f]">{role === "user" ? "My Eain" : `${role[0].toUpperCase()}${role.slice(1)} workspace`}</span></div>
          <div className="flex items-center gap-2">
            {primaryAction && <Button className="hidden h-10 text-xs sm:inline-flex" onClick={primaryAction.onClick}><Plus className="size-4" />{primaryAction.label}</Button>}
            <Button size="icon" variant="ghost" className="relative" aria-label="Notifications"><Bell className="size-5" /><span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-[#f4f5f2] bg-[#b7653d]" /></Button>
            <span className="grid size-9 place-items-center rounded-full bg-[#ddece7] text-xs font-semibold text-[#194e42]">{initials}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1460px] px-4 pb-28 pt-7 sm:px-7 lg:px-9 lg:pb-12 lg:pt-9">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div><h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-[30px]">{title}</h1>{description && <p className="mt-2 text-xs leading-5 text-[#58615d] sm:text-sm">{description}</p>}</div>
            {primaryAction && <Button className="sm:hidden" size="icon" onClick={primaryAction.onClick} aria-label={primaryAction.label}><Plus className="size-5" /></Button>}
          </div>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-2 z-50 grid h-16 grid-cols-4 rounded-[19px] border border-[#123c33]/10 bg-white/95 p-1.5 shadow-[0_14px_40px_rgba(18,33,30,.16)] backdrop-blur-xl lg:hidden" aria-label="Mobile dashboard navigation">
        {nav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-medium text-[#7b837f] hover:bg-[#eff7f4] hover:text-[#236457]"><Icon className="size-[19px]" />{item.label}</Link>;
        })}
      </nav>
    </div>
  );
}

export { DashboardShell };
export type { DashboardRole };

"use client";

import Link from "next/link";
import { CircleUserRound, Heart, House, Menu, MessageCircle, Search } from "lucide-react";
import { useState } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

interface AppHeaderProps {
  compact?: boolean;
}

function AppHeader({ compact = false }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={`sticky top-0 z-50 border-b border-[#0b3768]/10 bg-white/95 backdrop-blur-xl ${compact ? "h-16" : "h-[72px]"}`}>
      <div className="mx-auto flex h-full w-full max-w-[1380px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="A7 Property home"><A7Brand /></Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
          <Link className="hover:text-[#0f6fb2]" href="/search">Search</Link>
          <Link className="hover:text-[#0f6fb2]" href="/search?purpose=rent">Rent</Link>
          <Link className="hover:text-[#0f6fb2]" href="/search?purpose=sale">Buy</Link>
          <Link className="hover:text-[#0f6fb2]" href="/assistant">AI assistant</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden h-10 items-center gap-2 rounded-full border border-[#0b3768]/10 bg-white px-4 text-xs text-[#4e6478] shadow-sm sm:flex">
            <Search className="size-4" /> Find a home
          </Link>
          <Link href="/dashboard?section=saved" className="hidden size-10 place-items-center rounded-full hover:bg-[#f0f8fd] sm:grid" aria-label="Saved homes"><Heart className="size-[19px]" /></Link>
          <Link href="/dashboard" className="grid size-10 place-items-center rounded-full border border-[#0b3768]/10 bg-white" aria-label="Profile"><CircleUserRound className="size-[22px]" /></Link>
          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Explore A7 Property" side="right">
        <nav className="flex flex-col p-5 text-sm font-medium">
          <Link className="flex items-center gap-3 border-b border-[#e3eaf1] py-4" href="/search" onClick={() => setMenuOpen(false)}><Search className="size-5 text-[#0f6fb2]" />Search homes</Link>
          <Link className="flex items-center gap-3 border-b border-[#e3eaf1] py-4" href="/search?purpose=rent" onClick={() => setMenuOpen(false)}><House className="size-5 text-[#0f6fb2]" />Rent a home</Link>
          <Link className="flex items-center gap-3 border-b border-[#e3eaf1] py-4" href="/assistant" onClick={() => setMenuOpen(false)}><MessageCircle className="size-5 text-[#0f6fb2]" />AI home assistant</Link>
          <Link className="flex items-center gap-3 border-b border-[#e3eaf1] py-4" href="/dashboard?section=saved" onClick={() => setMenuOpen(false)}><Heart className="size-5 text-[#0f6fb2]" />Saved homes</Link>
          <Link className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#0f6fb2] text-white" href="/owner" onClick={() => setMenuOpen(false)}>List your property</Link>
        </nav>
      </Sheet>
    </header>
  );
}

export { AppHeader };

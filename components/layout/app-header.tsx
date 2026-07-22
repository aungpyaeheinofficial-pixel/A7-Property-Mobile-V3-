"use client";

import Link from "next/link";
import { CircleUserRound, Heart, House, Menu, MessageCircle, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

interface AppHeaderProps {
  compact?: boolean;
}

function AppHeader({ compact = false }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={`sticky top-0 z-50 border-b border-[#123c33]/10 bg-[#f8f7f3]/94 backdrop-blur-xl ${compact ? "h-16" : "h-[72px]"}`}>
      <div className="mx-auto flex h-full w-full max-w-[1380px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Eain home">
          <span className="grid size-9 place-items-center rounded-[12px] bg-[#194e42] text-white"><House className="size-5" /></span>
          <span className="text-[23px] font-semibold tracking-[-0.04em]">eain<span className="text-[#b7653d]">.</span></span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
          <Link className="hover:text-[#236457]" href="/search">Search</Link>
          <Link className="hover:text-[#236457]" href="/search?purpose=rent">Rent</Link>
          <Link className="hover:text-[#236457]" href="/search?purpose=sale">Buy</Link>
          <Link className="hover:text-[#236457]" href="/assistant">AI assistant</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden h-10 items-center gap-2 rounded-full border border-[#123c33]/10 bg-white px-4 text-xs text-[#58615d] shadow-sm sm:flex">
            <Search className="size-4" /> Find a home
          </Link>
          <Link href="/dashboard?section=saved" className="hidden size-10 place-items-center rounded-full hover:bg-[#eff7f4] sm:grid" aria-label="Saved homes"><Heart className="size-[19px]" /></Link>
          <Link href="/dashboard" className="grid size-10 place-items-center rounded-full border border-[#123c33]/10 bg-white" aria-label="Profile"><CircleUserRound className="size-[22px]" /></Link>
          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Explore Eain" side="right">
        <nav className="flex flex-col p-5 text-sm font-medium">
          <Link className="flex items-center gap-3 border-b border-[#eceae4] py-4" href="/search" onClick={() => setMenuOpen(false)}><Search className="size-5 text-[#236457]" />Search homes</Link>
          <Link className="flex items-center gap-3 border-b border-[#eceae4] py-4" href="/search?purpose=rent" onClick={() => setMenuOpen(false)}><House className="size-5 text-[#236457]" />Rent a home</Link>
          <Link className="flex items-center gap-3 border-b border-[#eceae4] py-4" href="/assistant" onClick={() => setMenuOpen(false)}><MessageCircle className="size-5 text-[#236457]" />AI home assistant</Link>
          <Link className="flex items-center gap-3 border-b border-[#eceae4] py-4" href="/dashboard?section=saved" onClick={() => setMenuOpen(false)}><Heart className="size-5 text-[#236457]" />Saved homes</Link>
          <Link className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#194e42] text-white" href="/owner" onClick={() => setMenuOpen(false)}>List your property</Link>
        </nav>
      </Sheet>
    </header>
  );
}

export { AppHeader };

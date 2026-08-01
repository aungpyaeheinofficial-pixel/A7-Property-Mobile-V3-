"use client";

import Image from "next/image";
import { Expand, Images } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const gallery = images.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  function view(index: number) {
    setSelected(index);
    setOpen(true);
  }

  return (
    <>
      <section className="relative grid h-[310px] grid-cols-1 gap-2 overflow-hidden rounded-[26px] border border-white bg-[#DCE8F6] shadow-[0_18px_55px_rgba(23,43,63,.12)] sm:h-[430px] md:grid-cols-2 lg:h-[500px] lg:grid-cols-[1.25fr_.75fr]" aria-label="Property photos">
        <button className="relative overflow-hidden bg-[#EAF2FF] text-left" onClick={() => view(0)} aria-label="Open main property photo">
          <Image src={gallery[0]} alt={`${title} — main view`} fill priority sizes="(max-width: 768px) 100vw, 62vw" className="object-cover transition-transform duration-500 hover:scale-[1.02]" />
        </button>
        <div className="hidden grid-cols-2 gap-2 bg-[#EAF2FF] md:grid">
          {gallery.slice(1, 5).map((image, index) => <button key={`${image}-${index}`} className="relative overflow-hidden bg-[#EAF2FF]" onClick={() => view(index + 1)} aria-label={`Open property photo ${index + 2}`}><Image src={image} alt={`${title} — view ${index + 2}`} fill sizes="20vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" /></button>)}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#102236]/30 to-transparent" />
        <Button variant="outline" className="absolute bottom-4 right-4 h-10 border-white/70 bg-white/92 px-3 text-xs shadow-lg backdrop-blur-xl hover:bg-white" onClick={() => setOpen(true)}><Images className="size-4" />View {gallery.length} photos</Button>
      </section>

      <Sheet open={open} onOpenChange={setOpen} title="Property gallery" description={`${gallery.length} professional property photos`} side="bottom" className="h-[94vh] max-h-none">
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[1fr_auto] gap-4 p-4 sm:p-6">
          <div className="relative min-h-0 overflow-hidden rounded-[18px] bg-[#2A2A33]">
            <Image src={gallery[selected]} alt={`${title} — enlarged view ${selected + 1}`} fill sizes="100vw" className="object-contain" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[10px] text-white backdrop-blur"><Expand className="size-3.5" />{selected + 1} / {gallery.length}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((image, index) => <button key={`${image}-thumb-${index}`} className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2", selected === index ? "border-[#006AFF]" : "border-transparent opacity-65")} onClick={() => setSelected(index)} aria-label={`View photo ${index + 1}`} aria-pressed={selected === index}><Image src={image} alt="" fill sizes="96px" className="object-cover" /></button>)}
          </div>
        </div>
      </Sheet>
    </>
  );
}

export { PropertyGallery };

"use client";

import { Expand, Heart, Images } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  verified?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}

function PropertyGallery({ images, title, favorite = false, onToggleFavorite }: PropertyGalleryProps) {
  const gallery = images.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);

  function handleScroll() {
    if (!railRef.current) return;
    const next = Math.round(railRef.current.scrollLeft / railRef.current.clientWidth);
    if (next !== selected && next >= 0 && next < gallery.length) setSelected(next);
  }

  return (
    <>
      <section aria-label="Property photos" className="relative overflow-hidden bg-[#E1E2EE]">
        <div ref={railRef} onScroll={handleScroll} className="hide-scrollbar flex aspect-[16/10] max-h-[520px] snap-x snap-mandatory overflow-x-auto">
          {gallery.map((image, index) => (
            <button key={`${image}-hero-${index}`} type="button" onClick={() => { setSelected(index); setOpen(true); }} className="relative min-w-full snap-center overflow-hidden bg-[#E1E2EE] text-left" aria-label={`Open property photo ${index + 1}`}>
              <Image src={image} alt={`${title} — view ${index + 1}`} fill priority={index === 0} sizes="(max-width: 800px) 100vw, 760px" className="object-cover transition-transform duration-700 hover:scale-[1.025]" />
              <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" aria-hidden="true" />
            </button>
          ))}
        </div>

        <span className="pointer-events-none absolute bottom-3 right-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-[#FAF8FF]/90 px-3 text-[10px] font-semibold text-[#191B24] shadow-sm backdrop-blur-md"><Images className="size-4" />{selected + 1} / {gallery.length}</span>
        {onToggleFavorite && <button type="button" onClick={onToggleFavorite} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-[#FAF8FF]/90 text-[#0053D2] shadow-[0_4px_18px_rgba(0,0,0,.12)] backdrop-blur-md transition-transform active:scale-95" aria-label={favorite ? "Remove from saved homes" : "Save property"} aria-pressed={favorite}><Heart className={cn("size-5", favorite && "fill-current")} /></button>}

        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
          {gallery.map((_, index) => <span key={index} className={cn("h-1.5 rounded-full bg-white shadow-sm transition-[width,opacity]", selected === index ? "w-4 opacity-100" : "w-1.5 opacity-55")} />)}
        </div>
      </section>

      <BottomSheet open={open} onOpenChange={setOpen} title="Property gallery" description={`${gallery.length} property photos`} className="h-[94vh] max-h-none">
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[1fr_auto] gap-4 p-4 sm:p-6">
          <div className="relative min-h-0 overflow-hidden rounded-[20px] bg-[#191B24]">
            <Image src={gallery[selected]} alt={`${title} — enlarged view ${selected + 1}`} fill sizes="100vw" className="object-contain" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#191B24]/68 px-3 py-1.5 text-[10px] text-white backdrop-blur"><Expand className="size-3.5" />{selected + 1} / {gallery.length}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((image, index) => <button key={`${image}-thumb-${index}`} className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-[12px] border-2", selected === index ? "border-[#0053D2]" : "border-transparent opacity-65")} onClick={() => setSelected(index)} aria-label={`View photo ${index + 1}`} aria-pressed={selected === index}><Image src={image} alt="" fill sizes="96px" className="object-cover" /></button>)}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

const ImageGallery = PropertyGallery;

export { ImageGallery, PropertyGallery };

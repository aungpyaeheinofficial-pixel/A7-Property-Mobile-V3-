"use client";

import { Expand, Heart, Images, PlayCircle, ScanLine, ShieldCheck, Video } from "lucide-react";
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

type MediaMode = "photos" | "video" | "floorplan";

function PropertyGallery({ images, title, verified = false, favorite = false, onToggleFavorite }: PropertyGalleryProps) {
  const gallery = images.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<MediaMode>("photos");
  const railRef = useRef<HTMLDivElement | null>(null);

  function openMedia(nextMode: MediaMode, index = 0) {
    setMode(nextMode);
    setSelected(index);
    setOpen(true);
  }

  function handleScroll() {
    if (!railRef.current) return;
    const next = Math.round(railRef.current.scrollLeft / railRef.current.clientWidth);
    if (next !== selected && next >= 0 && next < gallery.length) setSelected(next);
  }

  return (
    <>
      <section aria-label="Property media">
        <div className="relative overflow-hidden rounded-b-[24px] bg-[#E8E6E1] shadow-[0_4px_20px_rgba(15,27,45,.08)] sm:rounded-[24px]">
          <div ref={railRef} onScroll={handleScroll} className="hide-scrollbar flex h-[330px] snap-x snap-mandatory overflow-x-auto sm:h-[440px] lg:h-[520px]">
            {gallery.map((image, index) => (
              <button key={`${image}-hero-${index}`} type="button" onClick={() => openMedia("photos", index)} className="relative min-w-full snap-center overflow-hidden bg-[#E8E6E1] text-left" aria-label={`Open property photo ${index + 1}`}>
                <Image src={image} alt={`${title} — view ${index + 1}`} fill priority={index === 0} sizes="100vw" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0F1B2D]/55 to-transparent" aria-hidden="true" />
              </button>
            ))}
          </div>

          {verified && <span className="pointer-events-none absolute bottom-4 left-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[9px] font-semibold text-[#0057D9] shadow-sm"><ShieldCheck className="size-3.5" />Verified property</span>}
          <span className="pointer-events-none absolute bottom-4 right-4 inline-flex h-8 items-center rounded-full bg-[#0F1B2D]/72 px-3 text-[10px] font-semibold text-white backdrop-blur-sm">{selected + 1} / {gallery.length}</span>
          {onToggleFavorite && (
            <button type="button" onClick={onToggleFavorite} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-[#0057D9] shadow-[0_4px_20px_rgba(15,27,45,.14)] transition-transform duration-200 active:scale-95" aria-label={favorite ? "Remove from saved homes" : "Save property"} aria-pressed={favorite}><Heart className={cn("size-5", favorite && "fill-current")} /></button>
          )}

          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden" aria-hidden="true">
            {gallery.map((_, index) => <span key={index} className={cn("h-1.5 rounded-full bg-white transition-[width,opacity] duration-200", selected === index ? "w-4 opacity-100" : "w-1.5 opacity-55")} />)}
          </div>
        </div>

        <div className="mx-3 mt-3 grid grid-cols-3 gap-2 sm:mx-0">
          <button type="button" onClick={() => openMedia("photos", selected)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[14px] border border-[#D9DEE7] bg-white px-2 text-[9px] font-semibold text-[#344054]"><Images className="size-4 text-[#0057D9]" />Photos <span className="text-[#667085]">{gallery.length}</span></button>
          <button type="button" onClick={() => openMedia("video")} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[14px] border border-[#D9DEE7] bg-white px-2 text-[9px] font-semibold text-[#344054]"><Video className="size-4 text-[#0057D9]" />Video tour</button>
          <button type="button" onClick={() => openMedia("floorplan")} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[14px] border border-[#D9DEE7] bg-white px-2 text-[9px] font-semibold text-[#344054]"><ScanLine className="size-4 text-[#0057D9]" />Floor plan</button>
        </div>
      </section>

      <BottomSheet open={open} onOpenChange={setOpen} title={mode === "photos" ? "Property gallery" : mode === "video" ? "Video tour" : "Floor plan"} description={mode === "photos" ? `${gallery.length} verified property photos` : mode === "video" ? "A guided walkthrough placeholder" : "Layout preview placeholder"} className="h-[94vh] max-h-none">
        {mode === "photos" ? (
          <div className="mx-auto grid h-full max-w-6xl grid-rows-[1fr_auto] gap-4 p-4 sm:p-6">
            <div className="relative min-h-0 overflow-hidden rounded-[20px] bg-[#0F1B2D]">
              <Image src={gallery[selected]} alt={`${title} — enlarged view ${selected + 1}`} fill sizes="100vw" className="object-contain" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#0F1B2D]/68 px-3 py-1.5 text-[10px] text-white backdrop-blur"><Expand className="size-3.5" />{selected + 1} / {gallery.length}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((image, index) => <button key={`${image}-thumb-${index}`} className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-[12px] border-2", selected === index ? "border-[#0057D9]" : "border-transparent opacity-65")} onClick={() => setSelected(index)} aria-label={`View photo ${index + 1}`} aria-pressed={selected === index}><Image src={image} alt="" fill sizes="96px" className="object-cover" /></button>)}
            </div>
          </div>
        ) : mode === "video" ? (
          <div className="flex h-full min-h-[460px] items-center justify-center p-5">
            <div className="relative flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-[20px] bg-[#0F1B2D] text-white">
              <Image src={gallery[0]} alt="" fill sizes="100vw" className="object-cover opacity-35" />
              <div className="relative text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-white text-[#0057D9]"><PlayCircle className="size-8" /></span><strong className="mt-4 block text-[16px]">Video tour coming soon</strong><p className="mt-2 text-[11px] text-white/70">The owner is preparing a guided walkthrough.</p></div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[460px] items-center justify-center p-5">
            <div className="flex aspect-[4/3] w-full max-w-3xl flex-col items-center justify-center rounded-[20px] border border-dashed border-[#B8C9E3] bg-[#F3F7FE] px-8 text-center"><span className="grid size-16 place-items-center rounded-full bg-white text-[#0057D9] shadow-sm"><ScanLine className="size-8" /></span><strong className="mt-4 text-[16px] text-[#0F1B2D]">Floor plan coming soon</strong><p className="mt-2 max-w-sm text-[11px] leading-5 text-[#667085]">A verified room layout will appear here when the owner uploads it.</p></div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}

const ImageGallery = PropertyGallery;

export { ImageGallery, PropertyGallery };

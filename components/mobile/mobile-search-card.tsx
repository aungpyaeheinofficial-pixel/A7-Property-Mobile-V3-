"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bath, BedDouble, Check, Heart, Maximize2, Scale } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/i18n/language-provider";
import { getDiscoveryMeta } from "@/components/search/search-discovery";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { a7Motion } from "@/lib/motion";
import { formatPropertyPrice, propertyTypeLabels, type Property } from "@/lib/properties";
import { cn, countLabel } from "@/lib/utils";

interface MobileSearchCardProps {
  property: Property;
  saved: boolean;
  onToggleSaved: (property: Property) => void;
  onOpen?: () => void;
  priority?: boolean;
  compared?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (property: Property) => void;
}

function MobileSearchCard({ property, saved, onToggleSaved, onOpen, priority = false, compared = false, compareDisabled = false, onToggleCompare }: MobileSearchCardProps) {
  const { isMyanmar, tx } = useLanguage();
  const reduceMotion = useReducedMotion();
  const meta = getDiscoveryMeta(property);
  const price = formatPropertyPrice(property, isMyanmar ? "my" : "en");
  const href = `/properties/${property.id}`;

  function toggleSaved() {
    if (!reduceMotion && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
    onToggleSaved(property);
  }

  return (
    <article className="group relative overflow-hidden rounded-[var(--radius-card)] border border-a7-line bg-white shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-[var(--duration-slow)] ease-[var(--ease-standard)] hover:border-[#CAD3DF] hover:shadow-[var(--shadow-lifted)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ECEBE6]">
        <Link href={href} onClick={onOpen} className="absolute inset-0 z-10" aria-label={tx(`View ${property.title}`, `${property.title} ကိုကြည့်ရန်`)} />
        <ProgressiveImage src={property.images[0]} alt={property.title} fill priority={priority} sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1279px) 50vw, 33vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/24 to-transparent" aria-hidden="true" />

        {property.verification_status === "verified" && (
          <span className="a7-glass absolute left-3 top-3 z-20 inline-flex h-7 items-center gap-1.5 rounded-[10px] px-2.5 text-[9px] font-semibold text-a7-blue">
            <Check className="size-3.5" />{tx("A7 verified", "A7 စိစစ်ပြီး")}
          </span>
        )}

        <motion.button
          type="button"
          onClick={toggleSaved}
          aria-label={saved ? tx(`Remove ${property.title} from saved homes`, `${property.title} ကို သိမ်းထားမှုမှဖယ်ရန်`) : tx(`Save ${property.title}`, `${property.title} ကို သိမ်းရန်`)}
          aria-pressed={saved}
          animate={reduceMotion ? undefined : saved ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : a7Motion.base}
          className="a7-glass absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-full text-a7-navy"
        >
          <Heart className={cn("size-[19px]", saved && "fill-current text-[#0057D9]")} />
        </motion.button>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium text-[#6F7773]">
          <span className="truncate">{property.township}, {property.city}</span>
          <span className="shrink-0">{propertyTypeLabels[property.property_type]}</span>
        </div>

        <Link href={href} onClick={onOpen} className="mt-1.5 block min-h-11">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-[1.4] tracking-[-0.02em] text-a7-navy transition-colors group-hover:text-a7-blue">{property.title}</h2>
        </Link>

        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="min-w-0 truncate text-[18px] font-semibold tracking-[-0.03em] text-[#0057D9]">
            {price}
            {property.purpose === "rent" && <span className="ml-1 text-[9px] font-normal tracking-normal text-[#7B827E]">/ {tx("month", "လ")}</span>}
          </p>
          <span className="shrink-0 text-[9px] font-medium text-[#747C78]">{meta.updatedLabel}</span>
        </div>

        <div className="mt-3 grid grid-cols-3 border-t border-[#ECE9E3] pt-3 text-[10px] font-medium text-[#606965]">
          <span className="inline-flex items-center gap-1.5"><BedDouble className="size-4 text-[#53677F]" />{tx(countLabel(property.bedrooms, "bed"), `အိပ်ခန်း ${property.bedrooms}`)}</span>
          <span className="inline-flex items-center justify-center gap-1.5 border-x border-[#ECE9E3]"><Bath className="size-4 text-[#53677F]" />{tx(countLabel(property.bathrooms, "bath"), `ရေချိုးခန်း ${property.bathrooms}`)}</span>
          <span className="inline-flex items-center justify-end gap-1.5"><Maximize2 className="size-3.5 text-[#53677F]" />{new Intl.NumberFormat("en-US").format(property.area_sqft)} sqft</span>
        </div>
        {onToggleCompare && (
          <button type="button" onClick={() => onToggleCompare(property)} disabled={compareDisabled} aria-pressed={compared} className={cn("mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-[10px] font-semibold transition-colors", compared ? "bg-a7-navy text-white" : "bg-[#F3F1EC] text-[#53677F] hover:bg-[#EDF4FF] hover:text-a7-blue", compareDisabled && "cursor-not-allowed opacity-45")} aria-label={compared ? tx(`Remove ${property.title} from comparison`, `${property.title} ကို နှိုင်းယှဉ်မှုမှဖယ်ရန်`) : tx(`Add ${property.title} to comparison`, `${property.title} ကို နှိုင်းယှဉ်ရန်ထည့်ရန်`)}>
            {compared ? <Check className="size-4" /> : <Scale className="size-4" />}{compared ? tx("Selected to compare", "နှိုင်းယှဉ်ရန်ရွေးပြီး") : tx("Compare this home", "ဤအိမ်ကိုနှိုင်းယှဉ်")}
          </button>
        )}
      </div>
    </article>
  );
}

export { MobileSearchCard };

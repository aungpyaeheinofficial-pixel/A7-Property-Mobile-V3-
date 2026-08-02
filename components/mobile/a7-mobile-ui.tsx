"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bath, BedDouble, Check, Heart, MapPin, Maximize2, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/i18n/language-provider";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { formatPropertyPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

const mobileTheme = {
  primary: "#014BAA",
  primaryHover: "#003F91",
  primarySoft: "#EEF5FC",
  cream: "#F8F3F0",
  surface: "#FFFFFF",
  navy: "#111827",
};

function SectionHeading({
  eyebrow,
  title,
  action,
  href,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  href?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end justify-between gap-4"
    >
      <div>
        {eyebrow && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#014BAA]">{eyebrow}</p>}
        <h2 className="text-[25px] font-semibold leading-[1.18] tracking-[-0.045em] text-[#111827] sm:text-[30px]">{title}</h2>
      </div>
      {action && href && (
        <Link href={href} className="inline-flex h-11 shrink-0 items-center gap-1 text-[12px] font-semibold text-[#014BAA]">
          {action}<ArrowRight className="size-4" />
        </Link>
      )}
    </motion.div>
  );
}

function TrustPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border border-white/70 bg-white/92 px-2.5 text-[9px] font-semibold text-[#014BAA] shadow-sm backdrop-blur-md", className)}>
      <ShieldCheck className="size-3.5" />{children}
    </span>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("grid rounded-[14px] bg-[#EEF2F6] p-1", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn("h-11 rounded-[11px] px-4 text-[12px] font-semibold transition-[background-color,color,box-shadow]", selected ? "bg-white text-[#014BAA] shadow-[0_2px_8px_rgba(15,23,42,.08)]" : "text-[#66736F]")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface MobilePropertyCardProps {
  property: Property;
  saved?: boolean;
  onToggleSaved?: (property: Property) => void;
  variant?: "feature" | "compact";
  priority?: boolean;
  className?: string;
  onOpen?: () => void;
  compared?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (property: Property) => void;
}

function MobilePropertyCard({ property, saved = false, onToggleSaved, variant = "feature", priority = false, className, onOpen, compared = false, compareDisabled = false, onToggleCompare }: MobilePropertyCardProps) {
  const { isMyanmar, tx } = useLanguage();
  const reduceMotion = useReducedMotion();
  const price = formatPropertyPrice(property, isMyanmar ? "my" : "en");

  function toggleFavorite() {
    if (!reduceMotion && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
    onToggleSaved?.(property);
  }

  if (variant === "compact") {
    return (
      <motion.article initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-24px" }} whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }} transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }} className={cn("flex min-w-[292px] gap-3 rounded-[20px] border border-[#E7E5DF] bg-white p-2.5 shadow-[0_4px_20px_rgba(0,0,0,.08)] sm:min-w-0", className)}>
        <Link href={`/properties/${property.id}`} onClick={onOpen} className="relative h-[118px] w-[118px] shrink-0 overflow-hidden rounded-[14px] bg-[#ECEBE6]">
          <ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="118px" className="object-cover" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.08em] text-[#014BAA]"><Check className="size-3" />{tx("Verified", "စိစစ်ပြီး")}</span>
            <span className="ml-auto flex items-center gap-1">
              {onToggleCompare && <button type="button" onClick={() => onToggleCompare(property)} disabled={compareDisabled} className={cn("grid size-11 place-items-center rounded-full bg-[#F2F0EA] text-[#53677F]", compared && "bg-[#173B66] text-white", compareDisabled && "opacity-40")} aria-label={compared ? tx(`Remove ${property.title} from comparison`, `${property.title} ကို နှိုင်းယှဉ်မှုမှဖယ်ရန်`) : tx(`Add ${property.title} to comparison`, `${property.title} ကို နှိုင်းယှဉ်ရန်ထည့်ရန်`)} aria-pressed={compared}>{compared ? <Check className="size-4" /> : <Scale className="size-4" />}</button>}
              {onToggleSaved && <motion.button type="button" onClick={toggleFavorite} animate={reduceMotion ? undefined : saved ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="grid size-11 place-items-center rounded-full bg-[#F2F0EA] text-[#014BAA]" aria-label={saved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`} aria-pressed={saved}><Heart className={cn("size-4", saved && "fill-current")} /></motion.button>}
            </span>
          </div>
          <Link href={`/properties/${property.id}`} onClick={onOpen} className="mt-2 flex min-h-11 items-center text-[13px] font-semibold leading-5 text-[#111827]"><span className="line-clamp-2">{property.title}</span></Link>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-[#69736F]"><MapPin className="size-3" />{property.township}</p>
          <p className="mt-auto text-[14px] font-semibold text-[#014BAA]">{price}<span className="ml-1 text-[9px] font-normal text-[#7B817D]">{property.purpose === "rent" ? tx("/ month", "/ လ") : ""}</span></p>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01, boxShadow: "0 10px 28px rgba(15,23,42,.11)" }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform" }}
      className={cn("group relative min-w-[300px] overflow-hidden rounded-[20px] border border-[#E8E5DE] bg-white shadow-[0_4px_20px_rgba(0,0,0,.08)] sm:min-w-0", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ECEBE6]">
        <Link href={`/properties/${property.id}`} onClick={onOpen} className="absolute inset-0 z-10" aria-label={`View ${property.title}`} />
        <ProgressiveImage src={property.images[0]} alt={property.title} fill priority={priority} sizes="(max-width: 639px) 86vw, (max-width: 1023px) 46vw, 360px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/52 via-transparent to-black/8" />
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: -6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reduceMotion ? 0 : 0.14, duration: 0.32 }} className="absolute left-3.5 top-3.5"><TrustPill>{tx("Verified property", "စိစစ်ထားသောအိမ်")}</TrustPill></motion.div>
        {onToggleSaved && (
          <motion.button
            type="button"
            onClick={toggleFavorite}
            aria-label={saved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`}
            aria-pressed={saved}
            animate={reduceMotion ? undefined : saved ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-3.5 top-3.5 z-20 grid size-11 place-items-center rounded-full border border-white/70 bg-white/94 text-[#014BAA] shadow-[0_4px_20px_rgba(0,0,0,.08)] transition-transform duration-200 active:scale-95"
          >
            <Heart className={cn("size-5 transition-transform", saved && "scale-110 fill-current")} />
          </motion.button>
        )}
        <div className="absolute inset-x-3.5 bottom-3.5 z-20 flex items-end justify-between gap-3 text-white">
          <p className="flex items-center gap-1.5 rounded-full bg-[#111827]/58 px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm"><MapPin className="size-3.5 text-[#B9D3FA]" />{property.township}, {property.city}</p>
          <span className="rounded-full bg-[#014BAA]/88 px-2.5 py-1 text-[9px] font-semibold backdrop-blur-md">{property.purpose === "rent" ? tx("For rent", "ငှားရန်") : tx("For sale", "ရောင်းရန်")}</span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <Link href={`/properties/${property.id}`} onClick={onOpen} className="flex min-h-11 items-center">
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-[1.35] tracking-[-0.025em] text-[#111827]">{property.title}</h3>
        </Link>
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <p className="text-[19px] font-semibold tracking-[-0.035em] text-[#014BAA]">{price}<span className="ml-1 text-[9px] font-normal tracking-normal text-[#79817D]">{property.purpose === "rent" ? tx("/ month", "/ လ") : ""}</span></p>
          <span className="rounded-full bg-[#F8F3F0] px-2.5 py-1 text-[9px] font-semibold text-[#014BAA]">{property.rating.toFixed(1)} ★</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#ECE9E3] pt-3 text-[10px] font-medium text-[#69736F]">
          <span className="inline-flex items-center gap-1"><BedDouble className="size-4 text-[#014BAA]" />{property.bedrooms} {tx("beds", "ခန်း")}</span>
          <span className="inline-flex items-center gap-1"><Bath className="size-4 text-[#014BAA]" />{property.bathrooms} {tx("baths", "ရေချိုးခန်း")}</span>
          <span className="inline-flex items-center gap-1"><Maximize2 className="size-3.5 text-[#014BAA]" />{new Intl.NumberFormat("en-US").format(property.area_sqft)} sqft</span>
        </div>
        {onToggleCompare && <button type="button" onClick={() => onToggleCompare(property)} disabled={compareDisabled} className={cn("mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[#F3F1EC] text-[10px] font-semibold text-[#53677F] transition-colors hover:bg-[#EAF1F8] hover:text-[#014BAA]", compared && "bg-[#173B66] text-white hover:bg-[#173B66] hover:text-white", compareDisabled && "cursor-not-allowed opacity-40")} aria-label={compared ? tx(`Remove ${property.title} from comparison`, `${property.title} ကို နှိုင်းယှဉ်မှုမှဖယ်ရန်`) : tx(`Add ${property.title} to comparison`, `${property.title} ကို နှိုင်းယှဉ်ရန်ထည့်ရန်`)} aria-pressed={compared}>{compared ? <Check className="size-4" /> : <Scale className="size-4" />}{compared ? tx("Selected to compare", "နှိုင်းယှဉ်ရန်ရွေးပြီး") : tx("Compare this home", "ဤအိမ်ကိုနှိုင်းယှဉ်")}</button>}
      </div>
    </motion.article>
  );
}

export { MobilePropertyCard, SectionHeading, SegmentedControl, TrustPill, mobileTheme };

"use client";

import { Bath, BedDouble, Building2, Check, MapPin, Maximize2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { formatPropertyPrice, propertyTypeLabels, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type PropertyCardVariant = "featured" | "explore" | "saved";

interface PropertyCardBodyProps {
  property: Property;
  variant?: PropertyCardVariant;
  href?: string;
  onOpen?: () => void;
  showTrust?: boolean;
  updatedLabel?: string;
  footer?: ReactNode;
  className?: string;
}

function PropertyCardBody({
  property,
  variant = "explore",
  href = `/properties/${property.id}`,
  onOpen,
  showTrust = false,
  updatedLabel,
  footer,
  className,
}: PropertyCardBodyProps) {
  const { isMyanmar, tx } = useLanguage();
  const price = formatPropertyPrice(property, isMyanmar ? "my" : "en");
  const featured = variant === "featured";
  const saved = variant === "saved";
  const propertyType = isMyanmar
    ? ({ condo: "ကွန်ဒို", apartment: "တိုက်ခန်း", house: "အိမ်", villa: "ဗီလာ", mini_condo: "မီနီကွန်ဒို" } as const)[property.property_type]
    : propertyTypeLabels[property.property_type];

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      {showTrust && <PropertyTrustBadge label={tx(`Verified ${propertyType}`, `စိစစ်ပြီး ${propertyType}`)} />}

      {featured && (
        <span className="mb-3 inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-[#DCEBFF] px-3 text-[9px] font-semibold text-[#101828]">
          <Building2 className="size-4 text-[#4DA3FF]" />{propertyType}<span className="text-[#667085]">•</span><span className="text-[#4DA3FF]">{property.purpose === "rent" ? tx("For Rent", "ငှားရန်") : tx("For Sale", "ရောင်းရန်")}</span>
        </span>
      )}

      <Link href={href} onClick={onOpen} className={cn(showTrust && "mt-3")}>
        <h3 className={cn("line-clamp-2 font-semibold tracking-[-0.028em] text-[#101828] transition-colors hover:text-[#4DA3FF]", featured ? "text-[18px] leading-[23px]" : saved ? "text-[16px] leading-5" : "text-[15px] leading-5")}>{property.title}</h3>
      </Link>

      <p className={cn("font-semibold tracking-[-0.03em] text-[#4DA3FF]", featured ? "mt-3 text-[23px]" : saved ? "mt-3 text-[18px]" : "mt-2.5 text-[17px]")}>{price}<span className={cn("ml-1 font-normal tracking-normal text-[#667085]", saved ? "text-[8px]" : "text-[8px]")}>{property.purpose === "rent" ? tx("/ month", "/လ") : ""}</span></p>

      <p className={cn("flex min-w-0 items-center gap-1.5 text-[#667085]", featured ? "mt-3 text-[12px]" : saved ? "mt-2.5 text-[10px]" : "mt-2 text-[9px]")}><MapPin className={cn("shrink-0 text-[#4DA3FF]", featured ? "size-5" : saved ? "size-4" : "size-3.5")} /><span className="truncate">{property.township}, {property.city}</span></p>

      <PropertyCardFacts property={property} variant={variant} />

      {featured && property.amenities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {property.amenities.slice(0, 4).map((amenity) => <span key={amenity} className="inline-flex h-8 items-center rounded-full border border-[#D0DEF0] bg-[#F8FBFF] px-3 text-[9px] font-medium text-[#101828]">{amenity}</span>)}
        </div>
      )}

      {updatedLabel && <p className={cn("text-right text-[#667085]", featured ? "mt-4 text-[10px]" : saved ? "mt-3 text-[9px]" : "mt-2.5 text-[8px]")}>{updatedLabel}</p>}
      {footer}
    </div>
  );
}

function PropertyTrustBadge({ label }: { label: string }) {
  return <span className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-white/85 bg-[#F8FBFF]/94 px-3 text-[8px] font-semibold text-[#101828] shadow-sm backdrop-blur-md"><Check className="size-3.5 rounded-full bg-[#4DA3FF] p-0.5 text-white" />{label}</span>;
}

function PropertyCardFacts({ property, variant = "explore" }: { property: Property; variant?: PropertyCardVariant }) {
  const { tx } = useLanguage();
  const featured = variant === "featured";
  const saved = variant === "saved";
  const items = [
    { icon: BedDouble, value: property.bedrooms, label: tx(property.bedrooms === 1 ? "Bed" : "Beds", "အိပ်ခန်း") },
    { icon: Bath, value: property.bathrooms, label: tx(property.bathrooms === 1 ? "Bath" : "Baths", "ရေချိုးခန်း") },
    { icon: Maximize2, value: property.area_sqft.toLocaleString(), label: tx("Sqft", "စတုရန်းပေ") },
  ];

  return (
    <div className={cn("grid grid-cols-3", featured ? "mt-5 gap-3" : saved ? "mt-3 gap-1.5" : "mt-3 gap-2")}>
      {items.map(({ icon: Icon, value, label }) => (
        <span key={label} className={cn("flex min-w-0 items-center bg-[#DCEBFF] text-[#101828]", featured ? "h-[68px] gap-3 rounded-[17px] border border-[#D0DEF0] px-4" : saved ? "h-11 gap-1.5 rounded-[12px] border border-[#D0DEF0] px-2.5" : "h-[52px] gap-2 rounded-[13px] px-3")}>
          <Icon className={cn("shrink-0 text-[#4DA3FF]", featured ? "size-7" : saved ? "size-4" : "size-5")} />
          <span className="min-w-0"><strong className={cn("block truncate font-semibold leading-none", featured ? "text-[16px]" : saved ? "text-[11px]" : "text-[13px]")}>{value}</strong><span className={cn("mt-1 block truncate text-[#667085]", featured ? "text-[10px]" : saved ? "text-[7px]" : "text-[8px]")}>{label}</span></span>
        </span>
      ))}
    </div>
  );
}

export { PropertyCardBody, PropertyCardFacts, PropertyTrustBadge };
export type { PropertyCardBodyProps, PropertyCardVariant };

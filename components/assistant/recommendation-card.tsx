"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, GitCompareArrows, MapPin, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPropertyPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  property: Property;
  match: number;
  reasons: string[];
  compared: boolean;
  onCompare: () => void;
}

function RecommendationCard({ property, match, reasons, compared, onCompare }: RecommendationCardProps) {
  const { isMyanmar } = useLanguage();
  return (
    <Card className="group overflow-hidden rounded-[22px] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(23,43,63,.14)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EAF2FF]"><Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 84vw, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#102236]/35 to-transparent" /><Badge className="absolute left-3 top-3 bg-[#006AFF] text-white shadow-md"><ShieldCheck className="size-3.5" />{match}% match</Badge></div>
      <CardContent className="p-4">
        <div className="flex items-center gap-1 text-[11px] text-[#667486]"><MapPin className="size-3.5" />{property.township}, {property.city}</div>
        <Link href={`/properties/${property.id}`} className="mt-2 line-clamp-2 block min-h-10 text-[15px] font-semibold leading-5 text-[#172B3F] hover:text-[#006AFF]">{property.title}</Link>
        <strong data-type="number" className="mt-3 block text-[15px]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")} <span className="text-[10px] font-normal text-[#667486]">{property.purpose === "rent" ? "/ month" : ""}</span></strong>
        <div className="mt-4 space-y-2 border-t border-[#E3E8EE] pt-4">{reasons.map((reason) => <div key={reason} className="flex items-start gap-2 text-[11px] leading-4 text-[#5F6C7B]"><span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-[#287A4B]"><Check className="size-2.5" /></span>{reason}</div>)}</div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><Link className="inline-flex h-10 items-center justify-center rounded-xl bg-[#006AFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#0057D9] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#006AFF]/25" href={`/properties/${property.id}`}>View home</Link><Button size="icon" variant="outline" className={cn("size-10", compared && "border-[#006AFF] bg-[#F6F8FC] text-[#006AFF]")} onClick={onCompare} aria-label={compared ? `Remove ${property.title} from comparison` : `Compare ${property.title}`} aria-pressed={compared}><GitCompareArrows className="size-4" /></Button></div>
      </CardContent>
    </Card>
  );
}

export { RecommendationCard };

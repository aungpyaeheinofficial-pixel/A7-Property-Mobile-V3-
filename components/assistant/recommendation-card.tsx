"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, GitCompareArrows, MapPin, ShieldCheck } from "lucide-react";

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
  return (
    <Card className="overflow-hidden rounded-[20px] border-[#0b3768]/9 shadow-[0_8px_30px_rgba(11,55,104,.06)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e6f4fb]"><Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 84vw, 30vw" className="object-cover" /><Badge className="absolute left-3 top-3 bg-[#0f6fb2] text-white shadow-sm"><ShieldCheck className="size-3.5" />{match}% match</Badge></div>
      <CardContent className="p-4">
        <div className="flex items-center gap-1 text-[9px] text-[#728396]"><MapPin className="size-3.5" />{property.township}, {property.city}</div>
        <Link href={`/properties/${property.id}`} className="mt-2 line-clamp-2 block min-h-10 text-sm font-semibold leading-5 hover:text-[#0f6fb2]">{property.title}</Link>
        <strong className="mt-3 block text-sm">{formatPropertyPrice(property)} <span className="text-[9px] font-normal text-[#728396]">{property.purpose === "rent" ? "/ month" : ""}</span></strong>
        <div className="mt-4 space-y-2 border-t border-[#e3eaf1] pt-4">{reasons.map((reason) => <div key={reason} className="flex items-start gap-2 text-[9px] leading-4 text-[#4e6478]"><span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#e6f4fb] text-[#24825f]"><Check className="size-2.5" /></span>{reason}</div>)}</div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><Link className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0f6fb2] px-4 text-xs font-medium text-white transition-colors hover:bg-[#0b5f9f] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0f6fb2]/25" href={`/properties/${property.id}`}>View home</Link><Button size="icon" variant="outline" className={cn("size-10", compared && "border-[#0f6fb2] bg-[#f0f8fd] text-[#0f6fb2]")} onClick={onCompare} aria-label={compared ? `Remove ${property.title} from comparison` : `Compare ${property.title}`} aria-pressed={compared}><GitCompareArrows className="size-4" /></Button></div>
      </CardContent>
    </Card>
  );
}

export { RecommendationCard };

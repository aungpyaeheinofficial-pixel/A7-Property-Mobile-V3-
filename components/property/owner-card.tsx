import { Clock3, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PropertyOwner } from "@/lib/properties";

interface OwnerCardProps {
  owner: PropertyOwner;
  onContact: () => void;
  onSchedule: () => void;
}

function OwnerCard({ owner, onContact, onSchedule }: OwnerCardProps) {
  const initials = owner.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <Card className="overflow-hidden rounded-[22px] border-[#172B3F]/9 shadow-[0_18px_45px_rgba(23,43,63,.11)]">
      <div className="h-1 bg-[linear-gradient(90deg,#006AFF,#78A9FF,#B7D3FF)]" />
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#EAF2FF,#D6E6FF)] text-sm font-semibold text-[#006AFF] shadow-inner">{initials}</span>
          <div className="min-w-0 flex-1"><span className="text-[10px] font-semibold uppercase tracking-[.11em] text-[#667486]">{owner.type === "agent" ? "Listing agent" : "Property owner"}</span><h3 className="mt-1 truncate text-[15px] font-semibold text-[#172B3F]">{owner.name}</h3></div>
          {owner.phone_verified && <ShieldCheck className="size-5 text-[#2D7D46]" aria-label="Verified contact" />}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[#172B3F]/6 bg-[#F7F9FC] p-3 text-[11px] text-[#5F6C7B]"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#006AFF]" />Replies in {owner.response_time_minutes} min</span><span className="flex items-center justify-end gap-1.5"><Star className="size-3.5 fill-[#78A9FF] text-[#78A9FF]" />4.9 rating</span></div>
        <div className="mt-4 grid gap-2"><Button onClick={onContact}><MessageCircle className="size-4" />Contact {owner.type}</Button><Button variant="outline" onClick={onSchedule}><Phone className="size-4" />Schedule a viewing</Button></div>
        <p className="mt-4 text-center text-[10px] leading-4 text-[#667486]">Your contact details stay private until you send an inquiry.</p>
      </CardContent>
    </Card>
  );
}

export { OwnerCard };

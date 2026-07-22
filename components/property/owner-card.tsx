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
    <Card className="rounded-[20px] border-[#123c33]/10 shadow-[0_14px_44px_rgba(18,60,51,.09)]">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-[#ddece7] text-sm font-semibold text-[#194e42]">{initials}</span>
          <div className="min-w-0 flex-1"><span className="text-[9px] font-semibold uppercase tracking-wider text-[#7b837f]">{owner.type === "agent" ? "Listing agent" : "Property owner"}</span><h3 className="mt-1 truncate text-sm font-semibold">{owner.name}</h3></div>
          {owner.phone_verified && <ShieldCheck className="size-5 text-[#24825f]" aria-label="Verified contact" />}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f7f3] p-3 text-[10px] text-[#58615d]"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#236457]" />Replies in {owner.response_time_minutes} min</span><span className="flex items-center justify-end gap-1.5"><Star className="size-3.5 fill-[#c9a875] text-[#c9a875]" />4.9 contact rating</span></div>
        <div className="mt-4 grid gap-2"><Button onClick={onContact}><MessageCircle className="size-4" />Contact {owner.type}</Button><Button variant="outline" onClick={onSchedule}><Phone className="size-4" />Schedule a viewing</Button></div>
        <p className="mt-4 text-center text-[9px] leading-4 text-[#7b837f]">Your phone number is shared only after you choose to send an inquiry.</p>
      </CardContent>
    </Card>
  );
}

export { OwnerCard };

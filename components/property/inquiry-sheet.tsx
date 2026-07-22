"use client";

import { CalendarDays, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { Property } from "@/lib/properties";

type InquiryMode = "contact" | "schedule";

interface InquirySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: InquiryMode;
  property: Property;
}

function InquirySheet({ open, onOpenChange, mode, property }: InquirySheetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState(`Hello, I’m interested in ${property.title}. Is it still available?`);
  const [date, setDate] = useState("Saturday, 25 July");
  const [time, setTime] = useState("10:30 AM");

  function submit() {
    setSubmitted(true);
  }

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) window.setTimeout(() => setSubmitted(false), 250);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={mode === "contact" ? `Contact ${property.owner.name}` : "Schedule a viewing"}
      description={mode === "contact" ? "Ask a clear question and get a faster response." : "Choose a preferred time. The owner will confirm before it is booked."}
      side="right"
      footer={!submitted && <Button className="w-full" onClick={submit}>{mode === "contact" ? <MessageCircle className="size-4" /> : <CalendarDays className="size-4" />}{mode === "contact" ? "Send inquiry" : "Request viewing"}</Button>}
    >
      {submitted ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><span className="grid size-16 place-items-center rounded-full bg-[#ddece7] text-[#24825f]"><CheckCircle2 className="size-8" /></span><h3 className="mt-5 text-lg font-semibold">{mode === "contact" ? "Inquiry sent" : "Viewing requested"}</h3><p className="mt-2 max-w-xs text-xs leading-5 text-[#58615d]">{property.owner.name} usually responds within {property.owner.response_time_minutes} minutes. We’ll notify you as soon as they reply.</p><Button variant="outline" className="mt-6" onClick={() => close(false)}>Done</Button></div>
      ) : (
        <div className="space-y-6 p-5 sm:p-7">
          <div className="rounded-2xl bg-[#eff7f4] p-4"><span className="flex items-center gap-2 text-[10px] font-semibold text-[#24825f]"><ShieldCheck className="size-4" />Verified listing and contact</span><strong className="mt-2 block text-sm">{property.title}</strong><span className="mt-1 block text-[10px] text-[#58615d]">{property.township}, {property.city}</span></div>
          {mode === "contact" ? (
            <>
              <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#7b837f]">Your message</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-36 w-full resize-none rounded-xl border border-[#123c33]/12 p-3 text-xs leading-5 outline-none focus:border-[#236457] focus:ring-3 focus:ring-[#236457]/10" /></label>
              <fieldset><legend className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#7b837f]">Preferred reply</legend><div className="grid grid-cols-2 gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#236457] bg-[#eff7f4] p-3 text-xs font-medium"><input type="radio" name="reply" defaultChecked className="accent-[#194e42]" />In-app message</label><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#123c33]/10 p-3 text-xs font-medium"><input type="radio" name="reply" className="accent-[#194e42]" />Phone call</label></div></fieldset>
            </>
          ) : (
            <>
              <fieldset><legend className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#7b837f]">Preferred day</legend><div className="grid gap-2">{["Saturday, 25 July", "Sunday, 26 July", "Monday, 27 July"].map((item) => <label key={item} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-medium ${date === item ? "border-[#236457] bg-[#eff7f4]" : "border-[#123c33]/10"}`}><input type="radio" name="date" value={item} checked={date === item} onChange={() => setDate(item)} className="accent-[#194e42]" />{item}</label>)}</div></fieldset>
              <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#7b837f]">Time</span><select value={time} onChange={(event) => setTime(event.target.value)} className="h-11 w-full rounded-xl border border-[#123c33]/12 bg-white px-3 text-xs outline-none focus:border-[#236457]"><option>10:30 AM</option><option>2:00 PM</option><option>4:30 PM</option></select></label>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

export { InquirySheet };
export type { InquiryMode };

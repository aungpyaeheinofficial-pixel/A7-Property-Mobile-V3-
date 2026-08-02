"use client";

import { CalendarDays, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { mockAppointments, mockMessages, type UserAppointment, type UserConversation } from "@/lib/mock-users";
import type { Property } from "@/lib/properties";

type InquiryMode = "contact" | "schedule";

interface InquirySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: InquiryMode;
  property: Property;
}

function InquirySheet({ open, onOpenChange, mode, property }: InquirySheetProps) {
  const { tx } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState(`Hello, I’m interested in ${property.title}. Is it still available?`);
  const [date, setDate] = useState("Saturday, 8 August");
  const [time, setTime] = useState("10:30 AM");

  function submit() {
    if (mode === "contact") {
      const existing = readStoredJson<UserConversation[]>(STORAGE_KEYS.conversations, mockMessages);
      const conversationId = `MSG-${Date.now()}`;
      const next: UserConversation = {
        id: conversationId,
        contact: property.owner.name,
        propertyId: property.id,
        preview: message.trim(),
        time: "Just now",
        unread: false,
        thread: [{ id: `${conversationId}-1`, sender: "user", text: message.trim(), time: "Just now" }],
      };
      writeStoredJson(
        STORAGE_KEYS.conversations,
        [next, ...existing.filter((item) => !(item.propertyId === property.id && item.contact === property.owner.name))],
      );
    } else {
      const existing = readStoredJson<UserAppointment[]>(STORAGE_KEYS.viewings, mockAppointments);
      const appointmentId = `APT-${Date.now()}`;
      const next: UserAppointment = {
        id: appointmentId,
        propertyId: property.id,
        date,
        time,
        contact: property.owner.name,
        status: "Awaiting owner",
      };
      writeStoredJson(
        STORAGE_KEYS.viewings,
        [next, ...existing.filter((item) => item.propertyId !== property.id)],
      );
    }
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
      title={mode === "contact" ? tx(`Contact ${property.owner.name}`, `${property.owner.name} ကို ဆက်သွယ်ရန်`) : tx("Schedule a viewing", "အိမ်ကြည့်ချိန်ချိန်းရန်")}
      description={mode === "contact" ? tx("Ask a clear question and get a faster response.", "ရှင်းလင်းစွာမေးမြန်းပြီး ပိုမြန်သောအဖြေရယူပါ။") : tx("Choose a preferred time. The owner will confirm before it is booked.", "နှစ်သက်သောအချိန်ကို ရွေးပါ။ အိမ်ရှင်အတည်ပြုပြီးမှ ချိန်းဆိုမည်။")}
      side="right"
      footer={!submitted && <Button className="h-12 w-full rounded-[14px]" onClick={submit}>{mode === "contact" ? <MessageCircle className="size-4" /> : <CalendarDays className="size-4" />}{mode === "contact" ? tx("Send inquiry", "မေးမြန်းချက်ပို့ရန်") : tx("Request viewing", "အိမ်ကြည့်ရန်တောင်းဆို")}</Button>}
    >
      {submitted ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><span className="grid size-16 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]"><CheckCircle2 className="size-8" /></span><h3 className="mt-5 text-lg font-semibold">{mode === "contact" ? tx("Inquiry sent", "မေးမြန်းချက်ပို့ပြီး") : tx("Viewing requested", "အိမ်ကြည့်ရန်တောင်းဆိုပြီး")}</h3><p className="mt-2 max-w-xs text-xs leading-5 text-[#596675]">{tx(`${property.owner.name} usually responds within ${property.owner.response_time_minutes} minutes. We’ll notify you as soon as they reply.`, `${property.owner.name} သည် ပုံမှန်အားဖြင့် ${property.owner.response_time_minutes} မိနစ်အတွင်း အကြောင်းပြန်တတ်သည်။ အဖြေရသည်နှင့် အသိပေးမည်။`)}</p><Button variant="outline" className="mt-6 rounded-[14px]" onClick={() => close(false)}>{tx("Done", "ပြီးပါပြီ")}</Button></div>
      ) : (
        <div className="space-y-6 p-5 sm:p-7">
          <div className="rounded-[20px] bg-[#F3F6FA] p-4"><span className="flex items-center gap-2 text-[10px] font-semibold text-[#014BAA]"><ShieldCheck className="size-4" />{tx("Verified listing and contact", "စိစစ်ထားသောအိမ်နှင့် ဆက်သွယ်သူ")}</span><strong className="mt-2 block text-sm">{property.title}</strong><span className="mt-1 block text-[10px] text-[#596675]">{property.township}, {property.city}</span></div>
          {mode === "contact" ? (
            <>
              <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B746F]">{tx("Your message", "သင့်စာ")}</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-36 w-full resize-none rounded-[14px] border border-[#DCD9D2] p-3 text-xs leading-5 outline-none focus:border-[#014BAA] focus:ring-3 focus:ring-[#014BAA]/10" /></label>
              <fieldset><legend className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B746F]">{tx("Preferred reply", "အကြောင်းပြန်ပုံ")}</legend><div className="grid grid-cols-2 gap-2"><label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[14px] border border-[#014BAA] bg-[#EEF5FC] p-3 text-xs font-medium"><input type="radio" name="reply" defaultChecked className="accent-[#014BAA]" />{tx("In-app message", "အက်ပ်တွင်းစာ")}</label><label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[14px] border border-[#DCD9D2] p-3 text-xs font-medium"><input type="radio" name="reply" className="accent-[#014BAA]" />{tx("Phone call", "ဖုန်းခေါ်ဆိုမှု")}</label></div></fieldset>
            </>
          ) : (
            <>
              <fieldset><legend className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B746F]">{tx("Preferred day", "နှစ်သက်သောနေ့")}</legend><div className="grid gap-2">{["Saturday, 8 August", "Sunday, 9 August", "Monday, 10 August"].map((item) => <label key={item} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[14px] border p-3 text-xs font-medium ${date === item ? "border-[#014BAA] bg-[#EEF5FC]" : "border-[#DCD9D2]"}`}><input type="radio" name="date" value={item} checked={date === item} onChange={() => setDate(item)} className="accent-[#014BAA]" />{item}</label>)}</div></fieldset>
              <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#6B746F]">{tx("Time", "အချိန်")}</span><select value={time} onChange={(event) => setTime(event.target.value)} className="h-11 w-full rounded-[14px] border border-[#DCD9D2] bg-white px-3 text-xs outline-none focus:border-[#014BAA]"><option>10:30 AM</option><option>2:00 PM</option><option>4:30 PM</option></select></label>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

export { InquirySheet };
export type { InquiryMode };

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, CheckCheck, ChevronRight, Clock3, LockKeyhole, MessageCircle, MoreHorizontal, Send, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { A7Brand } from "@/components/brand/a7-brand";
import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { Sheet } from "@/components/ui/sheet";
import { readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { mockAppointments, mockMessages, mockUser, type UserAppointment, type UserConversation } from "@/lib/mock-users";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type View = "conversations" | "viewings";

function MessagesExperience() {
  const { tx } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState<View>("conversations");
  const [messages, setMessages] = useState<UserConversation[]>(mockMessages);
  const [viewings, setViewings] = useState<UserAppointment[]>(mockAppointments);
  const [activeId, setActiveId] = useState<string | null>(mockMessages[0]?.id ?? null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const storedMessages = readStoredJson<UserConversation[]>(STORAGE_KEYS.conversations, mockMessages);
    const storedViewings = readStoredJson<UserAppointment[]>(STORAGE_KEYS.viewings, mockAppointments);
    queueMicrotask(() => {
      setMessages(storedMessages);
      setViewings(storedViewings);
      setActiveId(storedMessages[0]?.id ?? null);
    });
  }, []);

  const active = messages.find((conversation) => conversation.id === activeId) ?? null;
  const unread = messages.filter((conversation) => conversation.unread).length;
  const recentHomes = mockUser.recentlyViewedIds
    .map((id) => allProperties.find((property) => property.id === id))
    .filter((property): property is Property => Boolean(property));

  function openConversation(conversation: UserConversation) {
    const next = messages.map((item) => item.id === conversation.id ? { ...item, unread: false } : item);
    setMessages(next);
    writeStoredJson(STORAGE_KEYS.conversations, next);
    setActiveId(conversation.id);
    setMobileThreadOpen(true);
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reply.trim();
    if (!text || !active) return;
    const next = messages.map((conversation) => conversation.id === active.id ? {
      ...conversation,
      preview: text,
      time: "Just now",
      thread: [...conversation.thread, { id: `${conversation.id}-${Date.now()}`, sender: "user" as const, text, time: "Just now" }],
    } : conversation);
    setMessages(next);
    writeStoredJson(STORAGE_KEYS.conversations, next);
    setReply("");
  }

  const entrance = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 92, damping: 19 };

  return (
    <div className="min-h-screen bg-[#F8F3F0] pb-28 text-[#111827] lg:pb-10">
      <header className="sticky top-0 z-50 border-b border-[#E3E0D9] bg-[#F8F3F0]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-[70px] max-w-[1180px] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="A7 Property home"><A7Brand /></Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden h-9 items-center gap-1.5 rounded-full border border-white/80 bg-white/68 px-3 text-[9px] font-semibold text-[#526172] shadow-sm backdrop-blur-xl sm:inline-flex"><LockKeyhole className="size-3.5 text-[#014BAA]" />{tx("Private conversations", "လုံခြုံသောစကားပြောမှုများ")}</span>
            <LanguageSwitcher compact />
          </div>
        </div>
      </header>

      <motion.main initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={entrance} className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-[36px] font-semibold tracking-[-0.055em] sm:text-[46px]">{tx("Messages", "စာများ")}</h1>
            <p className="mt-2 max-w-[520px] text-[12px] leading-5 text-[#66716C]">{tx("Stay connected with owners and verified agents", "အိမ်ရှင်များ၊ စိစစ်ပြီးအကျိုးဆောင်များနှင့် ဆက်သွယ်ထားပါ")}</p>
          </div>
          <div className="shrink-0 rounded-[16px] border border-white/85 bg-white/72 px-3.5 py-3 text-right shadow-[0_6px_22px_rgba(15,23,42,.06)] backdrop-blur-xl">
            <strong className="block text-[22px] font-semibold tracking-[-0.04em] text-[#014BAA]">{messages.length}</strong>
            <span className="block text-[8px] font-semibold uppercase tracking-[.1em] text-[#69736E]">{tx("Active conversations", "လက်ရှိစကားပြောမှု")}</span>
            <small className="mt-1 block text-[8px] text-[#8A918D]">{unread ? tx(`${unread} unread`, `မဖတ်ရသေး ${unread}`) : tx("All caught up", "အားလုံးဖတ်ပြီး")}</small>
          </div>
        </section>

        <div role="tablist" aria-label={tx("Messages sections", "စာကဏ္ဍများ")} className="relative mt-6 grid max-w-[330px] grid-cols-2 rounded-[14px] border border-white/85 bg-white/54 p-1 shadow-[0_6px_20px_rgba(15,23,42,.05)] backdrop-blur-2xl">
          {(["conversations", "viewings"] as View[]).map((item) => {
            const selected = view === item;
            return (
              <button key={item} type="button" role="tab" aria-selected={selected} onClick={() => setView(item)} className={cn("relative h-11 rounded-[10px] px-3 text-[10px] font-semibold", selected ? "text-[#014BAA]" : "text-[#69736E]")}>
                {selected && <motion.span layoutId="a7-message-tab" className="absolute inset-0 rounded-[10px] bg-white shadow-[0_2px_9px_rgba(15,23,42,.08)]" transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 30 }} aria-hidden="true" />}
                <span className="relative z-10">{item === "conversations" ? tx("Conversations", "စကားပြောများ") : tx("Viewings", "အိမ်ကြည့်များ")}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {view === "conversations" ? (
            <motion.div key="conversations" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <section className="mt-7" aria-labelledby="recent-homes-title">
                <div className="flex items-end justify-between gap-4">
                  <div><h2 id="recent-homes-title" className="text-[18px] font-semibold tracking-[-0.03em]">{tx("Recent homes", "မကြာသေးမီကအိမ်များ")}</h2><p className="mt-1 text-[9px] text-[#7B837F]">{tx("Continue your home journey", "သင့်အိမ်ရှာဖွေမှုကို ဆက်လုပ်ပါ")}</p></div>
                  <Link href="/search?purpose=rent" className="inline-flex h-11 items-center gap-1 text-[9px] font-semibold text-[#014BAA]">{tx("Browse homes", "အိမ်များကြည့်ရန်")}<ArrowRight className="size-3.5" /></Link>
                </div>
                <div className="hide-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                  {recentHomes.map((property, index) => <RecentHome key={property.id} property={property} index={index} reduceMotion={Boolean(reduceMotion)} />)}
                </div>
              </section>

              <section className="mt-7" aria-labelledby="conversation-title">
                <div className="flex items-end justify-between gap-4"><div><h2 id="conversation-title" className="text-[22px] font-semibold tracking-[-0.035em]">{tx("Conversations", "စကားပြောများ")}</h2><p className="mt-1 text-[9px] text-[#7B837F]">{tx("Every conversation stays connected to its property", "စကားပြောမှုတိုင်းကို သက်ဆိုင်ရာအိမ်နှင့် ချိတ်ထားသည်")}</p></div><span className="text-[9px] font-medium text-[#7B837F]">{messages.length} {tx("active", "ခု")}</span></div>

                <div className="mt-4 grid items-start gap-5 lg:grid-cols-[410px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    {messages.map((conversation, index) => <ConversationCard key={conversation.id} conversation={conversation} active={conversation.id === activeId} index={index} reduceMotion={Boolean(reduceMotion)} onClick={() => openConversation(conversation)} />)}
                  </div>
                  <div className="hidden min-w-0 overflow-hidden rounded-[24px] border border-white/90 bg-white/82 shadow-[0_14px_40px_rgba(15,23,42,.08)] backdrop-blur-xl lg:sticky lg:top-[94px] lg:block">
                    <AnimatePresence mode="wait">{active ? <motion.div key={active.id} initial={reduceMotion ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: reduceMotion ? 0 : 0.24 }}><ConversationThread conversation={active} reply={reply} onReplyChange={setReply} onSubmit={sendReply} /></motion.div> : <EmptyConversation />}</AnimatePresence>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.section key="viewings" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: reduceMotion ? 0 : 0.28 }} className="mt-7">
              <div><h2 className="text-[22px] font-semibold tracking-[-0.035em]">{tx("Your viewings", "သင့်အိမ်ကြည့်ချိန်များ")}</h2><p className="mt-1 text-[9px] text-[#7B837F]">{tx("Upcoming appointments connected to each home", "အိမ်တစ်ခုချင်းစီနှင့်ချိတ်ထားသော အိမ်ကြည့်ချိန်များ")}</p></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{viewings.map((appointment, index) => <ViewingCard key={appointment.id} appointment={appointment} index={index} reduceMotion={Boolean(reduceMotion)} />)}</div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>

      <AnimatePresence>
        {!mobileThreadOpen && (
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: reduceMotion ? 0 : 0.28 }} className="fixed bottom-[88px] right-4 z-[70] lg:bottom-6 lg:right-6">
            <Link href="/assistant" aria-label={tx("Need help finding a home?", "အိမ်ရှာရန် အကူအညီလိုပါသလား?")} title={tx("Need help finding a home?", "အိမ်ရှာရန် အကူအညီလိုပါသလား?")} className="group relative inline-flex size-11 items-center justify-center rounded-full border border-white/90 bg-white/84 text-[#173B66] shadow-[0_10px_30px_rgba(15,23,42,.12)] backdrop-blur-2xl"><span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-[10px] bg-[#172B3F] px-3 py-2 text-[9px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{tx("Need help finding a home?", "အိမ်ရှာရန် အကူအညီလိုပါသလား?")}</span><span className="grid size-7 place-items-center rounded-full bg-[#014BAA] text-white"><Sparkles className="size-3.5" /></span></Link>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={mobileThreadOpen} onOpenChange={setMobileThreadOpen} title={active?.contact ?? tx("Conversation", "စကားပြော")} description={tx("Verified contact on A7 Property", "A7 Property စိစစ်ပြီးဆက်သွယ်သူ")} side="right" className="max-w-none sm:max-w-[540px]">
        {active && <ConversationThread conversation={active} reply={reply} onReplyChange={setReply} onSubmit={sendReply} compact />}
      </Sheet>
    </div>
  );
}

function RecentHome({ property, index, reduceMotion }: { property: Property; index: number; reduceMotion: boolean }) {
  const { tx } = useLanguage();
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.07, duration: reduceMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }} className="min-w-[236px] snap-start sm:min-w-[260px]">
      <Link href={`/properties/${property.id}`} className="group flex items-center gap-3 rounded-[17px] border border-[#E5E2DB] bg-white p-2 shadow-[0_4px_18px_rgba(15,23,42,.05)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,.08)]">
        <span className="relative h-[68px] w-[78px] shrink-0 overflow-hidden rounded-[12px] bg-[#ECE9E3]"><ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="78px" className="object-cover" /></span>
        <span className="min-w-0 flex-1"><strong className="line-clamp-2 text-[11px] font-semibold leading-4 text-[#172033]">{property.title}</strong><span className="mt-1.5 block truncate text-[9px] text-[#737C77]">{property.township}, {property.city}</span><span className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-semibold text-[#014BAA]">{tx("View home", "အိမ်ကြည့်ရန်")}<ChevronRight className="size-3" /></span></span>
      </Link>
    </motion.div>
  );
}

function ConversationCard({ conversation, active, index, reduceMotion, onClick }: { conversation: UserConversation; active: boolean; index: number; reduceMotion: boolean; onClick: () => void }) {
  const { tx } = useLanguage();
  const property = allProperties.find((item) => item.id === conversation.propertyId);
  if (!property) return null;
  const role = property.owner.type === "agent" ? tx("Agent", "အကျိုးဆောင်") : tx("Owner", "အိမ်ရှင်");
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      className={cn("group grid w-full grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-[20px] border bg-white p-2.5 text-left shadow-[0_5px_20px_rgba(15,23,42,.055)] transition-[border-color,box-shadow] hover:shadow-[0_12px_30px_rgba(15,23,42,.09)]", active ? "border-[#AFC7E2] ring-2 ring-[#014BAA]/8" : "border-[#E4E1DA]")}
      aria-label={tx(`Open conversation about ${property.title}`, `${property.title} အကြောင်း စကားပြောခန်းဖွင့်ရန်`)}
    >
      <span className="relative h-[112px] overflow-hidden rounded-[15px] bg-[#ECE9E3]"><ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="104px" className="object-cover" />{conversation.unread && <span className="absolute left-2 top-2 size-2.5 rounded-full border-2 border-white bg-[#014BAA]" aria-label={tx("Unread message", "မဖတ်ရသေးသောစာ")} />}</span>
      <span className="flex min-w-0 flex-col py-1 pr-1">
        <span className="flex items-start gap-2"><strong className="line-clamp-2 min-w-0 flex-1 text-[12px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#172033]">{property.title}</strong><time className="shrink-0 pt-0.5 text-[8px] text-[#8A918D]">{conversation.time}</time></span>
        <span className="mt-1 block truncate text-[9px] text-[#737C77]">{property.township}, {property.city}</span>
        <span className="mt-2 flex items-center gap-1.5"><span className="truncate text-[10px] font-semibold text-[#334155]">{conversation.contact}</span><span className="inline-flex shrink-0 items-center gap-1 text-[8px] font-semibold text-[#014BAA]"><ShieldCheck className="size-3" />{tx(`Verified ${role.toLowerCase()}`, `စိစစ်ပြီး ${role}`)}</span></span>
        <span className={cn("mt-2 line-clamp-2 text-[9px] leading-4", conversation.unread ? "font-semibold text-[#425267]" : "text-[#7B837F]")}>{conversation.preview}</span>
      </span>
    </motion.button>
  );
}

function ConversationThread({ conversation, reply, onReplyChange, onSubmit, compact = false }: { conversation: UserConversation; reply: string; onReplyChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; compact?: boolean }) {
  const { isMyanmar, tx } = useLanguage();
  const property = allProperties.find((item) => item.id === conversation.propertyId);
  if (!property) return <EmptyConversation />;
  const role = property.owner.type === "agent" ? tx("Verified agent", "စိစစ်ပြီးအကျိုးဆောင်") : tx("Verified owner", "စိစစ်ပြီးအိမ်ရှင်");
  const contactInitials = conversation.contact.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={cn("flex h-[620px] flex-col", compact && "h-[calc(100svh-126px)] min-h-[500px]")}>
      <div className="flex items-center gap-3 border-b border-[#ECE9E3] bg-white/90 px-4 py-3 sm:px-5">
        <Link href={`/properties/${property.id}`} className="relative h-14 w-[76px] shrink-0 overflow-hidden rounded-[13px] bg-[#ECE9E3]"><ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="76px" className="object-cover" /></Link>
        <div className="min-w-0 flex-1"><Link href={`/properties/${property.id}`} className="block truncate text-[12px] font-semibold text-[#172033] hover:text-[#014BAA]">{property.title}</Link><p className="mt-1 truncate text-[9px] text-[#78817C]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")} · {property.township}</p><p className="mt-1 inline-flex items-center gap-1 text-[8px] font-semibold text-[#014BAA]"><ShieldCheck className="size-3" />{conversation.contact} · {role}</p></div>
        <button type="button" className="grid size-11 place-items-center rounded-full bg-[#F2F0EB] text-[#69736E]" aria-label={tx("Conversation options", "စကားပြောရွေးချယ်မှု")}><MoreHorizontal className="size-4" /></button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F7F5F1] p-4 sm:p-6">
        <div className="mt-auto space-y-5">
          <Marker className="mx-auto w-fit rounded-full border border-white/90 bg-white/78 px-3 py-1.5 text-[8px] font-semibold text-[#52716B] shadow-sm backdrop-blur">
            <MarkerIcon><LockKeyhole className="size-3" /></MarkerIcon>
            <MarkerContent>{tx("Your contact details remain private", "သင့်ဆက်သွယ်ရန်အချက်အလက်များ လုံခြုံသည်")}</MarkerContent>
          </Marker>
          <Marker variant="separator" className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#8A918D]"><MarkerContent>{tx("Today", "ယနေ့")}</MarkerContent></Marker>
          <MessageGroup className="gap-4">
            {conversation.thread.map((message) => {
              const isUser = message.sender === "user";
              return (
                <Message key={message.id} align={isUser ? "end" : "start"} className="gap-2.5">
                  <MessageAvatar className="min-w-8 overflow-visible bg-transparent">
                    <Avatar size="sm" className={cn("ring-2 ring-white", isUser ? "bg-[#173B66] text-white" : "bg-[#E7EEF7] text-[#014BAA]")}>
                      <AvatarFallback>{isUser ? mockUser.initials : contactInitials}</AvatarFallback>
                    </Avatar>
                  </MessageAvatar>
                  <MessageContent className="max-w-[82%] gap-1.5">
                    <MessageHeader className={cn("px-1 text-[8px]", isUser && "justify-end")}>{isUser ? tx("You", "သင်") : conversation.contact}</MessageHeader>
                    <Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"} className="max-w-full">
                      <BubbleContent className={cn("rounded-[18px] px-4 py-3 text-[11px] leading-5 shadow-[0_2px_8px_rgba(15,23,42,.045)]", isUser ? "rounded-br-[6px]" : "rounded-bl-[6px] text-[#38423E]")}>{message.text}</BubbleContent>
                    </Bubble>
                    <MessageFooter className={cn("gap-1 px-1 text-[8px]", isUser ? "text-[#6B7C91]" : "text-[#858D88]")}>{message.time}{isUser && <CheckCheck className="size-3 text-[#014BAA]" />}</MessageFooter>
                  </MessageContent>
                </Message>
              );
            })}
          </MessageGroup>
        </div>
      </div>
      <form onSubmit={onSubmit} className="border-t border-[#E8E5DE] bg-white p-3 sm:p-4"><div className="flex items-end gap-2 rounded-[14px] border border-[#DCD9D1] bg-[#F7F6F2] p-2 focus-within:border-[#014BAA]"><textarea value={reply} onChange={(event) => onReplyChange(event.target.value)} rows={1} aria-label={tx("Write a message", "စာရေးရန်")} placeholder={tx("Write a message…", "စာရေးပါ…")} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-[11px] outline-none" /><button type="submit" disabled={!reply.trim()} className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#014BAA] text-white disabled:opacity-40" aria-label={tx("Send message", "စာပို့ရန်")}><Send className="size-4" /></button></div></form>
    </div>
  );
}

function ViewingCard({ appointment, index, reduceMotion }: { appointment: UserAppointment; index: number; reduceMotion: boolean }) {
  const { tx } = useLanguage();
  const property = allProperties.find((item) => item.id === appointment.propertyId);
  if (!property) return null;
  const confirmed = appointment.status.toLowerCase().includes("confirmed");
  return (
    <motion.article initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.07, duration: reduceMotion ? 0 : 0.34 }} whileHover={reduceMotion ? undefined : { y: -2 }} className="overflow-hidden rounded-[20px] border border-[#E2DFD8] bg-white shadow-[0_7px_24px_rgba(15,23,42,.06)]">
      <div className="relative h-44 bg-[#ECE9E3]"><ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /><span className={cn("absolute left-3 top-3 rounded-[9px] border border-white/70 px-2.5 py-1.5 text-[8px] font-semibold shadow-sm backdrop-blur", confirmed ? "bg-white/92 text-[#014BAA]" : "bg-[#F8F3F0]/92 text-[#64748B]")}>{appointment.status}</span></div>
      <div className="p-4"><h2 className="line-clamp-2 text-[14px] font-semibold leading-5 tracking-[-0.02em]">{property.title}</h2><p className="mt-1 text-[9px] text-[#747D78]">{property.township} · {tx("with", "နှင့်")} {appointment.contact}</p><div className="mt-4 flex items-center gap-4 border-y border-[#ECE9E3] py-3 text-[10px] text-[#4F5E69]"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-[#014BAA]" />{appointment.date}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-[#014BAA]" />{appointment.time}</span></div><Link href={`/properties/${property.id}`} className="mt-3 inline-flex h-11 items-center gap-1 text-[9px] font-semibold text-[#014BAA]">{tx("View property details", "အိမ်အသေးစိတ်ကြည့်ရန်")}<ArrowRight className="size-3.5" /></Link></div>
    </motion.article>
  );
}

function EmptyConversation() {
  return <div className="grid h-[620px] place-items-center p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#EEF5FC] text-[#014BAA]"><MessageCircle className="size-6" /></span><h2 className="mt-4 text-lg font-semibold">Choose a conversation</h2><p className="mt-2 text-[11px] text-[#737C77]">Property details stay close while you chat.</p></div></div>;
}

export { MessagesExperience };

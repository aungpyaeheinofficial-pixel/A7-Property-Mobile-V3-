"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Building2, Camera, CheckCheck, ChevronRight, Gift, Heart, LockKeyhole, MessageCircle, MessageCircleMore, MoreHorizontal, Search, Send, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { Sheet } from "@/components/ui/sheet";
import { readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { mockMessages, mockUser, type UserConversation } from "@/lib/mock-users";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type MessageFilter = "all" | "unread" | "buy" | "rent" | "system";

function MessagesExperience() {
  const { tx } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<UserConversation[]>(mockMessages);
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(mockMessages[0]?.id ?? null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const storedMessages = readStoredJson<UserConversation[]>(STORAGE_KEYS.conversations, mockMessages);
    queueMicrotask(() => {
      setMessages(storedMessages);
      setActiveId(storedMessages[0]?.id ?? null);
    });
  }, []);

  const active = messages.find((conversation) => conversation.id === activeId) ?? null;
  const unread = messages.filter((conversation) => conversation.unread).length;
  const featuredHomes = mockUser.savedPropertyIds
    .map((id) => allProperties.find((property) => property.id === id))
    .filter((property): property is Property => Boolean(property));
  const visibleMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return messages.filter((conversation) => {
      const property = allProperties.find((item) => item.id === conversation.propertyId);
      if (!property) return false;
      const matchesFilter = filter === "all"
        || (filter === "unread" && conversation.unread)
        || (filter === "buy" && property.purpose === "sale")
        || (filter === "rent" && property.purpose === "rent");
      const matchesQuery = !normalizedQuery || `${conversation.contact} ${conversation.preview} ${property.title}`.toLowerCase().includes(normalizedQuery);
      return filter !== "system" && matchesFilter && matchesQuery;
    });
  }, [filter, messages, query]);

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
  const filterItems = [
    { id: "all" as const, label: tx("All", "အားလုံး"), icon: MessageCircleMore, count: messages.length + 5 },
    { id: "unread" as const, label: tx("Unread", "မဖတ်ရသေး"), icon: MessageCircle, count: unread + 2 },
    { id: "buy" as const, label: tx("Buy", "ဝယ်ရန်"), icon: ShoppingBag },
    { id: "rent" as const, label: tx("Rent", "ငှားရန်"), icon: Building2 },
    { id: "system" as const, label: tx("System", "စနစ်"), icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#EAF4FF] pb-28 text-[#101828] lg:pb-10">
      <motion.main initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={entrance} className="mx-auto max-w-[920px] px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <section className="flex min-h-[72px] items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-none tracking-[-0.045em] sm:text-[34px]">{tx("Messages", "စာများ")}</h1>
            <p className="mt-2 text-[11px] font-medium text-[#667085] sm:text-[12px]">{tx("Your conversations, all in one place", "သင့်စကားပြောမှုအားလုံး တစ်နေရာတည်းတွင်")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button type="button" onClick={() => setSearchOpen((current) => !current)} aria-expanded={searchOpen} aria-label={tx("Search conversations", "စကားပြောမှုများရှာရန်")} className="grid size-12 place-items-center rounded-full border border-white bg-[#F8FBFF] text-[#101828] shadow-[0_8px_24px_rgba(16,24,40,.08)] transition-colors hover:text-[#123B73]"><Search className="size-5" /></button>
          </div>
        </section>

        <AnimatePresence>{searchOpen && <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 44 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} className="mt-3 flex items-center gap-2 overflow-hidden rounded-full border border-[#DCE4F0] bg-[#F8FBFF] px-4 shadow-sm transition-[border-color,box-shadow] focus-within:border-[#4DA3FF] focus-within:shadow-[0_0_0_3px_rgba(18,59,115,.08)]"><Search className="size-4 text-[#123B73]" /><span className="sr-only">{tx("Search conversations", "စကားပြောမှုများရှာရန်")}</span><input data-focus-ring="parent" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx("Search conversations…", "စကားပြောမှုများရှာပါ…")} className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#8592A8]" /></motion.label>}</AnimatePresence>

        <div className="hide-scrollbar -mx-4 mt-5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          <div role="tablist" aria-label={tx("Message categories", "စာအမျိုးအစားများ")} className="grid min-w-[472px] grid-cols-5 rounded-[25px] border border-[#D0DEF0] bg-[#F8FBFF] p-1.5 shadow-[0_10px_28px_rgba(16,24,40,.07)]">
            {filterItems.map(({ id, label, icon: Icon, count }) => {
              const selected = filter === id;
              return <button key={id} type="button" role="tab" aria-selected={selected} onClick={() => setFilter(id)} className={cn("relative flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-[19px] px-1.5 text-[10px] font-semibold transition-colors", selected ? "bg-[#DCEBFF] text-[#123B73]" : "text-[#101828] hover:bg-[#F8FBFF]")}><Icon className="size-[17px] shrink-0" /><span className="truncate">{label}</span>{count ? <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-bold", selected ? "bg-[#123B73] text-white" : "bg-[#123B73] text-white")}>{count}</span> : null}</button>;
            })}
          </div>
        </div>

        <section className="mt-4 rounded-[22px] border border-[#D0DEF0] bg-[#F8FBFF] p-3.5 shadow-[0_10px_28px_rgba(16,24,40,.065)]" aria-labelledby="featured-message-homes">
          <div className="flex h-8 items-center justify-between gap-4 px-1">
            <h2 id="featured-message-homes" className="inline-flex items-center gap-2 text-[12px] font-bold text-[#0A2B7A]"><span className="grid size-5 place-items-center rounded-full bg-[#123B73] text-white"><Star className="size-3 fill-current" /></span>{tx("Featured", "အထူးရွေးချယ်ထား")}</h2>
            <Link href="/search?purpose=rent" className="inline-flex h-10 items-center gap-1 text-[10px] font-semibold text-[#123B73]">{tx("View all", "အားလုံးကြည့်")}<ChevronRight className="size-4" /></Link>
          </div>
          <div className="hide-scrollbar -mx-3.5 mt-2 flex snap-x gap-2.5 overflow-x-auto px-3.5 pb-1">
            {featuredHomes.map((property, index) => <FeaturedHome key={property.id} property={property} index={index} reduceMotion={Boolean(reduceMotion)} />)}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-[22px] border border-[#D0DEF0] bg-[#F8FBFF] shadow-[0_10px_28px_rgba(16,24,40,.06)]" aria-label={tx("Conversation list", "စကားပြောမှုစာရင်း")}>
          {visibleMessages.map((conversation, index) => <ConversationCard key={conversation.id} conversation={conversation} active={conversation.id === activeId} index={index} reduceMotion={Boolean(reduceMotion)} onClick={() => openConversation(conversation)} />)}
          {(filter === "all" || filter === "system") && <SystemConversation icon="bell" title={tx("System", "စနစ်")} preview={tx("Your inquiry for “Modern 2-bed apartment near Junction City” has been sent.", "သင့်အိမ်မေးမြန်းမှုကို ပို့ပြီးပါပြီ။")} time={tx("Mon", "တနင်္လာ")} verified />}
          {(filter === "all" || filter === "system") && <SystemConversation icon="gift" title={tx("Property Updates", "အိမ်အသစ်များ")} preview={tx("New homes matching your preferences are now available!", "သင့်စိတ်ကြိုက်နှင့် ကိုက်ညီသောအိမ်အသစ်များ ရရှိပါပြီ။")} time={tx("Aug 1", "ဩ ၁")} count={3} />}
          {visibleMessages.length === 0 && filter !== "system" && <div className="px-6 py-12 text-center"><MessageCircle className="mx-auto size-7 text-[#123B73]" /><p className="mt-3 text-[11px] font-semibold">{tx("No conversations in this category", "ဤအမျိုးအစားတွင် စကားပြောမှုမရှိသေးပါ")}</p></div>}
        </section>
      </motion.main>

      <Sheet open={mobileThreadOpen} onOpenChange={setMobileThreadOpen} title={active?.contact ?? tx("Conversation", "စကားပြော")} description={tx("Verified contact on A7 Property", "A7 Property စိစစ်ပြီးဆက်သွယ်သူ")} side="right" className="max-w-none sm:max-w-[540px]">
        {active && <ConversationThread conversation={active} reply={reply} onReplyChange={setReply} onSubmit={sendReply} compact />}
      </Sheet>
    </div>
  );
}

function FeaturedHome({ property, index, reduceMotion }: { property: Property; index: number; reduceMotion: boolean }) {
  const { isMyanmar, tx } = useLanguage();
  return (
    <motion.article initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: reduceMotion ? 0 : 0.32 }} className="w-[150px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-[#D0DEF0] bg-[#F8FBFF] shadow-[0_6px_18px_rgba(16,24,40,.07)]">
      <div className="relative h-[94px] overflow-hidden bg-[#DCEBFF]">
        <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={tx(`View ${property.title}`, `${property.title} ကိုကြည့်ရန်`)} />
        <ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="150px" className="object-cover" />
        <button type="button" aria-label={tx("Save property", "အိမ်သိမ်းရန်")} className="absolute right-2 top-2 z-20 grid size-8 place-items-center rounded-full border border-white/80 bg-[#F8FBFF]/90 text-[#10224A] shadow-sm backdrop-blur"><Heart className="size-4" /></button>
        <span className="absolute bottom-2 left-2 z-20 inline-flex h-7 items-center gap-1.5 rounded-[9px] bg-[#111827]/78 px-2 text-[8px] font-semibold text-white backdrop-blur"><Camera className="size-3.5" />{property.images.length} {tx("photos", "ပုံ")}</span>
      </div>
      <Link href={`/properties/${property.id}`} className="block p-2.5">
        <h3 className="line-clamp-2 min-h-8 text-[11px] font-semibold leading-4 tracking-[-0.02em] text-[#101828]">{property.title}</h3>
        <p className="mt-1.5 truncate text-[10px] font-semibold text-[#123B73]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")}<span className="text-[7px] font-medium">{property.purpose === "rent" ? tx(" / month", " / လ") : ""}</span></p>
        <p className="mt-2 flex items-center gap-1.5 text-[8px] font-medium text-[#667085]"><span className="size-2 rounded-full bg-[#18C767]" />{tx("You inquired", "သင်မေးမြန်းထားသည်")}</p>
      </Link>
    </motion.article>
  );
}

function ConversationCard({ conversation, active, index, reduceMotion, onClick }: { conversation: UserConversation; active: boolean; index: number; reduceMotion: boolean; onClick: () => void }) {
  const { tx } = useLanguage();
  const property = allProperties.find((item) => item.id === conversation.propertyId);
  if (!property) return null;
  const role = property.owner.type === "agent" ? tx("Agent", "အကျိုးဆောင်") : tx("Property Owner", "အိမ်ရှင်");
  const initials = conversation.contact.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { backgroundColor: "#F8FBFF" }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      className={cn("group relative grid w-full grid-cols-[58px_minmax(0,1fr)_62px] items-center gap-3 border-b border-[#D0DEF0] px-4 py-3.5 text-left last:border-b-0", active && "bg-[#F8FBFF]")}
      aria-label={tx(`Open conversation about ${property.title}`, `${property.title} အကြောင်း စကားပြောခန်းဖွင့်ရန်`)}
    >
      {conversation.unread && <span className="absolute left-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#123B73]" aria-label={tx("Unread message", "မဖတ်ရသေးသောစာ")} />}
      <span className={cn("relative grid size-[58px] place-items-center overflow-hidden rounded-full border-2 border-white text-[13px] font-bold shadow-[0_5px_16px_rgba(16,24,40,.12)]", index === 0 ? "bg-[#E7EEF7]" : index === 1 ? "bg-[#EAF6F2] text-[#146B53]" : "bg-[#F8ECE7] text-[#8A4C36]")}>
        {index === 0 ? <ProgressiveImage src="/images/profile/thiri-win.jpg" alt={conversation.contact} fill sizes="58px" className="object-cover" /> : initials}
        <span className="absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-white bg-[#19C96B]" />
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-[12px] font-bold tracking-[-0.02em] text-[#101828]">{conversation.contact} <span className="font-semibold">({role})</span></strong>
        <span className={cn("mt-1 line-clamp-2 text-[10px] leading-[15px]", conversation.unread ? "font-semibold text-[#536584]" : "text-[#667694]")}>{conversation.preview}</span>
      </span>
      <span className="flex h-full min-w-0 flex-col items-end justify-center gap-2">
        <time className="text-[9px] font-medium text-[#68799A]">{conversation.time}</time>
        <span className="flex items-center gap-2">{conversation.unread && <span className="grid size-6 place-items-center rounded-full bg-[#123B73] text-[9px] font-bold text-white">{index === 0 ? 2 : 1}</span>}<ChevronRight className="size-4 text-[#A7B2C4]" /></span>
      </span>
    </motion.button>
  );
}

function SystemConversation({ icon, title, preview, time, count, verified = false }: { icon: "bell" | "gift"; title: string; preview: string; time: string; count?: number; verified?: boolean }) {
  const Icon = icon === "bell" ? Bell : Gift;
  return (
    <div className="grid grid-cols-[58px_minmax(0,1fr)_62px] items-center gap-3 border-b border-[#D0DEF0] px-4 py-3.5 last:border-b-0">
      <span className={cn("grid size-[58px] place-items-center rounded-full", icon === "bell" ? "bg-[#DCEBFF] text-[#123B73]" : "bg-[#F5F0FF] text-[#7553E7]")}><Icon className="size-6" /></span>
      <span className="min-w-0"><strong className="flex items-center gap-1.5 truncate text-[12px] font-bold text-[#101828]">{title}{verified && <ShieldCheck className="size-4 fill-[#123B73] text-white" />}</strong><span className="mt-1 line-clamp-2 text-[10px] leading-[15px] text-[#667694]">{preview}</span></span>
      <span className="flex h-full flex-col items-end justify-center gap-2"><time className="text-[9px] font-medium text-[#68799A]">{time}</time><span className="flex items-center gap-2">{count ? <span className="grid size-6 place-items-center rounded-full bg-[#7257EA] text-[9px] font-bold text-white">{count}</span> : null}<ChevronRight className="size-4 text-[#A7B2C4]" /></span></span>
    </div>
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
      <div className="flex items-center gap-3 border-b border-[#D0DEF0] bg-[#F8FBFF]/90 px-4 py-3 sm:px-5">
        <Link href={`/properties/${property.id}`} className="relative h-14 w-[76px] shrink-0 overflow-hidden rounded-[13px] bg-[#D0DEF0]"><ProgressiveImage src={property.images[0]} alt={property.title} fill sizes="76px" className="object-cover" /></Link>
        <div className="min-w-0 flex-1"><Link href={`/properties/${property.id}`} className="block truncate text-[12px] font-semibold text-[#101828] hover:text-[#123B73]">{property.title}</Link><p className="mt-1 truncate text-[9px] text-[#78817C]">{formatPropertyPrice(property, isMyanmar ? "my" : "en")} · {property.township}</p><p className="mt-1 inline-flex items-center gap-1 text-[8px] font-semibold text-[#123B73]"><ShieldCheck className="size-3" />{conversation.contact} · {role}</p></div>
        <button type="button" className="grid size-11 place-items-center rounded-full bg-[#F8FBFF] text-[#69736E]" aria-label={tx("Conversation options", "စကားပြောရွေးချယ်မှု")}><MoreHorizontal className="size-4" /></button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F8FBFF] p-4 sm:p-6">
        <div className="mt-auto space-y-5">
          <Marker className="mx-auto w-fit rounded-full border border-white/90 bg-[#F8FBFF]/78 px-3 py-1.5 text-[8px] font-semibold text-[#52716B] shadow-sm backdrop-blur">
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
                    <Avatar size="sm" className={cn("ring-2 ring-white", isUser ? "bg-[#123B73] text-white" : "bg-[#E7EEF7] text-[#123B73]")}>
                      <AvatarFallback>{isUser ? mockUser.initials : contactInitials}</AvatarFallback>
                    </Avatar>
                  </MessageAvatar>
                  <MessageContent className="max-w-[82%] gap-1.5">
                    <MessageHeader className={cn("px-1 text-[8px]", isUser && "justify-end")}>{isUser ? tx("You", "သင်") : conversation.contact}</MessageHeader>
                    <Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"} className="max-w-full">
                      <BubbleContent className={cn("rounded-[18px] px-4 py-3 text-[11px] leading-5 shadow-[0_2px_8px_rgba(15,23,42,.045)]", isUser ? "rounded-br-[6px]" : "rounded-bl-[6px] text-[#38423E]")}>{message.text}</BubbleContent>
                    </Bubble>
                    <MessageFooter className={cn("gap-1 px-1 text-[8px]", isUser ? "text-[#6B7C91]" : "text-[#858D88]")}>{message.time}{isUser && <CheckCheck className="size-3 text-[#123B73]" />}</MessageFooter>
                  </MessageContent>
                </Message>
              );
            })}
          </MessageGroup>
        </div>
      </div>
      <form onSubmit={onSubmit} className="border-t border-[#D0DEF0] bg-[#F8FBFF] p-3 sm:p-4"><div className="flex items-end gap-2 rounded-[14px] border border-[#D0DEF0] bg-[#F8FBFF] p-2 transition-[border-color,box-shadow] focus-within:border-[#123B73] focus-within:shadow-[0_0_0_3px_rgba(18,59,115,.08)]"><textarea data-focus-ring="parent" value={reply} onChange={(event) => onReplyChange(event.target.value)} rows={1} aria-label={tx("Write a message", "စာရေးရန်")} placeholder={tx("Write a message…", "စာရေးပါ…")} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-[11px] outline-none" /><button type="submit" disabled={!reply.trim()} className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#123B73] text-white disabled:opacity-40" aria-label={tx("Send message", "စာပို့ရန်")}><Send className="size-4" /></button></div></form>
    </div>
  );
}

function EmptyConversation() {
  return <div className="grid h-[620px] place-items-center p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#DCEBFF] text-[#123B73]"><MessageCircle className="size-6" /></span><h2 className="mt-4 text-lg font-semibold">Choose a conversation</h2><p className="mt-2 text-[11px] text-[#737C77]">Property details stay close while you chat.</p></div></div>;
}

export { MessagesExperience };

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, GitCompareArrows, MapPin, Send, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { RecommendationCard } from "@/components/assistant/recommendation-card";
import { AppHeader } from "@/components/layout/app-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { parsePropertyRequest, recommendProperties, type AssistantIntent, type RankedRecommendation } from "@/lib/property-assistant";

interface ChatMessage { id: number; role: "user" | "assistant"; text: string; }

const initialQuery = "I need a condo near Hledan under 700,000 MMK";
const initialIntent = parsePropertyRequest(initialQuery);
const initialRecommendations = recommendProperties(allProperties, initialIntent);

function PropertyConsultant() {
  const { isMyanmar } = useLanguage();
  const priceLang = isMyanmar ? "my" : "en";
  const comparisonRows: Array<[string, (property: Property) => string]> = [
    ["Price", (property) => formatPropertyPrice(property, priceLang)],
    ["Bedrooms", (property) => String(property.bedrooms)],
    ["Bathrooms", (property) => String(property.bathrooms)],
    ["Area", (property) => `${property.area_sqft} sqft`],
    ["Verified", (property) => property.verification_status === "verified" ? "Yes" : "Pending"],
  ];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "user", text: initialQuery },
    { id: 2, role: "assistant", text: "I understand. I kept the budget below 700,000 MMK and ranked verified options first. If exact Hledan inventory is limited, I’ll include nearby Yangon homes and explain the trade-off clearly." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<AssistantIntent>(initialIntent);
  const [recommendations, setRecommendations] = useState<RankedRecommendation[]>(initialRecommendations);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, loading]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const query = input.trim();
    if (!query || loading) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: query }]);
    setInput("");
    setLoading(true);
    window.setTimeout(() => {
      const nextIntent = parsePropertyRequest(query);
      const nextRecommendations = recommendProperties(allProperties, nextIntent);
      setIntent(nextIntent);
      setRecommendations(nextRecommendations);
      setComparedIds([]);
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: `I found ${nextRecommendations.length} strong matches for your brief. Exact-area homes come first; nearby alternatives are included only when inventory is limited, with the trade-off explained.` }]);
      setLoading(false);
    }, 900);
  }

  function toggleCompare(id: string) {
    setComparedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? [...current.slice(1), id] : [...current, id]);
  }

  const compared = useMemo(() => comparedIds.map((id) => recommendations.find((item) => item.property.id === id)).filter(Boolean) as RankedRecommendation[], [comparedIds, recommendations]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_82%_-8%,rgba(0, 87, 217,.09),transparent_30rem),#F5F7FB]">
      <AppHeader compact />
      <main className="mx-auto grid w-full max-w-[1480px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <section className="flex h-[530px] flex-col overflow-hidden rounded-[24px] border border-[#172B3F]/10 bg-white shadow-[0_18px_50px_rgba(23,43,63,.12)] sm:h-[620px] lg:sticky lg:top-[88px] lg:h-[calc(100vh-112px)]">
          <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(0, 87, 217,.45),transparent_16rem),linear-gradient(145deg,#172B3F,#111827)] p-5 text-white"><div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full border border-white/10" /><div className="relative flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white/12 text-white shadow-inner"><Bot className="size-5" /></span><span><h1 className="text-[15px] font-semibold">A7 property consultant</h1><p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/65"><span className="size-1.5 rounded-full bg-[#65D69E] shadow-[0_0_0_4px_rgba(101,214,158,.12)]" />Ready to help</p></span></div><p className="relative mt-4 text-xs leading-5 text-white/72">Tell me how you want to live. I’ll turn it into a focused, explainable shortlist.</p></div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">{messages.map((message) => <div key={message.id} className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full ${message.role === "assistant" ? "bg-[#EEF5FC] text-[#0057D9]" : "bg-[#F1F6FF] text-[#53606E]"}`}>{message.role === "assistant" ? <Sparkles className="size-3.5" /> : <UserRound className="size-3.5" />}</span><p className={`max-w-[84%] rounded-2xl px-3.5 py-3 text-[12px] leading-[1.6] ${message.role === "assistant" ? "rounded-tl-md bg-[#F2F5F9] text-[#425267]" : "rounded-tr-md bg-[linear-gradient(135deg,#0B76FF,#003F91)] text-white shadow-[0_8px_18px_rgba(0, 87, 217,.16)]"}`}>{message.text}</p></div>)}<AnimatePresence>{loading && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-full bg-[#EEF5FC] text-[#0057D9]"><Sparkles className="size-3.5" /></span><div className="rounded-2xl rounded-tl-md bg-[#F2F5F9] px-4 py-3"><span className="mb-2 block text-[10px] text-[#5F6C7B]">Finding verified matches</span><div className="flex gap-1">{[0, 1, 2].map((item) => <motion.span key={item} className="size-1.5 rounded-full bg-[#0057D9]" animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: item * 0.16 }} />)}</div></div></motion.div>}</AnimatePresence><div ref={threadEnd} /></div>
          <form onSubmit={submit} className="border-t border-[#172B3F]/8 bg-white p-3"><div className="flex items-end gap-2 rounded-2xl border border-[#D7E0EA] bg-[#F7F9FC] p-2 shadow-inner focus-within:border-[#D4A574] focus-within:ring-3 focus-within:ring-[#0057D9]/10"><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} placeholder="Describe the home you need..." className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1 text-xs leading-5 outline-none" /><Button size="icon" className="size-10 shrink-0 rounded-xl" type="submit" disabled={!input.trim() || loading} aria-label="Send request"><Send className="size-4" /></Button></div><div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto">{["Near work, but quiet", "2 bedrooms in Yankin", "Family house under 500M"].map((prompt) => <button type="button" key={prompt} className="shrink-0 rounded-full border border-[#D7E0EA] bg-white px-3 py-2 text-[11px] font-medium text-[#5F6C7B] hover:border-[#9FC4FF] hover:text-[#0057D9]" onClick={() => setInput(prompt)}>{prompt}</button>)}</div></form>
        </section>

        <section className="min-w-0 space-y-5">
          <Card><CardContent className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow flex items-center gap-2"><Sparkles className="size-4" />What I understood</div><h2 className="mt-2 text-[22px] font-semibold tracking-[-.035em] sm:text-[28px]">A focused brief, not more filters</h2></div><Badge className="bg-[#F3FAF6] text-[#287A4B]"><ShieldCheck className="size-3.5" />Verified first</Badge></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#172B3F]/6 bg-[#F7F9FC] p-4"><MapPin className="size-5 text-[#0057D9]" /><span className="mt-3 block text-[10px] uppercase tracking-wider text-[#667486]">Location</span><strong className="mt-1 block text-[13px]">{intent.rawLocation ?? "Flexible in Yangon"}</strong></div><div className="rounded-2xl border border-[#D9E8FF] bg-[#F1F6FF] p-4"><WalletCards className="size-5 text-[#53606E]" /><span className="mt-3 block text-[10px] uppercase tracking-wider text-[#667486]">Maximum budget</span><strong className="mt-1 block text-[13px]">{intent.budget ? (isMyanmar ? `${new Intl.NumberFormat("en-US").format(intent.budget).replace(/[0-9]/g, (d) => "၀၁၂၃၄၅၆၇၈၉"[Number(d)])} ကျပ်` : `${new Intl.NumberFormat("en-US").format(intent.budget)} MMK`) : (isMyanmar ? "ဘတ်ဂျက် မသတ်မှတ်" : "Open budget")}</strong></div><div className="rounded-2xl border border-[#D9E8FF] bg-[#EDF4FF] p-4"><Check className="size-5 text-[#0057D9]" /><span className="mt-3 block text-[10px] uppercase tracking-wider text-[#667486]">Rooms</span><strong className="mt-1 block text-[13px]">{intent.bedrooms ? `${intent.bedrooms}+ bedrooms` : "Flexible rooms"}</strong></div></div></CardContent></Card>

          <div className="flex items-end justify-between"><div><h2 className="text-xl font-semibold tracking-[-.03em]">Recommended homes</h2><p className="mt-1 text-[10px] text-[#6B7078]">Ranked by fit, trust, and value</p></div><span className="text-[9px] text-[#6B7078]">{recommendations.length} matches</span></div>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{recommendations.map((item) => <RecommendationCard key={item.property.id} property={item.property} match={item.match} reasons={item.reasons} compared={comparedIds.includes(item.property.id)} onCompare={() => toggleCompare(item.property.id)} />)}</div>

          {compared.length >= 2 && <Card className="overflow-hidden rounded-[22px] border-[#2A2A33]/8 shadow-sm"><CardContent className="p-0"><div className="flex items-center gap-2 border-b border-[#2A2A33]/8 p-5"><GitCompareArrows className="size-5 text-[#0057D9]" /><div><h2 className="text-sm font-semibold">Side-by-side comparison</h2><p className="mt-1 text-[9px] text-[#6B7078]">The details that affect your decision</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="bg-[#FAFAFA]"><tr><th className="px-5 py-3 font-medium text-[#6B7078]">Home</th>{compared.map((item) => <th key={item.property.id} className="max-w-[200px] px-4 py-3 font-semibold">{item.property.township} · {item.match}%</th>)}</tr></thead><tbody className="divide-y divide-[#D1D1D5]">{comparisonRows.map(([label, getter]) => <tr key={label}><th className="px-5 py-3 font-medium text-[#6B7078]">{label}</th>{compared.map((item) => <td key={item.property.id} className="px-4 py-3 font-medium">{getter(item.property)}</td>)}</tr>)}</tbody></table></div></CardContent></Card>}
        </section>
      </main>
    </div>
  );
}

export { PropertyConsultant };

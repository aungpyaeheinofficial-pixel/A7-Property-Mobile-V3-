"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, GitCompareArrows, MapPin, Send, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { RecommendationCard } from "@/components/assistant/recommendation-card";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { parsePropertyRequest, recommendProperties, type AssistantIntent, type RankedRecommendation } from "@/lib/property-assistant";

interface ChatMessage { id: number; role: "user" | "assistant"; text: string; }

const initialQuery = "I need a condo near Hledan under 700,000 MMK";
const initialIntent = parsePropertyRequest(initialQuery);
const initialRecommendations = recommendProperties(allProperties, initialIntent);
const comparisonRows: Array<[string, (property: Property) => string]> = [
  ["Price", (property) => formatPropertyPrice(property)],
  ["Bedrooms", (property) => String(property.bedrooms)],
  ["Bathrooms", (property) => String(property.bathrooms)],
  ["Area", (property) => `${property.area_sqft} sqft`],
  ["Verified", (property) => property.verification_status === "verified" ? "Yes" : "Pending"],
];

function PropertyConsultant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "user", text: initialQuery },
    { id: 2, role: "assistant", text: "I understand. I focused on verified rentals around Hledan and nearby Kamayut, kept the budget below 700,000 MMK, and prioritized practical daily transport." },
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
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: `I found ${nextRecommendations.length} strong matches${nextIntent.rawLocation ? ` around ${nextIntent.rawLocation}` : " across Yangon"}. I’ve ranked verified homes first and explained why each one fits.` }]);
      setLoading(false);
    }, 900);
  }

  function toggleCompare(id: string) {
    setComparedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? [...current.slice(1), id] : [...current, id]);
  }

  const compared = useMemo(() => comparedIds.map((id) => recommendations.find((item) => item.property.id === id)).filter(Boolean) as RankedRecommendation[], [comparedIds, recommendations]);

  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      <AppHeader compact />
      <main className="mx-auto grid w-full max-w-[1480px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[24px] border border-[#0b3768]/8 bg-white shadow-[0_14px_50px_rgba(11,55,104,.08)] lg:sticky lg:top-[88px] lg:h-[calc(100vh-112px)]">
          <div className="border-b border-[#0b3768]/8 bg-[#0b3768] p-5 text-white"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#d9effa] text-[#0b3768]"><Bot className="size-5" /></span><span><h1 className="text-sm font-semibold">A7 property consultant</h1><p className="mt-1 flex items-center gap-1.5 text-[9px] text-white/60"><span className="size-1.5 rounded-full bg-[#7ac8a6]" />Ready to help</p></span></div><p className="mt-4 text-xs leading-5 text-white/68">Tell me how you want to live. I’ll translate that into a focused, explainable shortlist.</p></div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">{messages.map((message) => <div key={message.id} className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full ${message.role === "assistant" ? "bg-[#e6f4fb] text-[#1384c8]" : "bg-[#eaf6fc] text-[#315f82]"}`}>{message.role === "assistant" ? <Sparkles className="size-3.5" /> : <UserRound className="size-3.5" />}</span><p className={`max-w-[84%] rounded-2xl px-3.5 py-3 text-[11px] leading-[1.65] ${message.role === "assistant" ? "rounded-tl-md bg-[#f0f8fd] text-[#30485f]" : "rounded-tr-md bg-[#0f6fb2] text-white"}`}>{message.text}</p></div>)}<AnimatePresence>{loading && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-full bg-[#e6f4fb] text-[#1384c8]"><Sparkles className="size-3.5" /></span><div className="rounded-2xl rounded-tl-md bg-[#f0f8fd] px-4 py-3"><span className="mb-2 block text-[9px] text-[#4e6478]">Finding verified matches</span><div className="flex gap-1">{[0, 1, 2].map((item) => <motion.span key={item} className="size-1.5 rounded-full bg-[#0f6fb2]" animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: item * 0.16 }} />)}</div></div></motion.div>}</AnimatePresence><div ref={threadEnd} /></div>
          <form onSubmit={submit} className="border-t border-[#0b3768]/8 p-3"><div className="flex items-end gap-2 rounded-2xl border border-[#0b3768]/12 bg-[#f7f9fc] p-2 focus-within:border-[#0f6fb2] focus-within:ring-3 focus-within:ring-[#0f6fb2]/10"><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} placeholder="Describe the home you need..." className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1 text-xs leading-5 outline-none" /><Button size="icon" className="size-10 shrink-0" type="submit" disabled={!input.trim() || loading} aria-label="Send request"><Send className="size-4" /></Button></div><div className="mt-2 flex gap-2 overflow-x-auto">{["Near work, but quiet", "2 bedrooms in Yankin", "Family house under 500M"].map((prompt) => <button type="button" key={prompt} className="shrink-0 rounded-full border border-[#0b3768]/10 px-2.5 py-1.5 text-[8px] text-[#4e6478] hover:bg-[#f0f8fd]" onClick={() => setInput(prompt)}>{prompt}</button>)}</div></form>
        </section>

        <section className="min-w-0 space-y-5">
          <Card className="rounded-[22px] border-[#0b3768]/8 shadow-sm"><CardContent className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.1em] text-[#0f6fb2]"><Sparkles className="size-4" />What I understood</div><h2 className="mt-2 text-xl font-semibold tracking-[-.03em] sm:text-2xl">A focused brief, not more filters</h2></div><Badge className="bg-[#f0f8fd] text-[#24825f]"><ShieldCheck className="size-3.5" />Verified first</Badge></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#f0f8fd] p-4"><MapPin className="size-5 text-[#0f6fb2]" /><span className="mt-3 block text-[9px] uppercase tracking-wider text-[#728396]">Location</span><strong className="mt-1 block text-xs">{intent.rawLocation ?? "Flexible in Yangon"}</strong></div><div className="rounded-2xl bg-[#eaf6fc] p-4"><WalletCards className="size-5 text-[#315f82]" /><span className="mt-3 block text-[9px] uppercase tracking-wider text-[#728396]">Maximum budget</span><strong className="mt-1 block text-xs">{intent.budget ? `${new Intl.NumberFormat("en-US").format(intent.budget)} MMK` : "Open budget"}</strong></div><div className="rounded-2xl bg-[#e1f3fb] p-4"><Check className="size-5 text-[#47bbea]" /><span className="mt-3 block text-[9px] uppercase tracking-wider text-[#728396]">Rooms</span><strong className="mt-1 block text-xs">{intent.bedrooms ? `${intent.bedrooms}+ bedrooms` : "Flexible rooms"}</strong></div></div></CardContent></Card>

          <div className="flex items-end justify-between"><div><h2 className="text-xl font-semibold tracking-[-.03em]">Recommended homes</h2><p className="mt-1 text-[10px] text-[#728396]">Ranked by fit, trust, and value</p></div><span className="text-[9px] text-[#728396]">{recommendations.length} matches</span></div>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{recommendations.map((item) => <RecommendationCard key={item.property.id} property={item.property} match={item.match} reasons={item.reasons} compared={comparedIds.includes(item.property.id)} onCompare={() => toggleCompare(item.property.id)} />)}</div>

          {compared.length >= 2 && <Card className="overflow-hidden rounded-[22px] border-[#0b3768]/8 shadow-sm"><CardContent className="p-0"><div className="flex items-center gap-2 border-b border-[#0b3768]/8 p-5"><GitCompareArrows className="size-5 text-[#0f6fb2]" /><div><h2 className="text-sm font-semibold">Side-by-side comparison</h2><p className="mt-1 text-[9px] text-[#728396]">The details that affect your decision</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="bg-[#f8fafc]"><tr><th className="px-5 py-3 font-medium text-[#728396]">Home</th>{compared.map((item) => <th key={item.property.id} className="max-w-[200px] px-4 py-3 font-semibold">{item.property.township} · {item.match}%</th>)}</tr></thead><tbody className="divide-y divide-[#e3eaf1]">{comparisonRows.map(([label, getter]) => <tr key={label}><th className="px-5 py-3 font-medium text-[#728396]">{label}</th>{compared.map((item) => <td key={item.property.id} className="px-4 py-3 font-medium">{getter(item.property)}</td>)}</tr>)}</tbody></table></div></CardContent></Card>}
        </section>
      </main>
    </div>
  );
}

export { PropertyConsultant };

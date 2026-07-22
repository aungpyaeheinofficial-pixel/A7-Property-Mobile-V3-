"use client";

import Link from "next/link";
import { BarChart3, Building2, Check, ChevronRight, Eye, MessageCircle, Pencil, ShieldCheck, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ListingEditorSheet, type ListingDraft } from "@/components/dashboard/listing-editor-sheet";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { agentProfile, crmLeads, ownerProfile, weeklyViews } from "@/lib/mock-users";

function PropertyCRM({ role }: { role: "owner" | "agent" }) {
  const profile = role === "owner" ? ownerProfile : agentProfile;
  const portfolio = useMemo(() => allProperties.slice(role === "owner" ? 0 : 20, role === "owner" ? 25 : 88), [role]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [notice, setNotice] = useState("");

  function createListing() { setSelectedProperty(null); setEditorOpen(true); }
  function editListing(property: Property) { setSelectedProperty(property); setEditorOpen(true); }
  function saveListing(draft: ListingDraft) { setNotice(`${draft.title || "Listing draft"} was saved successfully.`); }

  const maxView = Math.max(...weeklyViews.map((item) => item.value));

  return (
    <DashboardShell role={role} name={profile.name} initials={profile.initials} title={role === "owner" ? "Property performance" : "Agency workspace"} description={role === "owner" ? "Manage listings, pricing, inquiries, and verification from one place." : "Coordinate inventory, leads, and team performance across your portfolio."} primaryAction={{ label: "Create listing", onClick: createListing }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#123c33]/8 bg-white p-3 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#ddece7] text-xs font-semibold text-[#194e42]">{profile.initials}</span><span><strong className="flex items-center gap-1.5 text-xs">{profile.name}{profile.verified && <ShieldCheck className="size-4 text-[#24825f]" />}</strong><small className="mt-1 block text-[9px] text-[#7b837f]">{profile.role} · replies in {profile.responseTime}</small></span></div><Link href={role === "owner" ? "/agent" : "/owner"} className="flex items-center gap-1 text-[10px] font-semibold text-[#236457]">Switch to {role === "owner" ? "agent" : "owner"} view <ChevronRight className="size-3.5" /></Link></div>
      {notice && <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#24825f]/20 bg-[#eff7f4] px-4 py-3 text-xs text-[#236457]" role="status"><Check className="size-4" />{notice}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active properties" value={new Intl.NumberFormat("en-US").format(profile.properties)} change="+3 this month" icon={Building2} />
        <MetricCard label="Listing views" value={new Intl.NumberFormat("en-US").format(profile.views)} change="+18.6%" icon={Eye} tone="sand" />
        <MetricCard label="Messages" value={new Intl.NumberFormat("en-US").format(profile.messages)} change="+24 this week" icon={MessageCircle} tone="copper" />
        <MetricCard label="Inquiry conversion" value={profile.inquiryRate} change="Above average" icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <Card className="rounded-[22px] border-[#123c33]/8 shadow-sm"><CardContent className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Listing views</h2><p className="mt-1 text-[10px] text-[#7b837f]">Last 7 days across your active inventory</p></div><Badge className="bg-[#eff7f4] text-[#24825f]"><TrendingUp className="size-3.5" />18.6%</Badge></div><div className="mt-7 flex h-52 items-end gap-3 sm:gap-5">{weeklyViews.map((item) => <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="group relative rounded-t-lg bg-[#236457]/18 transition-colors hover:bg-[#236457]" style={{ height: `${Math.round((item.value / maxView) * 90)}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-[8px] font-semibold group-hover:block">{item.value}</span></div><span className="text-center text-[8px] text-[#7b837f]">{item.day}</span></div>)}</div></CardContent></Card>

        <Card className="rounded-[22px] border-[#123c33]/8 shadow-sm"><CardContent className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Verification health</h2><p className="mt-1 text-[10px] text-[#7b837f]">Keep every listing trusted</p></div><span className="grid size-10 place-items-center rounded-xl bg-[#ddece7] text-[#24825f]"><ShieldCheck className="size-5" /></span></div><div className="mt-5 space-y-3">{["Identity verified", "Phone verified", "23 listings reviewed", "2 listings need documents"].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl bg-[#f7f7f3] p-3 text-[10px] font-medium"><span className={`grid size-6 place-items-center rounded-full ${index === 3 ? "bg-[#f3ebdd] text-[#b77722]" : "bg-[#ddece7] text-[#24825f]"}`}>{index === 3 ? "!" : <Check className="size-3.5" />}</span>{item}</div>)}</div><Button variant="outline" className="mt-5 w-full text-xs">Review verification</Button></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
        <section className="overflow-hidden rounded-[22px] border border-[#123c33]/8 bg-white shadow-sm"><div className="flex items-end justify-between border-b border-[#123c33]/8 p-5 sm:p-6"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Properties</h2><p className="mt-1 text-[10px] text-[#7b837f]">Price, availability, and listing quality</p></div><button className="text-[10px] font-semibold text-[#236457]">View all</button></div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[700px] text-left"><thead className="bg-[#f7f7f3] text-[9px] uppercase tracking-wider text-[#7b837f]"><tr><th className="px-5 py-3 font-semibold">Property</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Views</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-[#eceae4]">{portfolio.slice(0, 5).map((property, index) => <tr key={property.id}><td className="px-5 py-4"><strong className="block max-w-[260px] truncate text-[11px]">{property.title}</strong><small className="mt-1 block text-[9px] text-[#7b837f]">{property.township} · {property.id}</small></td><td className="px-4 py-4 text-[10px] font-semibold">{formatPropertyPrice(property)}</td><td className="px-4 py-4 text-[10px]">{new Intl.NumberFormat("en-US").format(430 + index * 287)}</td><td className="px-4 py-4"><Badge className={index === 3 ? "bg-[#f3ebdd] text-[#b77722]" : "bg-[#eff7f4] text-[#24825f]"}>{index === 3 ? "Needs review" : "Active"}</Badge></td><td className="px-4 py-4"><Button size="icon" variant="ghost" className="size-9" onClick={() => editListing(property)} aria-label={`Edit ${property.title}`}><Pencil className="size-4" /></Button></td></tr>)}</tbody></table></div><div className="divide-y divide-[#eceae4] md:hidden">{portfolio.slice(0, 5).map((property, index) => <div key={property.id} className="p-4"><div className="flex items-start justify-between gap-3"><span className="min-w-0"><strong className="block truncate text-xs">{property.title}</strong><small className="mt-1 block text-[9px] text-[#7b837f]">{property.township} · {430 + index * 287} views</small></span><Button size="icon" variant="ghost" className="size-9 shrink-0" onClick={() => editListing(property)} aria-label={`Edit ${property.title}`}><Pencil className="size-4" /></Button></div><div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-semibold">{formatPropertyPrice(property)}</span><Badge className="bg-[#eff7f4] text-[#24825f]">Active</Badge></div></div>)}</div></section>

        <section className="rounded-[22px] border border-[#123c33]/8 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Recent leads</h2><p className="mt-1 text-[10px] text-[#7b837f]">Prioritized by intent</p></div><BarChart3 className="size-5 text-[#236457]" /></div><div className="mt-4 divide-y divide-[#eceae4]">{crmLeads.map((lead) => <button key={lead.id} className="flex w-full items-center gap-3 py-4 text-left"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3ebdd] text-[10px] font-semibold text-[#805b3f]">{lead.name.split(" ").map((part) => part[0]).join("")}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[11px]">{lead.name}</strong><small className="mt-1 block truncate text-[9px] text-[#7b837f]">{lead.intent} · {lead.time}</small></span><Badge className={lead.status === "New" ? "bg-[#f5ded2] text-[#b7653d]" : "bg-[#eff7f4] text-[#236457]"}>{lead.status}</Badge></button>)}</div><Button variant="outline" className="mt-3 w-full text-xs">Open lead inbox</Button></section>
      </div>

      <ListingEditorSheet open={editorOpen} onOpenChange={setEditorOpen} property={selectedProperty} onSave={saveListing} />
    </DashboardShell>
  );
}

export { PropertyCRM };

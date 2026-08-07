"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  FileCheck2,
  MessageCircle,
  Pencil,
  Search,
  Send,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ListingEditorSheet, type ListingDraft } from "@/components/dashboard/listing-editor-sheet";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { readStoredJson, STORAGE_KEYS, writeStoredJson } from "@/lib/local-storage";
import { agentProfile, crmLeads, ownerProfile, weeklyViews } from "@/lib/mock-users";
import { allProperties, formatPropertyPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type CRMRole = "owner" | "agent";
type CRMLead = (typeof crmLeads)[number];

const notificationItems = [
  { id: "verification", title: "2 listings need documents", detail: "Add ownership or address evidence before publishing.", time: "Today" },
  { id: "lead", title: "New viewing request from Thiri Win", detail: "Light-filled condo in Bahan · Saturday morning.", time: "8 min" },
  { id: "performance", title: "Weekly listing report is ready", detail: "Views are up 18.6% across active properties.", time: "1 hr" },
];

function PropertyCRM({ role }: { role: CRMRole }) {
  const router = useRouter();
  const { isMyanmar } = useLanguage();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section") ?? "overview";
  const createRequested = role === "owner" && searchParams.get("create") === "1";
  const profile = role === "owner" ? ownerProfile : agentProfile;
  const portfolio = useMemo(() => allProperties.slice(role === "owner" ? 0 : 20, role === "owner" ? 25 : 88), [role]);

  const [editorOpen, setEditorOpen] = useState(createRequested);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [leadInboxOpen, setLeadInboxOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAll, setShowAll] = useState(requestedSection === "properties");
  const [notice, setNotice] = useState("");
  const [leadReply, setLeadReply] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [documentsReady, setDocumentsReady] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState({
    name: profile.name,
    email: role === "owner" ? "khinmyint@example.com" : "aungzaw@a7agency.com",
    phone: role === "owner" ? "+95 9 421 880 221" : "+95 9 777 210 045",
    instantLeads: true,
    weeklyReports: true,
  });

  useEffect(() => {
    const target = requestedSection === "overview" ? "crm-overview" : `crm-${requestedSection}`;
    const frame = window.requestAnimationFrame(() => {
      if (requestedSection === "properties") setShowAll(true);
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [requestedSection]);

  function createListing() {
    setSelectedProperty(null);
    setEditorOpen(true);
  }

  function editListing(property: Property) {
    setSelectedProperty(property);
    setEditorOpen(true);
  }

  function saveListing(draft: ListingDraft) {
    const current = readStoredJson<ListingDraft[]>(STORAGE_KEYS.crmDrafts, []);
    const next = [draft, ...current.filter((item) => item.title !== draft.title)].slice(0, 20);
    writeStoredJson(STORAGE_KEYS.crmDrafts, next);
    setNotice(`${draft.title || "Listing draft"} was saved successfully.`);
  }

  function handleEditorOpenChange(open: boolean) {
    setEditorOpen(open);
    if (!open && createRequested) router.replace("/owner", { scroll: false });
  }

  function openProperties() {
    setShowAll(true);
    router.replace(`/${role}?section=properties`, { scroll: false });
  }

  function openLead(lead: CRMLead) {
    setSelectedLead(lead);
    setLeadReply("");
    setLeadStatus("");
  }

  function sendLeadReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!leadReply.trim() || !selectedLead) return;
    setLeadStatus(`Reply sent to ${selectedLead.name}.`);
    setLeadReply("");
  }

  function saveWorkspaceSettings() {
    writeStoredJson(`a7-property-${role}-settings`, settingsDraft);
    setNotice("Workspace settings saved.");
  }

  const maxView = Math.max(...weeklyViews.map((item) => item.value));
  const displayedProperties = showAll ? portfolio : portfolio.slice(0, 5);
  const selectedLeadProperty = selectedLead ? allProperties.find((property) => property.id === selectedLead.propertyId) : null;

  return (
    <DashboardShell
      role={role}
      name={profile.name}
      initials={profile.initials}
      title={role === "owner" ? "Property performance" : "Agency workspace"}
      description={role === "owner" ? "Manage listings, pricing, inquiries, and verification from one place." : "Coordinate inventory, leads, and team performance across your portfolio."}
      primaryAction={{ label: "Create listing", onClick: createListing }}
      onNotifications={() => setNotificationsOpen(true)}
    >
      <div id="crm-overview" className="scroll-mt-24">
        <div className="premium-surface mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[20px] p-3.5 sm:p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#DCEBFF,#DCEBFF)] text-xs font-semibold text-[#123B73]">{profile.initials}</span>
            <span>
              <strong className="flex items-center gap-1.5 text-[13px] text-[#101828]">{profile.name}{profile.verified && <ShieldCheck className="size-4 text-[#287A4B]" />}</strong>
              <small className="mt-1 block text-[10px] text-[#667085]">{profile.role} · replies in {profile.responseTime}</small>
            </span>
          </div>
          <Link href={role === "owner" ? "/agent" : "/owner"} className="flex items-center gap-1 text-[11px] font-semibold text-[#123B73]">Switch to {role === "owner" ? "agent" : "owner"} view <ChevronRight className="size-3.5" /></Link>
        </div>
        {notice && <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#2D7D46]/20 bg-[#EAF4FF] px-4 py-3 text-xs text-[#123B73]" role="status"><Check className="size-4" />{notice}</div>}
      </div>

      <section id="crm-analytics" className="scroll-mt-24">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <MetricCard label="Active properties" value={new Intl.NumberFormat("en-US").format(profile.properties)} change="+3 this month" icon={Building2} />
          <MetricCard label="Listing views" value={new Intl.NumberFormat("en-US").format(profile.views)} change="+18.6%" icon={Eye} tone="sand" />
          <MetricCard label="Messages" value={new Intl.NumberFormat("en-US").format(profile.messages)} change="+24 this week" icon={MessageCircle} tone="copper" />
          <MetricCard label="Inquiry conversion" value={profile.inquiryRate} change="Above average" icon={TrendingUp} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Listing views</h2><p className="mt-1 text-[11px] text-[#667085]">Last 7 days across your active inventory</p></div><Badge className="border border-[#287A4B]/10 bg-[#F3FAF6] text-[#287A4B]"><TrendingUp className="size-3.5" />18.6%</Badge></div>
              <div className="premium-grid mt-6 flex h-48 items-end gap-2 rounded-2xl border border-[#101828]/6 px-3 pt-4 sm:h-52 sm:gap-5 sm:px-5">
                {weeklyViews.map((item) => (
                  <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div className="group relative rounded-t-xl bg-[linear-gradient(180deg,#D4A574_0%,#123B73_100%)] shadow-[0_8px_16px_rgba(18,59,115,.12)] transition-all hover:brightness-105" style={{ height: `${Math.round((item.value / maxView) * 90)}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-[10px] font-semibold group-hover:block">{item.value}</span></div>
                    <span className="pb-2 text-center text-[10px] text-[#667085]">{item.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="crm-verification" className="scroll-mt-24">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Verification health</h2><p className="mt-1 text-[11px] text-[#667085]">Keep every listing trusted</p></div><span className="grid size-10 place-items-center rounded-xl bg-[#DCEBFF] text-[#287A4B]"><ShieldCheck className="size-5" /></span></div>
              <div className="mt-5 space-y-2.5">
                {["Identity verified", "Phone verified", "23 listings reviewed", "2 listings need documents"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-[#101828]/5 bg-[#F8FBFF] p-3 text-[11px] font-medium"><span className={`grid size-6 place-items-center rounded-full ${index === 3 ? "bg-[#FFF7E8] text-[#9A6500]" : "bg-[#DCEBFF] text-[#287A4B]"}`}>{index === 3 ? "!" : <Check className="size-3.5" />}</span>{item}</div>
                ))}
              </div>
              <Button variant="outline" className="mt-5 w-full text-xs" onClick={() => setVerificationOpen(true)}>Review verification</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
        <section id="crm-properties" className="scroll-mt-24 overflow-hidden rounded-[22px] border border-[#101828]/8 bg-[#F8FBFF] shadow-sm">
          <div className="flex items-end justify-between border-b border-[#101828]/8 p-5 sm:p-6">
            <div><h2 className="text-lg font-semibold tracking-[-0.03em]">Properties</h2><p className="mt-1 text-[10px] text-[#667085]">Price, availability, and listing quality</p></div>
            <button type="button" onClick={() => showAll ? setShowAll(false) : openProperties()} className="text-[10px] font-semibold text-[#123B73]">{showAll ? "Show featured" : "View all"}</button>
          </div>
          <div className="hidden max-h-[640px] overflow-auto md:block">
            <table className="w-full min-w-[700px] text-left">
              <thead className="sticky top-0 z-10 bg-[#F8FBFF] text-[9px] uppercase tracking-wider text-[#667085]"><tr><th className="px-5 py-3 font-semibold">Property</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Views</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody className="divide-y divide-[#D0DEF0]">
                {displayedProperties.map((property, index) => (
                  <tr key={property.id}>
                    <td className="px-5 py-4"><strong className="block max-w-[260px] truncate text-[11px]">{property.title}</strong><small className="mt-1 block text-[9px] text-[#667085]">{property.township} · {property.id}</small></td>
                    <td className="px-4 py-4 text-[10px] font-semibold">{formatPropertyPrice(property, isMyanmar ? "my" : "en")}</td>
                    <td className="px-4 py-4 text-[10px]">{new Intl.NumberFormat("en-US").format(430 + index * 287)}</td>
                    <td className="px-4 py-4"><Badge className={index === 3 ? "bg-[#DCEBFF] text-[#b77722]" : "bg-[#EAF4FF] text-[#2D7D46]"}>{index === 3 ? "Needs review" : "Active"}</Badge></td>
                    <td className="px-4 py-4"><Button size="icon" variant="ghost" className="size-9" onClick={() => editListing(property)} aria-label={`Edit ${property.title}`}><Pencil className="size-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="max-h-[640px] divide-y divide-[#D0DEF0] overflow-auto md:hidden">
            {displayedProperties.map((property, index) => (
              <div key={property.id} className="p-4">
                <div className="flex items-start justify-between gap-3"><span className="min-w-0"><strong className="block truncate text-xs">{property.title}</strong><small className="mt-1 block text-[9px] text-[#667085]">{property.township} · {430 + index * 287} views</small></span><Button size="icon" variant="ghost" className="size-9 shrink-0" onClick={() => editListing(property)} aria-label={`Edit ${property.title}`}><Pencil className="size-4" /></Button></div>
                <div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-semibold">{formatPropertyPrice(property, isMyanmar ? "my" : "en")}</span><Badge className="bg-[#EAF4FF] text-[#2D7D46]">Active</Badge></div>
              </div>
            ))}
          </div>
        </section>

        <section id="crm-messages" className="scroll-mt-24 rounded-[22px] border border-[#101828]/8 bg-[#F8FBFF] p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Recent leads</h2><p className="mt-1 text-[10px] text-[#667085]">Prioritized by intent</p></div><BarChart3 className="size-5 text-[#123B73]" /></div>
          <div className="mt-4 divide-y divide-[#D0DEF0]">
            {crmLeads.map((lead) => (
              <button key={lead.id} type="button" onClick={() => openLead(lead)} className="flex w-full items-center gap-3 py-4 text-left">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#DCEBFF] text-[10px] font-semibold text-[#667085]">{lead.name.split(" ").map((part) => part[0]).join("")}</span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-[11px]">{lead.name}</strong><small className="mt-1 block truncate text-[9px] text-[#667085]">{lead.intent} · {lead.time}</small></span>
                <Badge className={lead.status === "New" ? "bg-[#DCEBFF] text-[#123B73]" : "bg-[#EAF4FF] text-[#123B73]"}>{lead.status}</Badge>
              </button>
            ))}
          </div>
          <Button variant="outline" className="mt-3 w-full text-xs" onClick={() => setLeadInboxOpen(true)}>Open lead inbox</Button>
        </section>
      </div>

      <section id="crm-settings" className="scroll-mt-24 mt-5 rounded-[22px] border border-[#101828]/8 bg-[#F8FBFF] p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Workspace settings</h2><p className="mt-1 text-[10px] text-[#667085]">Contact details and notification preferences</p></div><Settings className="size-5 text-[#123B73]" /></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label><span className="text-[10px] font-semibold text-[#667085]">Display name</span><input value={settingsDraft.name} onChange={(event) => setSettingsDraft({ ...settingsDraft, name: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#D0DEF0] px-3 text-xs outline-none focus:border-[#123B73]" /></label>
          <label><span className="text-[10px] font-semibold text-[#667085]">Email</span><input type="email" value={settingsDraft.email} onChange={(event) => setSettingsDraft({ ...settingsDraft, email: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#D0DEF0] px-3 text-xs outline-none focus:border-[#123B73]" /></label>
          <label><span className="text-[10px] font-semibold text-[#667085]">Phone</span><input value={settingsDraft.phone} onChange={(event) => setSettingsDraft({ ...settingsDraft, phone: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#D0DEF0] px-3 text-xs outline-none focus:border-[#123B73]" /></label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[#D0DEF0] pt-5">
          {[["instantLeads", "Instant lead alerts"], ["weeklyReports", "Weekly performance reports"]].map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2 text-[11px] font-medium"><input type="checkbox" checked={settingsDraft[key as "instantLeads" | "weeklyReports"]} onChange={(event) => setSettingsDraft({ ...settingsDraft, [key]: event.target.checked })} className="size-4 accent-[#123B73]" />{label}</label>
          ))}
          <Button className="ml-auto rounded-full px-5" onClick={saveWorkspaceSettings}>Save settings</Button>
        </div>
      </section>

      <ListingEditorSheet open={editorOpen} onOpenChange={handleEditorOpenChange} property={selectedProperty} onSave={saveListing} />

      <Sheet open={Boolean(selectedLead)} onOpenChange={(open) => { if (!open) setSelectedLead(null); }} title={selectedLead ? `${selectedLead.name} · ${selectedLead.intent}` : "Lead details"} description={selectedLeadProperty?.title} side="right" footer={selectedLead && (
        <form onSubmit={sendLeadReply} className="flex items-center gap-2"><input value={leadReply} onChange={(event) => setLeadReply(event.target.value)} placeholder="Write a reply…" className="h-11 min-w-0 flex-1 rounded-full border border-[#D0DEF0] px-4 text-xs outline-none focus:border-[#123B73]" /><Button type="submit" size="icon" className="size-11 rounded-full" disabled={!leadReply.trim()} aria-label="Send lead reply"><Send className="size-4" /></Button></form>
      )}>
        {selectedLead && (
          <div className="space-y-5 p-5 sm:p-7">
            {leadStatus && <div role="status" className="rounded-2xl bg-[#DCEBFF] p-4 text-xs text-[#27714D]">{leadStatus}</div>}
            <div className="flex items-center gap-4 rounded-2xl bg-[#F8FBFF] p-4"><span className="grid size-12 place-items-center rounded-full bg-[#F8FBFF] text-xs font-semibold text-[#123B73]">{selectedLead.name.split(" ").map((part) => part[0]).join("")}</span><span><strong className="block text-sm">{selectedLead.name}</strong><small className="mt-1 block text-[10px] text-[#667085]">{selectedLead.time} · {selectedLead.status}</small></span></div>
            <div className="rounded-2xl border border-[#D0DEF0] p-4"><span className="text-[9px] font-semibold uppercase tracking-wider text-[#667085]">Customer intent</span><p className="mt-2 text-xs font-semibold">{selectedLead.intent}</p><p className="mt-2 text-[11px] leading-5 text-[#667085]">This home seeker is ready for a clear, timely answer. Reply through A7 to keep their contact details private.</p></div>
            {selectedLeadProperty && <Link href={`/properties/${selectedLeadProperty.id}`} className="flex items-center justify-between rounded-2xl border border-[#4DA3FF] bg-[#DCEBFF] p-4 text-xs font-semibold text-[#123B73]">View property <ChevronRight className="size-4" /></Link>}
          </div>
        )}
      </Sheet>

      <Sheet open={leadInboxOpen} onOpenChange={setLeadInboxOpen} title="Lead inbox" description="Every active property conversation, prioritized by intent." side="right">
        <div className="p-5 sm:p-7">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-[#D0DEF0] bg-[#F8FBFF] px-3"><Search className="size-4 text-[#7A8793]" /><input placeholder="Search leads" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label>
          <div className="mt-5 divide-y divide-[#D0DEF0]">
            {crmLeads.map((lead) => <button key={lead.id} type="button" onClick={() => { setLeadInboxOpen(false); openLead(lead); }} className="flex w-full items-center gap-3 py-4 text-left"><span className="grid size-10 place-items-center rounded-full bg-[#DCEBFF] text-[10px] font-semibold">{lead.name.split(" ").map((part) => part[0]).join("")}</span><span className="min-w-0 flex-1"><strong className="block text-xs">{lead.name}</strong><small className="mt-1 block truncate text-[10px] text-[#667085]">{lead.intent} · {lead.time}</small></span><ChevronRight className="size-4 text-[#9AA4AE]" /></button>)}
          </div>
        </div>
      </Sheet>

      <Sheet open={verificationOpen} onOpenChange={setVerificationOpen} title="Verification center" description="Resolve listing issues and keep your inventory trusted." side="right" footer={!documentsReady && <Button className="w-full" onClick={() => setDocumentsReady(true)}><Upload className="size-4" />Submit documents</Button>}>
        {documentsReady ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><span className="grid size-16 place-items-center rounded-full bg-[#DCEBFF] text-[#27714D]"><FileCheck2 className="size-8" /></span><h3 className="mt-5 text-lg font-semibold">Documents submitted</h3><p className="mt-2 max-w-xs text-xs leading-5 text-[#667380]">The A7 trust team will review these listing details and notify you here.</p><Button variant="outline" className="mt-6 rounded-full" onClick={() => setVerificationOpen(false)}>Done</Button></div>
        ) : (
          <div className="space-y-4 p-5 sm:p-7">
            {portfolio.slice(3, 5).map((property) => <div key={property.id} className="rounded-2xl border border-[#E5D9C3] bg-[#FFFBF2] p-4"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-[#A16B13]" /><span><strong className="block text-xs">{property.title}</strong><small className="mt-1 block text-[10px] leading-4 text-[#776849]">Ownership or address evidence needs an update.</small></span></div></div>)}
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#4DA3FF] bg-[#DCEBFF] p-5 text-center"><input type="file" multiple className="sr-only" /><Upload className="size-6 text-[#123B73]" /><strong className="mt-3 text-xs">Choose verification documents</strong><small className="mt-1 text-[9px] text-[#73808C]">PDF, JPG, or PNG</small></label>
          </div>
        )}
      </Sheet>

      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen} title="Notifications" description="Important updates across your workspace." side="right">
        <div className="divide-y divide-[#D0DEF0] p-5 sm:p-7">
          {notificationItems.map((item, index) => <button key={item.id} type="button" onClick={() => { if (item.id === "verification") { setNotificationsOpen(false); setVerificationOpen(true); } else if (item.id === "lead") { setNotificationsOpen(false); openLead(crmLeads[0]); } }} className="flex w-full items-start gap-3 py-4 text-left"><span className={cn("mt-1 size-2 shrink-0 rounded-full", index < 2 ? "bg-[#123B73]" : "bg-[#D0DEF0]")} /><span className="min-w-0 flex-1"><strong className="block text-xs">{item.title}</strong><small className="mt-1.5 block text-[10px] leading-4 text-[#73808C]">{item.detail}</small></span><small className="shrink-0 text-[9px] text-[#8E98A2]">{item.time}</small></button>)}
        </div>
      </Sheet>
    </DashboardShell>
  );
}

export { PropertyCRM };

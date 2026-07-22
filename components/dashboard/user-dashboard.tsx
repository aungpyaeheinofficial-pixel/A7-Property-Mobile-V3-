"use client";

import Link from "next/link";
import { CalendarCheck2, ChevronRight, Clock3, Heart, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PropertyCard } from "@/components/property/property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { allProperties } from "@/lib/properties";
import { mockAppointments, mockMessages, mockUser } from "@/lib/mock-users";

function UserDashboard() {
  const [savedIds, setSavedIds] = useState(mockUser.savedPropertyIds);
  const [recentIds, setRecentIds] = useState(mockUser.recentlyViewedIds);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem("eain-saved-homes") ?? "[]") as string[];
    const recent = JSON.parse(window.localStorage.getItem("eain-recent-properties") ?? "[]") as string[];
    queueMicrotask(() => {
      if (saved.length) setSavedIds(saved);
      if (recent.length) setRecentIds(recent);
    });
  }, []);

  const savedProperties = useMemo(() => savedIds.map((id) => allProperties.find((property) => property.id === id)).filter(Boolean).slice(0, 3), [savedIds]);
  const recentProperties = useMemo(() => recentIds.map((id) => allProperties.find((property) => property.id === id)).filter(Boolean).slice(0, 3), [recentIds]);

  function toggleSaved(id: string) {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("eain-saved-homes", JSON.stringify(next));
      return next;
    });
  }

  return (
    <DashboardShell role="user" name={mockUser.name} initials={mockUser.initials} title={`Welcome home, ${mockUser.name.split(" ")[0]}`} description="Your saved homes, conversations, and upcoming viewings in one calm place.">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Saved properties" value={String(savedIds.length)} change="2 new" icon={Heart} />
        <MetricCard label="Active conversations" value={String(mockMessages.length)} icon={MessageCircle} tone="sand" />
        <MetricCard label="Upcoming viewings" value={String(mockAppointments.length)} icon={CalendarCheck2} tone="copper" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-[22px] border border-[#123c33]/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-end justify-between"><div><h2 className="text-lg font-semibold tracking-[-0.03em]">Saved homes</h2><p className="mt-1 text-[10px] text-[#7b837f]">Your shortlist, ready to compare</p></div><Link href="/search" className="flex items-center gap-1 text-[10px] font-semibold text-[#236457]">Find more <ChevronRight className="size-3.5" /></Link></div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{savedProperties.map((property) => property && <PropertyCard key={property.id} property={property} href={`/properties/${property.id}`} isFavorite onFavoriteToggle={(item) => toggleSaved(item.id)} />)}</div>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-[22px] border-[#123c33]/8 shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-[#ddece7] text-[#194e42]"><UserRound className="size-5" /></span><Badge className="bg-[#eff7f4] text-[#24825f]"><ShieldCheck className="size-3.5" />Phone verified</Badge></div><h2 className="mt-5 text-sm font-semibold">Complete your profile</h2><p className="mt-2 text-[10px] leading-5 text-[#58615d]">Owners respond faster when they know a little about who is interested.</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eceae4]"><div className="h-full rounded-full bg-[#236457]" style={{ width: `${mockUser.profileCompletion}%` }} /></div><div className="mt-2 flex justify-between text-[9px] text-[#7b837f]"><span>{mockUser.profileCompletion}% complete</span><span>Add move-in date</span></div><Button variant="outline" className="mt-5 w-full text-xs">Update profile</Button></CardContent></Card>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[22px] border border-[#123c33]/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold tracking-[-0.03em]">Messages</h2><div className="mt-4 divide-y divide-[#eceae4]">{mockMessages.map((message) => { const property = allProperties.find((item) => item.id === message.propertyId); return <button key={message.id} className="flex w-full items-center gap-3 py-4 text-left"><span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-[#f3ebdd] text-xs font-semibold text-[#805b3f]">{message.contact.split(" ").map((part) => part[0]).join("")}{message.unread && <span className="absolute right-0 top-0 size-2.5 rounded-full border-2 border-white bg-[#b7653d]" />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{message.contact} · {property?.township}</strong><small className="mt-1 block truncate text-[10px] text-[#7b837f]">{message.preview}</small></span><span className="text-[9px] text-[#7b837f]">{message.time}</span></button>; })}</div></section>
        <section className="rounded-[22px] border border-[#123c33]/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold tracking-[-0.03em]">Viewing appointments</h2><div className="mt-4 space-y-3">{mockAppointments.map((appointment) => { const property = allProperties.find((item) => item.id === appointment.propertyId); return <div key={appointment.id} className="flex items-start gap-3 rounded-2xl bg-[#f7f7f3] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ddece7] text-[#194e42]"><Clock3 className="size-[18px]" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{property?.title}</strong><small className="mt-1.5 block text-[10px] text-[#58615d]">{appointment.date} · {appointment.time}</small><Badge className="mt-2 bg-white text-[#236457]">{appointment.status}</Badge></span></div>; })}</div></section>
      </div>

      <section className="mt-6 rounded-[22px] border border-[#123c33]/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold tracking-[-0.03em]">Recently viewed</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{recentProperties.map((property) => property && <PropertyCard key={property.id} property={property} href={`/properties/${property.id}`} isFavorite={savedIds.includes(property.id)} onFavoriteToggle={(item) => toggleSaved(item.id)} />)}</div></section>
    </DashboardShell>
  );
}

export { UserDashboard };

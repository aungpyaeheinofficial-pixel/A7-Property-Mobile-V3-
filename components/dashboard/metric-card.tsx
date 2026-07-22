import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  tone?: "jade" | "sand" | "copper";
}

function MetricCard({ label, value, change, icon: Icon, tone = "jade" }: MetricCardProps) {
  const toneClass = tone === "sand" ? "bg-[#eaf6fc] text-[#3a6f99]" : tone === "copper" ? "bg-[#e1f3fb] text-[#47bbea]" : "bg-[#e6f4fb] text-[#1384c8]";
  return (
    <Card className="rounded-[18px] border-[#0b3768]/8 shadow-[0_5px_20px_rgba(11,55,104,.04)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${toneClass}`}><Icon className="size-[19px]" /></span>{change && <span className="rounded-full bg-[#f0f8fd] px-2 py-1 text-[9px] font-semibold text-[#24825f]">{change}</span>}</div>
        <strong className="mt-5 block text-2xl font-semibold tracking-[-0.04em]">{value}</strong>
        <span className="mt-1 block text-[11px] text-[#728396]">{label}</span>
      </CardContent>
    </Card>
  );
}

export { MetricCard };

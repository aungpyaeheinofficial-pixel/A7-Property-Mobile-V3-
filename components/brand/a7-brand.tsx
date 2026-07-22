import Image from "next/image";

import { cn } from "@/lib/utils";

interface A7BrandProps {
  compact?: boolean;
  inverted?: boolean;
  showMyanmar?: boolean;
  className?: string;
}

function A7Brand({ compact = false, inverted = false, showMyanmar = false, className }: A7BrandProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[12px] border border-[#1384c8]/10 bg-white shadow-[0_4px_14px_rgba(11,55,104,.12)]">
        <Image
          src="/images/brand/a7-property-logo.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="40px"
          className="scale-[2.55] object-contain"
        />
      </span>
      {!compact && (
        <span className={cn("whitespace-nowrap text-[20px] font-semibold tracking-[-0.045em]", inverted ? "text-white" : "text-[#172b3f]")}>
          A7 <span className={inverted ? "text-[#72d2f2]" : "text-[#1384c8]"}>Property</span>
        </span>
      )}
      {showMyanmar && !compact && <span className={cn("border-l pl-3 text-[11px]", inverted ? "border-white/15 text-white/55" : "border-[#e3eaf1] text-[#728396]")} lang="my">အိမ်ခြံမြေ</span>}
    </span>
  );
}

export { A7Brand };

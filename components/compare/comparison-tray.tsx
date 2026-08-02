"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Scale, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/components/i18n/language-provider";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { cn } from "@/lib/utils";

function ComparisonTray() {
  const pathname = usePathname();
  const { tx } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { comparisonProperties, removeProperty, clearComparison, maxComparisonHomes } = usePropertyComparison();
  const visibleRoute = pathname.startsWith("/search") || pathname.startsWith("/saved") || pathname.startsWith("/properties");
  const ready = comparisonProperties.length >= 2;

  return (
    <AnimatePresence>
      {visibleRoute && comparisonProperties.length > 0 && (
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 27 }}
          className={cn("fixed inset-x-3 z-[75] mx-auto max-w-[720px] rounded-[18px] border border-[#D8E0EA] bg-white/96 p-2.5 shadow-[0_14px_42px_rgba(15,23,42,.18)] backdrop-blur-2xl lg:inset-x-auto lg:bottom-6 lg:left-1/2 lg:w-[min(720px,calc(100vw-48px))] lg:-translate-x-1/2", pathname.startsWith("/properties") ? "bottom-[92px]" : "bottom-[84px]")}
          aria-label={tx("Homes selected for comparison", "နှိုင်းယှဉ်ရန်ရွေးထားသောအိမ်များ")}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex shrink-0 -space-x-2">
              {comparisonProperties.slice(0, 3).map((property) => (
                <span key={property.id} className="group relative size-11 overflow-hidden rounded-full border-2 border-white bg-[#E9E7E2] shadow-sm">
                  <Image src={property.images[0]} alt="" fill sizes="44px" className="object-cover" />
                  <button type="button" onClick={() => removeProperty(property.id)} className="absolute inset-0 grid place-items-center text-white" aria-label={tx(`Remove ${property.title} from comparison`, `${property.title} ကို နှိုင်းယှဉ်မှုမှဖယ်ရန်`)}><span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[#0F1B2D]/88 shadow-sm"><X className="size-2.5" /></span></button>
                </span>
              ))}
              {comparisonProperties.length > 3 && <span className="relative grid size-11 place-items-center rounded-full border-2 border-white bg-[#EEF5FC] text-[9px] font-bold text-[#014BAA]">+{comparisonProperties.length - 3}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-[#172033]">{tx(`${comparisonProperties.length} of ${maxComparisonHomes} homes selected`, `အိမ် ${comparisonProperties.length}/${maxComparisonHomes} လုံး ရွေးထားသည်`)}</p>
              <p className="mt-0.5 truncate text-[8px] text-[#737C77]">{ready ? tx("Ready for a side-by-side review", "ဘေးချင်းယှဉ်ကြည့်ရန် အဆင်သင့်ဖြစ်ပြီ") : tx("Choose one more home to compare", "နှိုင်းယှဉ်ရန် နောက်ထပ်တစ်အိမ်ရွေးပါ")}</p>
            </div>
            <button type="button" onClick={clearComparison} className="grid size-11 shrink-0 place-items-center rounded-[12px] text-[#6B7470] hover:bg-[#F3F1EC]" aria-label={tx("Clear comparison", "နှိုင်းယှဉ်မှုရှင်းရန်")}><Trash2 className="size-4" /></button>
            {ready ? (
              <Link href="/compare" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-[#014BAA] px-4 text-[10px] font-semibold text-white shadow-sm"><Scale className="size-4" />{tx("Compare", "နှိုင်းယှဉ်")}</Link>
            ) : (
              <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-[#EEF5FC] px-3 text-[9px] font-semibold text-[#5E7794]"><Check className="size-3.5" />{tx("1 more", "၁ အိမ်လို")}</span>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { ComparisonTray };

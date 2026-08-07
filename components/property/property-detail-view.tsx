"use client";

import { ArrowLeft, Check, Heart, Scale, Share2, ShieldCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { InquirySheet, type InquiryMode } from "@/components/property/inquiry-sheet";
import { OwnerCard } from "@/components/property/owner-card";
import { PropertyCardBody } from "@/components/property/property-card-system";
import { AIAssistantCard, BottomActionBar, DescriptionSection, LocationCard, NearbyPlaces, SimilarProperties, TrustMeta, VerificationCard } from "@/components/property/property-detail-sections";
import { PropertyGallery } from "@/components/property/property-gallery";
import { useToast } from "@/components/ui/toast-provider";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { allProperties, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

function PropertyDetailView({ property }: { property: Property }) {
  const { tx } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [favorite, setFavorite] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("contact");
  const [compactHeader, setCompactHeader] = useState(false);
  const { comparisonIds, toggleProperty, maxComparisonHomes } = usePropertyComparison();
  const compared = comparisonIds.includes(property.id);
  const compareDisabled = !compared && comparisonIds.length >= maxComparisonHomes;

  useEffect(() => {
    const saved = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    const recent = readStoredIds(STORAGE_KEYS.recent, STORAGE_KEYS.legacyRecent, mockUser.recentlyViewedIds);
    queueMicrotask(() => setFavorite(saved.includes(property.id)));
    writeStoredIds(STORAGE_KEYS.recent, [property.id, ...recent.filter((id) => id !== property.id)].slice(0, 12));
  }, [property.id]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setCompactHeader(window.scrollY > 330));
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  const similarProperties = useMemo(
    () => allProperties
      .filter((candidate) => candidate.id !== property.id && candidate.purpose === property.purpose)
      .sort((a, b) => Number(b.city === property.city) - Number(a.city === property.city) || b.rating - a.rating)
      .slice(0, 5),
    [property.city, property.id, property.purpose],
  );

  function toggleFavorite() {
    const saved = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    const next = favorite ? saved.filter((id) => id !== property.id) : [...saved, property.id];
    writeStoredIds(STORAGE_KEYS.saved, next);
    setFavorite(!favorite);
    toast({
      tone: "success",
      title: favorite ? tx("Removed from Saved Homes", "သိမ်းထားသောအိမ်မှ ဖယ်ပြီး") : tx("Saved for later", "နောက်မှကြည့်ရန် သိမ်းပြီး"),
      description: property.title,
    });
  }

  function openInquiry(mode: InquiryMode) {
    setInquiryMode(mode);
    setInquiryOpen(true);
  }

  function returnToSearch() {
    if (window.sessionStorage.getItem("a7:search-journey") && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(`/search?purpose=${property.purpose}`);
  }

  async function shareProperty() {
    const shareData = { title: property.title, text: `${property.title} in ${property.township}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ tone: "success", title: tx("Link copied", "လင့်ခ်ကူးပြီး"), description: tx("Ready to share with family or friends.", "မိသားစု သို့မဟုတ် သူငယ်ချင်းများထံ မျှဝေနိုင်ပါပြီ။") });
      }
    } catch {
      // Native sharing can be dismissed without changing the page.
    }
  }

  return (
    <div className="min-h-screen bg-[#EAF4FF] pb-28 text-[#101828] lg:pb-12">
      <header className="sticky top-0 z-50 border-b border-[#D0DEF0] bg-[#EAF4FF]/96 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-2 px-3 sm:px-6 lg:px-8">
          <button type="button" onClick={returnToSearch} className="grid size-11 shrink-0 place-items-center rounded-full border border-[#D0DEF0] bg-[#F8FBFF] text-[#123B73] shadow-sm" aria-label={tx("Back to search", "ရှာဖွေမှုသို့ပြန်ရန်")}><ArrowLeft className="size-[18px]" /></button>
          <div className="min-w-0 flex-1 px-2 text-center">
            <span className={cn("block truncate text-[11px] font-semibold text-[#101828] transition-opacity duration-200", compactHeader ? "opacity-100" : "opacity-0")}>{property.title}</span>
          </div>
          <button type="button" onClick={toggleFavorite} className="grid size-11 shrink-0 place-items-center rounded-full border border-[#D0DEF0] bg-[#F8FBFF] text-[#123B73] shadow-sm" aria-label={favorite ? tx("Remove from saved", "သိမ်းထားမှုမှဖယ်ရန်") : tx("Save property", "အိမ်ကိုသိမ်းရန်")} aria-pressed={favorite}><Heart className={cn("size-[18px]", favorite && "fill-current")} /></button>
          <button type="button" onClick={shareProperty} className="grid size-11 shrink-0 place-items-center rounded-full border border-[#D0DEF0] bg-[#F8FBFF] text-[#123B73] shadow-sm" aria-label={tx("Share property", "အိမ်ကိုမျှဝေရန်")}><Share2 className="size-[17px]" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] sm:px-6 sm:py-6 lg:px-8">
        <PropertyGallery images={property.images} title={property.title} verified={property.verification_status === "verified"} favorite={favorite} onToggleFavorite={toggleFavorite} />

        <div className="mt-6 grid items-start gap-10 px-4 sm:px-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <section className="pb-5">
              <PropertyCardBody property={property} variant="featured" updatedLabel={tx("Updated 2 hours ago", "၂ နာရီက ပြင်ထားသည်")} />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-0.5 text-[#123B73]" aria-label={`${property.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-3.5 fill-current" />)}</span>
                <strong className="text-[11px] text-[#101828]">{property.rating.toFixed(1)}</strong>
                <span className="text-[10px] text-[#667085]">12 {tx("reviews", "သုံးသပ်ချက်")}</span>
                {property.verification_status === "verified" && <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#123B73]"><ShieldCheck className="size-3.5" />{tx("A7 verified", "A7 စိစစ်ပြီး")}</span>}
              </div>
              <div className="mt-4"><TrustMeta property={property} tx={tx} /></div>
              <button
                type="button"
                onClick={() => {
                  toggleProperty(property);
                  toast({ tone: "info", title: compared ? tx("Removed from comparison", "နှိုင်းယှဉ်မှုမှ ဖယ်ပြီး") : tx("Added to comparison", "နှိုင်းယှဉ်ရန် ထည့်ပြီး"), description: property.title });
                }}
                disabled={compareDisabled}
                className={cn("mt-4 inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#D0DEF0] bg-[#F8FBFF] px-4 text-[10px] font-semibold text-[#123B73] transition-colors disabled:cursor-not-allowed disabled:opacity-45", compared && "border-[#101828] bg-[#101828] text-white")}
                aria-pressed={compared}
                aria-label={compared ? tx("Remove this home from comparison", "ဤအိမ်ကို နှိုင်းယှဉ်မှုမှဖယ်ရန်") : tx("Add this home to comparison", "ဤအိမ်ကို နှိုင်းယှဉ်ရန်ထည့်မည်")}
              >
                {compared ? <Check className="size-4" /> : <Scale className="size-4" />}
                {compared ? tx("Added to comparison", "နှိုင်းယှဉ်ရန် ထည့်ပြီး") : tx("Compare this home", "ဤအိမ်ကို နှိုင်းယှဉ်မယ်")}
              </button>
            </section>

            <div className="mt-5"><VerificationCard tx={tx} /></div>

            <DescriptionSection property={property} tx={tx} />
            <LocationCard property={property} tx={tx} />
            <NearbyPlaces tx={tx} />

            <div className="py-7 lg:hidden"><OwnerCard owner={property.owner} onContact={() => openInquiry("contact")} onSchedule={() => openInquiry("schedule")} /></div>
            <AIAssistantCard property={property} tx={tx} />
            <SimilarProperties properties={similarProperties} tx={tx} />
          </div>

          <aside className="hidden lg:block"><div className="sticky top-[88px]"><OwnerCard owner={property.owner} onContact={() => openInquiry("contact")} onSchedule={() => openInquiry("schedule")} /></div></aside>
        </div>
      </main>

      <BottomActionBar property={property} tx={tx} onMessage={() => openInquiry("contact")} onSchedule={() => openInquiry("schedule")} />
      <InquirySheet open={inquiryOpen} onOpenChange={setInquiryOpen} mode={inquiryMode} property={property} />
    </div>
  );
}

export { PropertyDetailView };

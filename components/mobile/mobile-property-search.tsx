"use client";

import { ArrowLeft, Banknote, BedDouble, BellPlus, Building2, Check, ChevronDown, List, Map, MapPin, ScanSearch, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { MobilePropertyCard } from "@/components/mobile/a7-mobile-ui";
import { MobileSearchCard } from "@/components/mobile/mobile-search-card";
import { PropertyMap, type MapSearchBounds } from "@/components/property/property-map";
import { Button } from "@/components/ui/button";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { SearchBar } from "@/components/ui/search-bar";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { filterProperties, propertyTypeLabels, searchLocations, sortProperties, type Property, type PropertySort, type SearchFilters } from "@/lib/properties";
import { upsertSavedSearch } from "@/lib/saved-searches";
import { cn } from "@/lib/utils";

const SEARCH_RESTORE_KEY = "a7:search-journey";

const amenityOptions = [
  { id: "parking", label: "Parking", labelMy: "ကားပါကင်", term: "parking" },
  { id: "security", label: "Security", labelMy: "လုံခြုံရေး", term: "security" },
  { id: "furniture", label: "Furnished", labelMy: "ပရိဘောဂပါ", term: "furnished" },
  { id: "transit", label: "Near transit", labelMy: "ယာဉ်လိုင်းအနီး", term: "transport" },
  { id: "market", label: "Near market", labelMy: "ဈေးအနီး", term: "market" },
] as const;

type AmenityId = (typeof amenityOptions)[number]["id"];
type FilterFocus = "all" | "location" | "price" | "beds" | "type";

interface SearchRestoreState {
  pending: boolean;
  query: string;
  location: string;
  purpose: "rent" | "sale";
  minPrice: number | null;
  maxPrice: number | null;
  propertyTypes: Property["property_type"][];
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: AmenityId[];
  mapBounds: MapSearchBounds | null;
  sort: PropertySort;
  view: "list" | "map";
  selectedId: string | null;
  visibleCount: number;
  scrollY: number;
}

interface ActiveFilter {
  id: string;
  label: string;
  remove: () => void;
}

function MobilePropertySearch({ properties }: { properties: Property[] }) {
  const params = useSearchParams();
  const { tx, isMyanmar } = useLanguage();
  const locationParam = params.get("location") ?? "";
  const recognizedLocation = searchLocations.includes(locationParam as (typeof searchLocations)[number]);
  const initialPurpose = params.get("purpose") === "sale" ? "sale" : "rent";
  const initialType = params.get("type");
  const initialTypes = (params.get("types") ?? initialType ?? "").split(",").filter((type): type is Property["property_type"] => Object.prototype.hasOwnProperty.call(propertyTypeLabels, type));
  const initialSort = params.get("sort");
  const initialView = params.get("view");
  const initialAmenities = (params.get("amenities") ?? "").split(",").filter((id): id is AmenityId => amenityOptions.some((option) => option.id === id));

  const [purpose, setPurpose] = useState<"rent" | "sale">(initialPurpose);
  const [query, setQuery] = useState(params.get("q") ?? locationParam);
  const [location, setLocation] = useState(recognizedLocation ? locationParam : "All Myanmar");
  const [minPrice, setMinPrice] = useState<number | null>(params.get("min") ? Number(params.get("min")) : null);
  const [maxPrice, setMaxPrice] = useState<number | null>(params.get("max") ? Number(params.get("max")) : null);
  const [propertyTypes, setPropertyTypes] = useState<Property["property_type"][]>(initialTypes);
  const [bedrooms, setBedrooms] = useState<number | null>(params.get("beds") ? Number(params.get("beds")) : null);
  const [bathrooms, setBathrooms] = useState<number | null>(params.get("baths") ? Number(params.get("baths")) : null);
  const [amenities, setAmenities] = useState<AmenityId[]>(initialAmenities);
  const [mapBounds, setMapBounds] = useState<MapSearchBounds | null>(() => parseMapBounds(params.get("area")));
  const [drawingArea, setDrawingArea] = useState(false);
  const [sort, setSort] = useState<PropertySort>(
    initialSort === "newest" || initialSort === "price-asc" || initialSort === "price-desc" ? initialSort : "recommended",
  );
  const [view, setView] = useState<"list" | "map">(initialView === "map" ? "map" : "list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterFocus, setFilterFocus] = useState<FilterFocus>("all");
  const [searchSaved, setSearchSaved] = useState(false);
  const [saved, setSaved] = useState(mockUser.savedPropertyIds);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [headerCondensed, setHeaderCondensed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const { comparisonIds, toggleProperty, maxComparisonHomes } = usePropertyComparison();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => setSaved(stored));

    const persisted = window.sessionStorage.getItem(SEARCH_RESTORE_KEY);
    if (!persisted) return;
    try {
      const state = JSON.parse(persisted) as SearchRestoreState;
      if (!state.pending) return;
      queueMicrotask(() => {
        setQuery(state.query);
        setLocation(state.location);
        setPurpose(state.purpose);
        setMinPrice(state.minPrice ?? null);
        setMaxPrice(state.maxPrice);
        setPropertyTypes(state.propertyTypes ?? []);
        setBedrooms(state.bedrooms);
        setBathrooms(state.bathrooms ?? null);
        setAmenities(state.amenities);
        setMapBounds(state.mapBounds ?? null);
        setSort(state.sort);
        setView(state.view);
        setSelectedId(state.selectedId);
        setVisibleCount(Math.max(12, state.visibleCount));
      });
      window.sessionStorage.removeItem(SEARCH_RESTORE_KEY);
      const restoreScroll = () => window.scrollTo({ top: state.scrollY, behavior: "instant" as ScrollBehavior });
      window.setTimeout(restoreScroll, 160);
      window.setTimeout(restoreScroll, 460);
      window.setTimeout(() => {
        if (state.view !== "list" || !state.selectedId) return;
        document.querySelector<HTMLElement>(`[data-search-property-id="${state.selectedId}"]`)?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
      }, 720);
    } catch {
      window.sessionStorage.removeItem(SEARCH_RESTORE_KEY);
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setHeaderCondensed(window.scrollY > 84));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("purpose", purpose);
    if (location !== "All Myanmar") next.set("location", location);
    else if (query.trim()) next.set("q", query.trim());
    if (minPrice !== null) next.set("min", String(minPrice));
    if (maxPrice !== null) next.set("max", String(maxPrice));
    if (propertyTypes.length) next.set("types", propertyTypes.join(","));
    if (bedrooms !== null) next.set("beds", String(bedrooms));
    if (bathrooms !== null) next.set("baths", String(bathrooms));
    if (amenities.length) next.set("amenities", amenities.join(","));
    if (mapBounds) next.set("area", serializeMapBounds(mapBounds));
    if (sort !== "recommended") next.set("sort", sort);
    if (view === "map") next.set("view", "map");
    window.history.replaceState(window.history.state, "", `/search?${next.toString()}`);
  }, [amenities, bathrooms, bedrooms, location, mapBounds, maxPrice, minPrice, propertyTypes, purpose, query, sort, view]);

  const filters: SearchFilters = useMemo(() => ({
    purpose,
    location,
    minPrice,
    maxPrice,
    propertyTypes,
    bedrooms,
    bathrooms,
    furniture: "all",
    parking: amenities.includes("parking"),
  }), [amenities, bathrooms, bedrooms, location, maxPrice, minPrice, propertyTypes, purpose]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let next = filterProperties(properties, filters);
    if (normalizedQuery && location === "All Myanmar") {
      next = next.filter((property) => `${property.title} ${property.township} ${property.city} ${property.address}`.toLowerCase().includes(normalizedQuery));
    }
    amenityOptions.forEach((option) => {
      if (!amenities.includes(option.id) || option.id === "parking") return;
      if (option.id === "furniture") {
        next = next.filter((property) => property.furniture !== "unfurnished");
        return;
      }
      next = next.filter((property) => property.amenities.some((item) => item.toLowerCase().includes(option.term)));
    });
    if (mapBounds) {
      next = next.filter((property) => property.lat <= mapBounds.north && property.lat >= mapBounds.south && property.lng <= mapBounds.east && property.lng >= mapBounds.west);
    }
    return sortProperties(next, sort);
  }, [amenities, filters, location, mapBounds, properties, query, sort]);

  useEffect(() => {
    if (results.length && !results.some((property) => property.id === selectedId)) queueMicrotask(() => setSelectedId(results[0].id));
  }, [results, selectedId]);

  useEffect(() => {
    if (view !== "map" || !selectedId || !carouselRef.current) return;
    const card = carouselRef.current.querySelector<HTMLElement>(`[data-property-id="${selectedId}"]`);
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedId, view]);

  useEffect(() => () => {
    if (carouselTimerRef.current) window.clearTimeout(carouselTimerRef.current);
  }, []);

  function toggleSaved(property: Property) {
    const next = saved.includes(property.id) ? saved.filter((id) => id !== property.id) : [...saved, property.id];
    setSaved(next);
    writeStoredIds(STORAGE_KEYS.saved, next);
  }

  function resetResultWindow() {
    setVisibleCount(12);
  }

  function setPurposeAndReset(value: "rent" | "sale") {
    setPurpose(value);
    setMinPrice(null);
    setMaxPrice(null);
    resetResultWindow();
  }

  function togglePropertyType(type: Property["property_type"]) {
    setPropertyTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
    resetResultWindow();
  }

  function openFilters(focus: FilterFocus) {
    setFilterFocus(focus);
    setSearchSaved(false);
    setFiltersOpen(true);
  }

  function toggleAmenity(id: AmenityId) {
    setAmenities((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    resetResultWindow();
  }

  function clearFilters() {
    setLocation("All Myanmar");
    setQuery("");
    setMinPrice(null);
    setMaxPrice(null);
    setPropertyTypes([]);
    setBedrooms(null);
    setBathrooms(null);
    setAmenities([]);
    setMapBounds(null);
    setDrawingArea(false);
    resetResultWindow();
  }

  function clearFocusedFilters() {
    if (filterFocus === "all") {
      clearFilters();
      return;
    }
    if (filterFocus === "location") {
      setLocation("All Myanmar");
      setQuery("");
    }
    if (filterFocus === "price") {
      setMinPrice(null);
      setMaxPrice(null);
    }
    if (filterFocus === "beds") {
      setBedrooms(null);
      setBathrooms(null);
    }
    if (filterFocus === "type") setPropertyTypes([]);
    resetResultWindow();
  }

  function rememberJourneyState(propertyId?: string) {
    const state: SearchRestoreState = {
      pending: true,
      query,
      location,
      purpose,
      minPrice,
      maxPrice,
      propertyTypes,
      bedrooms,
      bathrooms,
      amenities,
      mapBounds,
      sort,
      view,
      selectedId: propertyId ?? selectedId,
      visibleCount,
      scrollY: window.scrollY,
    };
    window.sessionStorage.setItem(SEARCH_RESTORE_KEY, JSON.stringify(state));
  }

  function saveCurrentSearch() {
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const priceLabel = formatPriceRange(minPrice, maxPrice, tx);
    const detailParts = [priceLabel, bedrooms ? tx(`${bedrooms}+ beds`, `အိပ်ခန်း ${bedrooms}+`) : "", bathrooms ? tx(`${bathrooms}+ baths`, `ရေချိုးခန်း ${bathrooms}+`) : "", propertyTypes.length ? propertyTypes.map((type) => propertyTypeLabels[type]).join(", ") : ""].filter(Boolean);
    upsertSavedSearch({
      id: `saved-${Date.now()}`,
      title: location === "All Myanmar" ? tx(`${purpose === "rent" ? "Rentals" : "Homes for sale"} across Myanmar`, purpose === "rent" ? "မြန်မာနိုင်ငံတစ်ဝန်း ငှားရန်အိမ်များ" : "မြန်မာနိုင်ငံတစ်ဝန်း ရောင်းရန်အိမ်များ") : tx(`${purpose === "rent" ? "Rentals" : "Homes for sale"} in ${location}`, `${location} ရှိ ${purpose === "rent" ? "ငှားရန်" : "ရောင်းရန်"}အိမ်များ`),
      detail: detailParts.join(" · ") || tx("Any price · Any home type", "ဈေးနှုန်းမရွေး · အိမ်အမျိုးအစားမရွေး"),
      count: results.length,
      href: currentUrl,
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
    });
    setSearchSaved(true);
  }

  function handleCarouselScroll() {
    if (carouselTimerRef.current) window.clearTimeout(carouselTimerRef.current);
    carouselTimerRef.current = window.setTimeout(() => {
      if (!carouselRef.current) return;
      const center = carouselRef.current.scrollLeft + carouselRef.current.clientWidth / 2;
      const cards = [...carouselRef.current.querySelectorAll<HTMLElement>("[data-property-id]")];
      const closest = cards.reduce<HTMLElement | null>((best, card) => {
        if (!best) return card;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const bestCenter = best.offsetLeft + best.offsetWidth / 2;
        return Math.abs(cardCenter - center) < Math.abs(bestCenter - center) ? card : best;
      }, null);
      if (closest?.dataset.propertyId) setSelectedId(closest.dataset.propertyId);
    }, 120);
  }

  const activeFilters: ActiveFilter[] = [];
  if (location !== "All Myanmar") activeFilters.push({ id: "location", label: location, remove: () => { setLocation("All Myanmar"); setQuery(""); resetResultWindow(); } });
  if (minPrice !== null || maxPrice !== null) activeFilters.push({ id: "budget", label: formatPriceRange(minPrice, maxPrice, tx), remove: () => { setMinPrice(null); setMaxPrice(null); resetResultWindow(); } });
  if (propertyTypes.length) activeFilters.push({ id: "type", label: propertyTypes.length === 1 ? propertyTypeLabels[propertyTypes[0]] : tx(`${propertyTypes.length} home types`, `အိမ်အမျိုးအစား ${propertyTypes.length} မျိုး`), remove: () => { setPropertyTypes([]); resetResultWindow(); } });
  if (bedrooms !== null || bathrooms !== null) activeFilters.push({ id: "rooms", label: [bedrooms ? tx(`${bedrooms}+ beds`, `အိပ်ခန်း ${bedrooms}+`) : "", bathrooms ? tx(`${bathrooms}+ baths`, `ရေချိုးခန်း ${bathrooms}+`) : ""].filter(Boolean).join(" · "), remove: () => { setBedrooms(null); setBathrooms(null); resetResultWindow(); } });
  if (mapBounds) activeFilters.push({ id: "map-area", label: tx("Custom map area", "မြေပုံဧရိယာ"), remove: () => { setMapBounds(null); setDrawingArea(false); resetResultWindow(); } });
  amenities.forEach((id) => {
    const option = amenityOptions.find((item) => item.id === id);
    if (option) activeFilters.push({ id: `amenity-${id}`, label: isMyanmar ? option.labelMy : option.label, remove: () => { setAmenities((current) => current.filter((item) => item !== id)); resetResultWindow(); } });
  });

  const compactHeader = headerCondensed || view === "map";
  const filterSheetCopy: Record<FilterFocus, { title: string; description: string }> = {
    all: { title: tx("Filters", "စစ်ထုတ်မှုများ"), description: tx("Choose what matters for your next home.", "သင့်နောက်အိမ်အတွက် အရေးကြီးသည်များကို ရွေးပါ။") },
    location: { title: tx("Choose a location", "နေရာရွေးပါ"), description: tx("Search by city or township.", "မြို့ သို့မဟုတ် မြို့နယ်ဖြင့် ရှာပါ။") },
    price: { title: tx("Set your price range", "ဈေးနှုန်းအပိုင်းအခြားရွေးပါ"), description: purpose === "rent" ? tx("Choose a monthly rent range.", "လစဉ်ငှားရမ်းခ အပိုင်းအခြားရွေးပါ။") : tx("Choose a total purchase price range.", "စုစုပေါင်းဝယ်ဈေး အပိုင်းအခြားရွေးပါ။") },
    beds: { title: tx("Beds & baths", "အိပ်ခန်းနှင့် ရေချိုးခန်း"), description: tx("Select the minimum rooms you need.", "လိုအပ်သည့် အနည်းဆုံးအခန်းအရေအတွက်ရွေးပါ။") },
    type: { title: tx("Home types", "အိမ်အမျိုးအစားများ"), description: tx("Choose one or more property types.", "အိမ်အမျိုးအစားတစ်မျိုး သို့မဟုတ် အများအပြားရွေးပါ။") },
  };
  const filterControlProps: FilterControlsProps = {
    location,
    purpose,
    minPrice,
    maxPrice,
    propertyTypes,
    bedrooms,
    bathrooms,
    amenities,
    isMyanmar,
    tx,
    focus: filterFocus,
    onPurposeChange: setPurposeAndReset,
    onLocationChange: (value) => { setLocation(value); setQuery(value === "All Myanmar" ? "" : value); resetResultWindow(); },
    onMinPriceChange: (value) => { setMinPrice(value); if (value !== null && maxPrice !== null && value > maxPrice) setMaxPrice(null); resetResultWindow(); },
    onMaxPriceChange: (value) => { setMaxPrice(value); if (value !== null && minPrice !== null && value < minPrice) setMinPrice(null); resetResultWindow(); },
    onPropertyTypeToggle: togglePropertyType,
    onBedroomsChange: (value) => { setBedrooms(bedrooms === value ? null : value); resetResultWindow(); },
    onBathroomsChange: (value) => { setBathrooms(bathrooms === value ? null : value); resetResultWindow(); },
    onAmenityToggle: toggleAmenity,
  };

  return (
    <div className="a7-page pb-28 lg:pb-10">
      <header className="a7-glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto max-w-[1280px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href="/" className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] border border-a7-line bg-white text-a7-navy shadow-[var(--shadow-hairline)] transition-colors hover:border-[#B8C8DB] hover:text-a7-blue" aria-label={tx("Back home", "ပင်မသို့ပြန်ရန်")}><ArrowLeft className="size-[18px]" /></Link>
            <SearchBar
              value={query}
              onValueChange={(value) => { setQuery(value); if (location !== "All Myanmar") setLocation("All Myanmar"); resetResultWindow(); }}
              label={tx("Search by location or property", "နေရာ သို့မဟုတ် အိမ်ဖြင့် ရှာရန်")}
              placeholder={tx("Township or landmark", "မြို့နယ် သို့မဟုတ် နေရာ")}
              className="min-w-0 flex-1"
              trailing={query ? <button type="button" onClick={() => { setQuery(""); setLocation("All Myanmar"); resetResultWindow(); }} className="-mr-2 grid size-11 place-items-center rounded-full bg-[#F0EEE8] text-[#707873]" aria-label={tx("Clear search", "ရှာဖွေမှုရှင်းရန်")}><X className="size-3.5" /></button> : undefined}
            />
            <button type="button" onClick={() => openFilters("all")} className="relative grid size-12 shrink-0 place-items-center rounded-[var(--radius-control)] bg-a7-blue text-white shadow-[var(--shadow-action)] transition-[background-color,box-shadow] duration-[var(--duration-base)] hover:bg-[#0049B8]" aria-label={tx("Open all filters", "စစ်ထုတ်မှုအားလုံးဖွင့်ရန်")}><SlidersHorizontal className="size-[19px]" />{activeFilters.length > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-[#FAF8F5] bg-white text-[8px] font-bold text-a7-blue">{activeFilters.length}</span>}</button>
          </div>

          <div className={cn("relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8", compactHeader ? "hidden" : "mt-3 block")}>
            <div className="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto px-4 pb-0.5 sm:px-6 lg:px-8">
              <div role="tablist" aria-label={tx("Rent or buy", "ငှားရန် သို့မဟုတ် ဝယ်ရန်")} className="flex h-11 shrink-0 items-center rounded-[12px] bg-[#EFEEEB] p-1">
                {(["rent", "sale"] as const).map((option) => {
                  const selected = purpose === option;
                  return <button key={option} type="button" role="tab" aria-selected={selected} onClick={() => setPurposeAndReset(option)} className={cn("h-9 min-w-[62px] rounded-[9px] px-3.5 text-[10px] font-semibold transition-[background-color,color,box-shadow] duration-200", selected ? "bg-white text-a7-blue shadow-[var(--shadow-hairline)]" : "text-[#68716D] hover:text-a7-navy")}>{option === "rent" ? tx("Rent", "ငှားရန်") : tx("Buy", "ဝယ်ရန်")}</button>;
                })}
              </div>
              <FilterChip icon={<MapPin className="size-3.5" />} active={location !== "All Myanmar"} onClick={() => openFilters("location")}>{location === "All Myanmar" ? tx("Location", "နေရာ") : location}</FilterChip>
              <FilterChip icon={<Banknote className="size-3.5" />} active={minPrice !== null || maxPrice !== null} onClick={() => openFilters("price")}>{minPrice !== null || maxPrice !== null ? formatPriceRangeCompact(minPrice, maxPrice) : tx("Price", "ဈေးနှုန်း")}</FilterChip>
              <FilterChip icon={<BedDouble className="size-3.5" />} active={bedrooms !== null || bathrooms !== null} onClick={() => openFilters("beds")}>{bedrooms || bathrooms ? [bedrooms ? `${bedrooms}+ bd` : "", bathrooms ? `${bathrooms}+ ba` : ""].filter(Boolean).join(" · ") : tx("Beds & baths", "အိပ်ခန်း · ရေချိုးခန်း")}</FilterChip>
              <FilterChip icon={<Building2 className="size-3.5" />} active={propertyTypes.length > 0} onClick={() => openFilters("type")}>{propertyTypes.length === 0 ? tx("Home type", "အိမ်အမျိုးအစား") : propertyTypes.length === 1 ? propertyTypeLabels[propertyTypes[0]] : tx(`${propertyTypes.length} types`, `${propertyTypes.length} မျိုး`)}</FilterChip>
              <span className="w-2 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className={cn(view === "map" && "hidden lg:block")}>
          <div className="flex flex-col gap-5 border-b border-a7-line pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-a7-blue">{tx(`${results.length} available homes`, `ရရှိနိုင်သောအိမ် ${results.length} လုံး`)}</p>
              <h1 className="text-[27px] font-semibold tracking-[-0.04em] text-a7-navy sm:text-[32px]">
                {purpose === "rent" ? tx("Homes for rent", "ငှားရန်အိမ်များ") : tx("Homes for sale", "ရောင်းရန်အိမ်များ")}
              </h1>
              <p className="mt-1.5 text-[11px] text-a7-muted">{location === "All Myanmar" ? tx("Across Myanmar", "မြန်မာနိုင်ငံတစ်ဝန်း") : `${location}, Myanmar`}</p>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              <label className="relative flex h-11 min-w-0 flex-1 items-center rounded-[12px] border border-a7-line bg-white shadow-[var(--shadow-hairline)] sm:w-[184px] sm:flex-none">
                <span className="sr-only">{tx("Sort homes", "အိမ်များစီရန်")}</span>
                <select value={sort} onChange={(event) => { setSort(event.target.value as PropertySort); resetResultWindow(); }} className="h-11 min-w-0 flex-1 appearance-none bg-transparent pl-3.5 pr-9 text-[11px] font-medium text-[#334155] outline-none" aria-label={tx("Sort homes", "အိမ်များစီရန်")}>
                  <option value="recommended">{tx("Recommended", "အကြံပြုထားသည်")}</option>
                  <option value="newest">{tx("Newest", "အသစ်ဆုံး")}</option>
                  <option value="price-asc">{tx("Price: low to high", "ဈေးနည်းမှများ")}</option>
                  <option value="price-desc">{tx("Price: high to low", "ဈေးများမှနည်း")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-[#64748B]" />
              </label>
              <button type="button" onClick={() => setView(view === "list" ? "map" : "list")} className="inline-flex h-11 min-w-[84px] shrink-0 items-center justify-center gap-2 rounded-[12px] border border-[#CBD7E6] bg-white px-3.5 text-[10px] font-semibold text-a7-blue shadow-[var(--shadow-hairline)] transition-colors hover:bg-[#F6F9FD]" aria-label={view === "list" ? tx("Map view", "မြေပုံမြင်ကွင်း") : tx("List view", "စာရင်းမြင်ကွင်း")}>
                {view === "list" ? <Map className="size-4" /> : <List className="size-4" />}
                <span>{view === "list" ? tx("Map", "မြေပုံ") : tx("List", "စာရင်း")}</span>
              </button>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5" aria-label={tx("Active filters", "အသုံးပြုထားသော စစ်ထုတ်မှုများ")}>
              <div className="hide-scrollbar -ml-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 pl-4">
                {activeFilters.map((filter) => <ActiveFilterChip key={filter.id} label={filter.label} onRemove={filter.remove} />)}
              </div>
              <button type="button" onClick={clearFilters} className="h-11 shrink-0 rounded-[12px] px-2 text-[10px] font-semibold text-[#0057D9]">{tx("Clear", "ရှင်းရန်")}</button>
            </div>
          )}
        </div>

        {view === "map" ? (
          <div className="fixed inset-x-0 bottom-[72px] top-[72px] z-40 lg:static lg:mt-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-5">
            <aside className="a7-card hidden p-5 lg:sticky lg:top-[96px] lg:block" aria-label={tx("Search filters", "ရှာဖွေမှုစစ်ထုတ်များ")}>
              <h2 className="mb-5 text-[20px] font-semibold">{tx("Refine search", "ရှာဖွေမှုရွေးချယ်ရန်")}</h2>
              <FilterControls {...filterControlProps} focus="all" />
            </aside>
            <div className="relative h-full min-w-0">
              <PropertyMap properties={results} selectedId={selectedId} onSelect={setSelectedId} showPrivacyNotice={false} showLiveLabel={false} drawArea={drawingArea} drawnBounds={mapBounds} onDrawArea={(bounds) => { setMapBounds(bounds); setDrawingArea(false); resetResultWindow(); }} className="h-full min-h-0 rounded-none border-0 lg:h-[calc(100svh-230px)] lg:max-h-[720px] lg:min-h-[520px] lg:rounded-[20px] lg:border" />
              <div className="absolute inset-x-3 top-3 z-[600] flex items-center gap-2">
                <span className="rounded-full border border-white/80 bg-white/94 px-3 py-2 text-[10px] font-semibold text-[#334155] shadow-sm backdrop-blur">{tx(`${results.length} homes`, `အိမ် ${results.length} လုံး`)}</span>
                <button type="button" onClick={() => setDrawingArea((current) => !current)} className={cn("inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold shadow-sm backdrop-blur", drawingArea ? "border-[#0057D9] bg-[#0057D9] text-white" : "border-white/80 bg-white/94 text-[#0057D9]")} aria-pressed={drawingArea}><ScanSearch className="size-4" />{mapBounds ? tx("Redraw", "ပြန်ဆွဲ") : tx("Draw area", "ဧရိယာဆွဲ")}</button>
                <button type="button" onClick={() => setView("list")} className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-full border border-white/80 bg-white/94 px-3 text-[10px] font-semibold text-[#0057D9] shadow-sm backdrop-blur"><List className="size-4" />{tx("List", "စာရင်း")}</button>
              </div>
              {drawingArea && <div className="pointer-events-none absolute left-1/2 top-[66px] z-[600] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0F1B2D]/92 px-4 py-2 text-[9px] font-semibold text-white shadow-lg">{tx("Tap two map corners to set your area", "ဧရိယာသတ်မှတ်ရန် မြေပုံထောင့်နှစ်နေရာကို နှိပ်ပါ")}</div>}
              {mapBounds && !drawingArea && <button type="button" onClick={() => { setMapBounds(null); resetResultWindow(); }} className="absolute bottom-[236px] left-1/2 z-[600] inline-flex h-11 -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/80 bg-white/94 px-4 text-[10px] font-semibold text-[#0057D9] shadow-sm backdrop-blur lg:bottom-4"><X className="size-3.5" />{tx("Clear map area", "မြေပုံဧရိယာရှင်း")}</button>}
              <div ref={carouselRef} onScroll={handleCarouselScroll} className="hide-scrollbar absolute inset-x-0 bottom-0 z-[600] flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3 lg:hidden">
                {results.slice(0, 24).map((property) => (
                  <div key={property.id} data-property-id={property.id} onClick={() => setSelectedId(property.id)} className="w-[calc(100vw-40px)] max-w-[350px] shrink-0 snap-center">
                    <MobilePropertyCard property={property} variant="compact" saved={saved.includes(property.id)} onToggleSaved={toggleSaved} onOpen={() => rememberJourneyState(property.id)} className={cn("w-full min-w-0 transition-[border-color,box-shadow] duration-200", selectedId === property.id && "border-[#0057D9] ring-2 ring-[#0057D9]/15")} />
                  </div>
                ))}
              </div>
              <div className="mt-5 hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                {results.slice(0, 6).map((property) => <div key={property.id} data-search-property-id={property.id}><MobilePropertyCard property={property} saved={saved.includes(property.id)} onToggleSaved={toggleSaved} onOpen={() => rememberJourneyState(property.id)} /></div>)}
              </div>
            </div>
          </div>
        ) : results.length ? (
          <>
            <div className="mt-5 grid gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, visibleCount).map((property, index) => <div key={property.id} data-search-property-id={property.id}><MobileSearchCard property={property} saved={saved.includes(property.id)} onToggleSaved={toggleSaved} onOpen={() => rememberJourneyState(property.id)} priority={index < 2} compared={comparisonIds.includes(property.id)} compareDisabled={!comparisonIds.includes(property.id) && comparisonIds.length >= maxComparisonHomes} onToggleCompare={toggleProperty} /></div>)}
            </div>
            {visibleCount < results.length && (
              <div className="mt-7 text-center">
                <Button variant="outline" className="h-12 rounded-[14px] bg-white px-6" onClick={() => setVisibleCount((count) => count + 12)}>{tx(`Show ${Math.min(12, results.length - visibleCount)} more homes`, `နောက်ထပ် ${Math.min(12, results.length - visibleCount)} လုံး ပြရန်`)}</Button>
                <p className="mt-2 text-[9px] text-[#7B837F]">{tx(`Showing ${Math.min(visibleCount, results.length)} of ${results.length}`, `${results.length} လုံးအနက် ${Math.min(visibleCount, results.length)} လုံးပြထားသည်`)}</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 rounded-[20px] border border-dashed border-[#B9D3FA] bg-white px-6 py-12 text-center"><MapPin className="mx-auto size-8 text-[#0057D9]" /><h2 className="mt-4 text-xl font-semibold">{tx("No exact matches yet", "အတိအကျကိုက်ညီသောအိမ် မတွေ့သေးပါ")}</h2><p className="mx-auto mt-2 max-w-md text-[12px] leading-6 text-[#707A75]">{tx("Try a nearby township or clear one filter.", "အနီးအနားမြို့နယ်ကို စမ်းကြည့်ပါ သို့မဟုတ် စစ်ထုတ်မှုတစ်ခုရှင်းပါ။")}</p><button type="button" onClick={clearFilters} className="mt-5 h-11 rounded-[14px] bg-[#0057D9] px-5 text-[12px] font-semibold text-white">{tx("Clear filters", "စစ်ထုတ်မှုရှင်းရန်")}</button></div>
        )}
      </main>

      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} title={filterSheetCopy[filterFocus].title} description={filterSheetCopy[filterFocus].description} footer={<div className="space-y-2.5">{filterFocus === "all" && <button type="button" onClick={saveCurrentSearch} className={cn("inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border text-[10px] font-semibold transition-colors", searchSaved ? "border-[#B9D8C4] bg-[#F1F8F3] text-[#287A4B]" : "border-[#C8D8EA] bg-[#F5F8FC] text-[#0057D9]")} aria-pressed={searchSaved}>{searchSaved ? <Check className="size-4" /> : <BellPlus className="size-4" />}{searchSaved ? tx("Search saved · alerts on", "ရှာဖွေမှုသိမ်းပြီး · အသိပေးမည်") : tx("Save search & get alerts", "ရှာဖွေမှုသိမ်းပြီး အသိပေးပါ")}</button>}<div className="grid grid-cols-[.8fr_1.2fr] gap-2"><Button variant="outline" className="h-12 rounded-[12px]" onClick={clearFocusedFilters}>{filterFocus === "all" ? tx("Reset", "ပြန်ရှင်းရန်") : tx("Clear", "ရှင်းရန်")}</Button><Button className="h-12 rounded-[12px] bg-[#0057D9] !text-white hover:bg-[#003F91]" onClick={() => setFiltersOpen(false)}>{tx(`Show ${results.length} homes`, `အိမ် ${results.length} လုံး ပြရန်`)}</Button></div></div>}>
        <div className="p-5 pb-8 sm:px-7"><FilterControls {...filterControlProps} /></div>
      </FilterSheet>
    </div>
  );
}

function formatFilterPrice(amount: number) {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  return `${amount / 1_000}K`;
}

function formatPriceRangeCompact(minPrice: number | null, maxPrice: number | null) {
  if (minPrice !== null && maxPrice !== null) return `${formatFilterPrice(minPrice)}–${formatFilterPrice(maxPrice)}`;
  if (minPrice !== null) return `${formatFilterPrice(minPrice)}+`;
  if (maxPrice !== null) return `≤ ${formatFilterPrice(maxPrice)}`;
  return "";
}

function formatPriceRange(minPrice: number | null, maxPrice: number | null, tx: FilterControlsProps["tx"]) {
  if (minPrice !== null && maxPrice !== null) return `${new Intl.NumberFormat("en-US").format(minPrice)}–${new Intl.NumberFormat("en-US").format(maxPrice)} MMK`;
  if (minPrice !== null) return tx(`${new Intl.NumberFormat("en-US").format(minPrice)} MMK and above`, `${new Intl.NumberFormat("en-US").format(minPrice)} MMK နှင့်အထက်`);
  if (maxPrice !== null) return tx(`Up to ${new Intl.NumberFormat("en-US").format(maxPrice)} MMK`, `${new Intl.NumberFormat("en-US").format(maxPrice)} MMK အထိ`);
  return "";
}

function parseMapBounds(value: string | null): MapSearchBounds | null {
  if (!value) return null;
  const [south, west, north, east] = value.split(",").map(Number);
  if (![south, west, north, east].every(Number.isFinite) || south >= north || west >= east) return null;
  return { south, west, north, east };
}

function serializeMapBounds(bounds: MapSearchBounds) {
  return [bounds.south, bounds.west, bounds.north, bounds.east].map((value) => value.toFixed(5)).join(",");
}

function FilterChip({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] border px-3.5 text-[10px] font-semibold shadow-[var(--shadow-hairline)] transition-[border-color,background-color,color] duration-[var(--duration-base)]", active ? "border-[#9DBAE0] bg-[#EDF4FF] text-a7-blue" : "border-a7-line bg-white text-[#515D58] hover:border-[#AEBCCB] hover:text-a7-navy")}>{icon}<span>{children}</span><ChevronDown className="size-3" aria-hidden="true" /></button>;
}

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <button type="button" onClick={onRemove} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-[#C8D6E5] bg-[#F3F6F9] pl-3.5 pr-3 text-[10px] font-semibold text-[#0057D9]" aria-label={`Remove ${label} filter`}>{label}<X className="size-3" /></button>;
}

function FilterGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="border-b border-[#ECE9E2] pb-7 last:border-b-0 last:pb-0"><div className="mb-3"><h3 className="text-[12px] font-semibold text-a7-navy">{title}</h3>{description && <p className="mt-1 text-[9px] leading-4 text-[#7B837F]">{description}</p>}</div>{children}</section>;
}

function ChoiceButton({ selected, onClick, children, compact = false, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; compact?: boolean; className?: string }) {
  return <button type="button" onClick={onClick} className={cn("inline-flex items-center justify-center gap-1.5 rounded-[14px] border font-semibold", compact ? "h-11 px-3 text-[10px]" : "h-12 px-4 text-[11px]", selected ? "border-[#0057D9] bg-[#EEF5FC] text-[#0057D9]" : "border-[#DCD9D1] bg-white text-[#66716C]", className)}>{selected && <Check className="size-3.5" />}{children}</button>;
}

interface FilterControlsProps {
  location: string;
  purpose: "rent" | "sale";
  minPrice: number | null;
  maxPrice: number | null;
  propertyTypes: Property["property_type"][];
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: AmenityId[];
  isMyanmar: boolean;
  tx: (english: string, myanmar: string) => string;
  focus: FilterFocus;
  onPurposeChange: (value: "rent" | "sale") => void;
  onLocationChange: (value: string) => void;
  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;
  onPropertyTypeToggle: (value: Property["property_type"]) => void;
  onBedroomsChange: (value: number) => void;
  onBathroomsChange: (value: number) => void;
  onAmenityToggle: (value: AmenityId) => void;
}

function LocationPicker({ value, onChange, tx }: { value: string; onChange: (value: string) => void; tx: FilterControlsProps["tx"] }) {
  const listId = useId();
  const [draft, setDraft] = useState(value === "All Myanmar" ? "" : value);

  function commit(nextDraft: string) {
    const match = searchLocations.find((item) => item.toLowerCase() === nextDraft.trim().toLowerCase());
    if (match) onChange(match);
    else if (!nextDraft.trim()) onChange("All Myanmar");
  }

  return (
    <div>
      <input
        list={listId}
        value={draft}
        onChange={(event) => { setDraft(event.target.value); commit(event.target.value); }}
        onBlur={() => { const match = searchLocations.find((item) => item.toLowerCase() === draft.trim().toLowerCase()); if (!match && draft) setDraft(value === "All Myanmar" ? "" : value); }}
        placeholder={tx("Search city or township", "မြို့ သို့မဟုတ် မြို့နယ်ရှာရန်")}
        className="h-12 w-full rounded-[14px] border border-[#DCD9D1] bg-white px-4 text-[13px] outline-none placeholder:text-[#98A09C] focus:border-[#0057D9]"
        autoComplete="off"
      />
      <datalist id={listId}>{searchLocations.filter((item) => item !== "All Myanmar").map((item) => <option key={item} value={item} />)}</datalist>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {["Yangon", "Kamayut", "Sanchaung"].map((item) => <ChoiceButton key={item} selected={value === item} onClick={() => onChange(item)} compact>{item}</ChoiceButton>)}
      </div>
    </div>
  );
}

function FilterControls({ location, purpose, minPrice, maxPrice, propertyTypes, bedrooms, bathrooms, amenities, isMyanmar, tx, focus, onPurposeChange, onLocationChange, onMinPriceChange, onMaxPriceChange, onPropertyTypeToggle, onBedroomsChange, onBathroomsChange, onAmenityToggle }: FilterControlsProps) {
  const budgetOptions = purpose === "rent" ? [300000, 500000, 800000, 1500000, 3000000] : [60000000, 120000000, 300000000, 500000000, 800000000];
  const show = (section: Exclude<FilterFocus, "all">) => focus === "all" || focus === section;
  return (
    <div className="space-y-7">
      {focus === "all" && <FilterGroup title={tx("I’m looking to", "ရှာဖွေလိုသည်")}>
        <div role="radiogroup" aria-label={tx("Rent or buy", "ငှားရန် သို့မဟုတ် ဝယ်ရန်")} className="grid grid-cols-2 rounded-[14px] bg-[#ECEFEB] p-1">
          {(["rent", "sale"] as const).map((option) => <button key={option} type="button" role="radio" aria-checked={purpose === option} onClick={() => onPurposeChange(option)} className={cn("h-11 rounded-[11px] text-[11px] font-semibold transition-[background-color,color,box-shadow]", purpose === option ? "bg-white text-[#0057D9] shadow-[0_1px_4px_rgba(15,23,42,.12)]" : "text-[#66716C]")}>{option === "rent" ? tx("Rent a home", "အိမ်ငှားမည်") : tx("Buy a home", "အိမ်ဝယ်မည်")}</button>)}
        </div>
      </FilterGroup>}
      {show("location") && <FilterGroup title={tx("City or township", "မြို့ သို့မဟုတ် မြို့နယ်")} description={tx("Type or use a recent location.", "ရိုက်ထည့်ပါ သို့မဟုတ် မကြာသေးမီနေရာရွေးပါ။")}><LocationPicker key={location} value={location} onChange={onLocationChange} tx={tx} /></FilterGroup>}
      {show("price") && <FilterGroup title={purpose === "rent" ? tx("Monthly rent", "လစဉ်ငှားရမ်းခ") : tx("Purchase price", "ဝယ်ယူဈေးနှုန်း")} description={tx("Set a minimum and maximum price.", "အနည်းဆုံးနှင့် အများဆုံးဈေးနှုန်းရွေးပါ။")}>
        <div className="grid grid-cols-2 gap-2">
          <label className="block"><span className="mb-1.5 block text-[9px] font-semibold text-[#68726D]">{tx("Minimum", "အနည်းဆုံး")}</span><select value={minPrice ?? ""} onChange={(event) => onMinPriceChange(event.target.value ? Number(event.target.value) : null)} className="h-12 w-full rounded-[12px] border border-[#DCD9D1] bg-white px-3 text-[11px] font-semibold text-[#334155] outline-none focus:border-[#0057D9]"><option value="">{tx("No minimum", "အနည်းဆုံးမရွေး")}</option>{budgetOptions.map((amount) => <option key={amount} value={amount}>{formatFilterPrice(amount)} MMK</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-[9px] font-semibold text-[#68726D]">{tx("Maximum", "အများဆုံး")}</span><select value={maxPrice ?? ""} onChange={(event) => onMaxPriceChange(event.target.value ? Number(event.target.value) : null)} className="h-12 w-full rounded-[12px] border border-[#DCD9D1] bg-white px-3 text-[11px] font-semibold text-[#334155] outline-none focus:border-[#0057D9]"><option value="">{tx("No maximum", "အများဆုံးမရွေး")}</option>{budgetOptions.map((amount) => <option key={amount} value={amount}>{formatFilterPrice(amount)} MMK</option>)}</select></label>
        </div>
      </FilterGroup>}
      {show("type") && <FilterGroup title={tx("Property type", "အိမ်အမျိုးအစား")} description={tx("Select all types you would consider.", "စိတ်ဝင်စားသည့်အမျိုးအစားအားလုံးရွေးနိုင်သည်။")}><div className="grid grid-cols-2 gap-2">{(["condo", "mini_condo", "apartment", "house", "villa"] as const).map((type) => <ChoiceButton key={type} selected={propertyTypes.includes(type)} onClick={() => onPropertyTypeToggle(type)}>{propertyTypeLabels[type]}</ChoiceButton>)}</div></FilterGroup>}
      {show("beds") && <FilterGroup title={tx("Beds & baths", "အိပ်ခန်းနှင့် ရေချိုးခန်း")}><div><p className="mb-2 text-[9px] font-semibold text-[#68726D]">{tx("Minimum bedrooms", "အနည်းဆုံးအိပ်ခန်း")}</p><div className="flex flex-wrap gap-2"><ChoiceButton selected={bedrooms === null} onClick={() => bedrooms !== null && onBedroomsChange(bedrooms)} compact>{tx("Any", "မရွေး")}</ChoiceButton>{[1, 2, 3, 4].map((value) => <ChoiceButton key={value} selected={bedrooms === value} onClick={() => onBedroomsChange(value)} compact>{value}+</ChoiceButton>)}</div></div><div className="mt-5"><p className="mb-2 text-[9px] font-semibold text-[#68726D]">{tx("Minimum bathrooms", "အနည်းဆုံးရေချိုးခန်း")}</p><div className="flex flex-wrap gap-2"><ChoiceButton selected={bathrooms === null} onClick={() => bathrooms !== null && onBathroomsChange(bathrooms)} compact>{tx("Any", "မရွေး")}</ChoiceButton>{[1, 2, 3, 4].map((value) => <ChoiceButton key={value} selected={bathrooms === value} onClick={() => onBathroomsChange(value)} compact>{value}+</ChoiceButton>)}</div></div></FilterGroup>}
      {focus === "all" && <FilterGroup title={tx("Amenities", "ဝန်ဆောင်မှုများ")}><div className="flex flex-wrap gap-2">{amenityOptions.map((item) => <ChoiceButton key={item.id} selected={amenities.includes(item.id)} onClick={() => onAmenityToggle(item.id)} compact>{isMyanmar ? item.labelMy : item.label}</ChoiceButton>)}</div></FilterGroup>}
    </div>
  );
}

export { MobilePropertySearch };

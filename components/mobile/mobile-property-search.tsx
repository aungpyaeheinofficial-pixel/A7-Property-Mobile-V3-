"use client";

import { ArrowUpDown, Bath, Bell, BedDouble, Building, Building2, Check, ChevronDown, Grid2X2, Heart, House, List, Map, MapPin, Maximize2, Menu, ScanSearch, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/i18n/language-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MobilePropertyCard } from "@/components/mobile/a7-mobile-ui";
import { MobileSearchCard } from "@/components/mobile/mobile-search-card";
import { PropertyMap, type MapSearchBounds } from "@/components/property/property-map";
import { PropertySearchBar, type PropertySearchTab } from "@/components/search/property-search-bar";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { useToast } from "@/components/ui/toast-provider";
import { usePropertyComparison } from "@/hooks/use-property-comparison";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { mockUser } from "@/lib/mock-users";
import { filterProperties, formatPropertyPrice, propertyTypeLabels, searchLocations, sortProperties, type Property, type PropertySort, type SearchFilters } from "@/lib/properties";
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
  searchTab?: PropertySearchTab;
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
  const { toast } = useToast();
  const locationParam = params.get("location") ?? "";
  const recognizedLocation = searchLocations.includes(locationParam as (typeof searchLocations)[number]);
  const initialPurpose = params.get("purpose") === "sale" ? "sale" : "rent";
  const initialSearchTab: PropertySearchTab = initialPurpose === "rent" ? "rent" : params.get("mode") === "sale" ? "sale" : "buy";
  const initialType = params.get("type");
  const initialTypes = (params.get("types") ?? initialType ?? "").split(",").filter((type): type is Property["property_type"] => Object.prototype.hasOwnProperty.call(propertyTypeLabels, type));
  const initialSort = params.get("sort");
  const initialView = params.get("view");
  const initialAmenities = (params.get("amenities") ?? "").split(",").filter((id): id is AmenityId => amenityOptions.some((option) => option.id === id));

  const [purpose, setPurpose] = useState<"rent" | "sale">(initialPurpose);
  const [searchTab, setSearchTab] = useState<PropertySearchTab>(initialSearchTab);
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
  const [saved, setSaved] = useState(mockUser.savedPropertyIds);
  const [recentIds, setRecentIds] = useState(mockUser.recentlyViewedIds);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const { comparisonIds, toggleProperty, maxComparisonHomes } = usePropertyComparison();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved, mockUser.savedPropertyIds);
    queueMicrotask(() => setSaved(stored));
    const storedRecent = readStoredIds(STORAGE_KEYS.recent, STORAGE_KEYS.legacyRecent, mockUser.recentlyViewedIds);
    queueMicrotask(() => setRecentIds(storedRecent));

    const persisted = window.sessionStorage.getItem(SEARCH_RESTORE_KEY);
    if (!persisted) return;
    try {
      const state = JSON.parse(persisted) as SearchRestoreState;
      if (!state.pending) return;
      queueMicrotask(() => {
        setQuery(state.query);
        setLocation(state.location);
        setPurpose(state.purpose);
        setSearchTab(state.searchTab ?? (state.purpose === "rent" ? "rent" : "buy"));
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
    const next = new URLSearchParams();
    next.set("purpose", purpose);
    if (purpose === "sale") next.set("mode", searchTab === "sale" ? "sale" : "buy");
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
  }, [amenities, bathrooms, bedrooms, location, mapBounds, maxPrice, minPrice, propertyTypes, purpose, query, searchTab, sort, view]);

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

  const recentlyViewed = useMemo(
    () => recentIds.map((id) => properties.find((property) => property.id === id)).filter((property): property is Property => Boolean(property)).slice(0, 4),
    [properties, recentIds],
  );

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
    const wasSaved = saved.includes(property.id);
    const next = wasSaved ? saved.filter((id) => id !== property.id) : [...saved, property.id];
    setSaved(next);
    writeStoredIds(STORAGE_KEYS.saved, next);
    toast({
      tone: "success",
      title: wasSaved ? tx("Removed from Saved Homes", "သိမ်းထားသောအိမ်မှ ဖယ်ပြီး") : tx("Saved for later", "နောက်မှကြည့်ရန် သိမ်းပြီး"),
      description: property.title,
    });
  }

  function toggleCompared(property: Property) {
    const wasCompared = comparisonIds.includes(property.id);
    toggleProperty(property);
    toast({
      tone: "info",
      title: wasCompared ? tx("Removed from comparison", "နှိုင်းယှဉ်မှုမှ ဖယ်ပြီး") : tx("Added to comparison", "နှိုင်းယှဉ်ရန် ထည့်ပြီး"),
      description: property.title,
    });
  }

  function resetResultWindow() {
    setVisibleCount(12);
  }

  function setPurposeAndReset(value: "rent" | "sale", tab: PropertySearchTab = value === "rent" ? "rent" : "buy") {
    setPurpose(value);
    setSearchTab(tab);
    setMinPrice(null);
    setMaxPrice(null);
    resetResultWindow();
  }

  function selectSearchTab(tab: PropertySearchTab) {
    setPurposeAndReset(tab === "rent" ? "rent" : "sale", tab);
  }

  function togglePropertyType(type: Property["property_type"]) {
    setPropertyTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
    resetResultWindow();
  }

  function openFilters(focus: FilterFocus) {
    setFilterFocus(focus);
    setFiltersOpen(true);
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

  function rememberJourneyState(propertyId?: string) {
    const state: SearchRestoreState = {
      pending: true,
      query,
      location,
      purpose,
      searchTab,
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
    tx,
    focus: filterFocus,
    searchTab,
    onSearchTabChange: selectSearchTab,
    onLocationChange: (value) => { setLocation(value); setQuery(value === "All Myanmar" ? "" : value); resetResultWindow(); },
    onMinPriceChange: (value) => { setMinPrice(value); if (value !== null && maxPrice !== null && value > maxPrice) setMaxPrice(null); resetResultWindow(); },
    onMaxPriceChange: (value) => { setMaxPrice(value); if (value !== null && minPrice !== null && value < minPrice) setMinPrice(null); resetResultWindow(); },
    onPropertyTypeToggle: togglePropertyType,
    onPropertyTypesClear: () => { setPropertyTypes([]); resetResultWindow(); },
    onBedroomsChange: (value) => { setBedrooms(value); resetResultWindow(); },
    onBathroomsChange: (value) => { setBathrooms(value); resetResultWindow(); },
  };

  const browseLanding = !query.trim()
    && location === "All Myanmar"
    && minPrice === null
    && maxPrice === null
    && propertyTypes.length === 0
    && bedrooms === null
    && bathrooms === null
    && amenities.length === 0
    && mapBounds === null
    && view === "list";

  if (browseLanding) {
    return (
      <ExploreLanding
        purpose={purpose}
        searchTab={searchTab}
        homes={results}
        saved={saved}
        tx={tx}
        isMyanmar={isMyanmar}
        onSearchValueChange={(value) => { setQuery(value); setLocation("All Myanmar"); resetResultWindow(); }}
        onSearchSubmit={resetResultWindow}
        onPurposeChange={selectSearchTab}
        onOpenFilters={() => openFilters("all")}
        onToggleSaved={toggleSaved}
        onOpenProperty={rememberJourneyState}
        filterSheet={
          <FilterSheet
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title={filterSheetCopy[filterFocus].title}
            description={filterFocus === "all" ? undefined : filterSheetCopy[filterFocus].description}
            className="!inset-x-3 !bottom-3 max-h-[calc(100svh-24px)] !rounded-[28px] border after:pointer-events-none after:absolute after:inset-x-3 after:-bottom-3 after:-z-10 after:h-8 after:rounded-b-[28px] after:bg-a7-blue sm:!left-[calc(50%-240px)] sm:!right-[calc(50%-240px)]"
            headerClassName="border-b-0 px-4 pb-2 pt-3 sm:px-5 sm:py-3"
            footerClassName="border-0 bg-[#F8FBFF] px-4 pb-4 pt-2 backdrop-blur-none sm:px-5"
            footer={<Button className="h-12 w-full rounded-full bg-a7-blue !text-white shadow-[var(--shadow-action)] hover:bg-[#0E2F5C]" onClick={() => setFiltersOpen(false)}>{tx("Apply Filters", "စစ်ထုတ်မည်")}</Button>}
          >
            <div className="px-4 pb-7 pt-2 sm:px-5"><FilterControls {...filterControlProps} /></div>
          </FilterSheet>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF4FF] pb-28 lg:pb-10">
      <header className="relative z-30 bg-[#EAF4FF]">
        <div className="mx-auto max-w-[1280px] px-4 pb-3 pt-3 sm:px-6 lg:px-8">
          <div className="mb-3 flex h-12 items-center gap-3">
            <Link href="/" className="grid size-11 shrink-0 place-items-center rounded-full text-a7-navy transition-colors hover:bg-[#F8FBFF] hover:text-a7-blue" aria-label={tx("Open main navigation", "အဓိကလမ်းညွှန်ဖွင့်ရန်")}><Menu className="size-[22px]" /></Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-[26px] font-semibold tracking-[-0.045em] text-a7-navy sm:text-[29px]">{tx("Explore", "ရှာဖွေမည်")}</h1>
            </div>
            <Link href="/messages" className="relative grid size-11 place-items-center rounded-full bg-[#F8FBFF] text-a7-navy shadow-[var(--shadow-hairline)] transition-colors hover:text-a7-blue" aria-label={tx("Messages and alerts", "မက်ဆေ့ချ်နှင့် အသိပေးချက်များ")}><Bell className="size-[17px]" /><span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-a7-blue" /></Link>
            <Link href="/profile" aria-label={tx("Open profile", "ပရိုဖိုင်ဖွင့်ရန်")}><Avatar src="/images/profile/thiri-win.jpg" alt={mockUser.name} initials={mockUser.initials} size="sm" className="size-11 border-2 border-white bg-[#DCE9FA] text-[11px] shadow-[var(--shadow-hairline)]" /></Link>
          </div>
          <div>
            <PropertySearchBar
              value={query}
              onValueChange={(value) => { setQuery(value); if (location !== "All Myanmar") setLocation("All Myanmar"); resetResultWindow(); }}
              onSubmit={resetResultWindow}
              onClear={() => { setQuery(""); setLocation("All Myanmar"); resetResultWindow(); }}
              activeTab={searchTab}
              onTabChange={selectSearchTab}
              placeholder={tx("Search your location…", "ရှာလိုသောနေရာ…")}
              searchLabel={tx("Search properties", "အိမ်ခြံမြေရှာရန်")}
              clearLabel={tx("Clear location search", "နေရာရှာဖွေမှုရှင်းရန်")}
              compact
              tabs={[
                { id: "sale", label: tx("For Sale", "ရောင်းရန်") },
                { id: "rent", label: tx("For Rent", "ငှားရန်") },
                { id: "buy", label: tx("For Buy", "ဝယ်မည်") },
              ]}
              onOpenFilters={() => openFilters("all")}
              filterCount={activeFilters.length}
              filterLabel={tx("Open all filters", "စစ်ထုတ်မှုအားလုံးဖွင့်ရန်")}
              className="min-w-0"
            />
          </div>
          <div className="hide-scrollbar -mx-4 mt-3 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label={tx("Quick filters", "အမြန်စစ်ထုတ်မှုများ")}>
            <QuickFilterChip selected={purpose === "rent"} selectedTone="blue" onClick={() => setPurposeAndReset("rent", "rent")} label={tx("Rent", "ငှားမည်")} icon={<Building className="size-4" />} />
            <QuickFilterChip selected={purpose === "sale"} selectedTone="blue" onClick={() => setPurposeAndReset("sale", "buy")} label={tx("Buy", "ဝယ်မည်")} icon={<ShoppingBag className="size-4" />} />
            <QuickFilterChip selected={propertyTypes.includes("house")} onClick={() => togglePropertyType("house")} label={tx("House", "အိမ်")} icon={<House className="size-3.5" />} />
            <QuickFilterChip selected={propertyTypes.includes("condo")} onClick={() => togglePropertyType("condo")} label={tx("Condo", "ကွန်ဒို")} icon={<Building2 className="size-3.5" />} />
            <QuickFilterChip selected={propertyTypes.includes("apartment")} onClick={() => togglePropertyType("apartment")} label={tx("Apartment", "တိုက်ခန်း")} icon={<Building2 className="size-3.5" />} />
            <QuickFilterChip selected={false} onClick={() => { setPropertyTypes([]); resetResultWindow(); }} label={tx("Any type", "အမျိုးအစားမရွေး")} icon={<Grid2X2 className="size-3.5" />} />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1280px] px-4 py-4 outline-none sm:px-6 sm:py-6 lg:px-8">
        <div className={cn(view === "map" && "hidden lg:block")}>
          <div className="flex items-end justify-between gap-3 border-b border-a7-line pb-4">
            <div className="min-w-0">
              <p className="mb-1.5 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.16em] text-a7-blue"><ShieldCheck className="size-4 fill-[#123B73] text-white" />{tx(`${results.length} verified homes`, `စိစစ်ထားသောအိမ် ${results.length} လုံး`)}</p>
              <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-a7-navy sm:text-[30px]">{tx("Best matches", "အကောင်းဆုံးအိမ်များ")}</h2>
              <p className="mt-1 text-[10px] text-a7-muted">{location === "All Myanmar" ? tx("Homes across Myanmar", "မြန်မာနိုင်ငံတစ်ဝန်း") : `${location}, Myanmar`}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <label className="relative hidden h-11 w-[152px] items-center rounded-[14px] border border-a7-line bg-[#F8FBFF] shadow-[var(--shadow-hairline)] transition-[border-color,box-shadow] focus-within:border-[#4DA3FF] focus-within:shadow-[0_0_0_3px_rgba(18,59,115,.08)] min-[460px]:flex">
                <span className="sr-only">{tx("Sort homes", "အိမ်များစီရန်")}</span>
                <select data-focus-ring="parent" value={sort} onChange={(event) => { setSort(event.target.value as PropertySort); resetResultWindow(); }} className="h-11 min-w-0 flex-1 appearance-none bg-transparent pl-3.5 pr-9 text-[11px] font-medium text-[#334155] outline-none" aria-label={tx("Sort homes", "အိမ်များစီရန်")}>
                  <option value="recommended">{tx("Recommended", "အကြံပြုထားသည်")}</option>
                  <option value="newest">{tx("Newest", "အသစ်ဆုံး")}</option>
                  <option value="price-asc">{tx("Price: low to high", "ဈေးနည်းမှများ")}</option>
                  <option value="price-desc">{tx("Price: high to low", "ဈေးများမှနည်း")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-[#667085]" />
              </label>
              <label className="relative grid size-11 place-items-center rounded-full border border-a7-line bg-[#F8FBFF] text-a7-navy shadow-[var(--shadow-hairline)] min-[460px]:hidden">
                <span className="sr-only">{tx("Sort homes", "အိမ်များစီရန်")}</span>
                <ArrowUpDown className="pointer-events-none size-4" />
                <select value={sort} onChange={(event) => { setSort(event.target.value as PropertySort); resetResultWindow(); }} className="absolute inset-0 cursor-pointer opacity-0" aria-label={tx("Sort homes", "အိမ်များစီရန်")}>
                  <option value="recommended">{tx("Recommended", "အကြံပြုထားသည်")}</option>
                  <option value="newest">{tx("Newest", "အသစ်ဆုံး")}</option>
                  <option value="price-asc">{tx("Price: low to high", "ဈေးနည်းမှများ")}</option>
                  <option value="price-desc">{tx("Price: high to low", "ဈေးများမှနည်း")}</option>
                </select>
              </label>
              <button type="button" onClick={() => setView(view === "list" ? "map" : "list")} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[14px] border border-[#CBD7E6] bg-[#F8FBFF] px-3.5 text-[10px] font-semibold text-a7-blue shadow-[var(--shadow-hairline)] transition-colors hover:bg-[#F6F9FD]" aria-label={view === "list" ? tx("Map view", "မြေပုံမြင်ကွင်း") : tx("List view", "စာရင်းမြင်ကွင်း")}>
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
              <button type="button" onClick={clearFilters} className="h-11 shrink-0 rounded-[12px] px-2 text-[10px] font-semibold text-[#123B73]">{tx("Clear", "ရှင်းရန်")}</button>
            </div>
          )}
        </div>

        {view === "map" ? (
          <div className="fixed inset-x-0 bottom-[82px] top-[184px] z-40 lg:static lg:mt-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-5">
            <aside className="a7-card hidden p-5 lg:sticky lg:top-[96px] lg:block" aria-label={tx("Search filters", "ရှာဖွေမှုစစ်ထုတ်များ")}>
              <h2 className="mb-5 text-[20px] font-semibold">{tx("Refine search", "ရှာဖွေမှုရွေးချယ်ရန်")}</h2>
              <FilterControls {...filterControlProps} focus="all" />
            </aside>
            <div className="relative h-full min-w-0">
              <PropertyMap properties={results} selectedId={selectedId} onSelect={setSelectedId} showPrivacyNotice={false} showLiveLabel={false} drawArea={drawingArea} drawnBounds={mapBounds} onDrawArea={(bounds) => { setMapBounds(bounds); setDrawingArea(false); resetResultWindow(); }} className="h-full min-h-0 rounded-none border-0 lg:h-[calc(100svh-230px)] lg:max-h-[720px] lg:min-h-[520px] lg:rounded-[20px] lg:border" />
              <div className="absolute inset-x-3 top-3 z-[600] flex items-center gap-2">
                <span className="rounded-full border border-white/80 bg-[#F8FBFF]/94 px-3 py-2 text-[10px] font-semibold text-[#334155] shadow-sm backdrop-blur">{tx(`${results.length} homes`, `အိမ် ${results.length} လုံး`)}</span>
                <button type="button" onClick={() => setDrawingArea((current) => !current)} className={cn("inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold shadow-sm backdrop-blur", drawingArea ? "border-[#123B73] bg-[#123B73] text-white" : "border-white/80 bg-[#F8FBFF]/94 text-[#123B73]")} aria-pressed={drawingArea}><ScanSearch className="size-4" />{mapBounds ? tx("Redraw", "ပြန်ဆွဲ") : tx("Draw area", "ဧရိယာဆွဲ")}</button>
                <button type="button" onClick={() => setView("list")} className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-full border border-white/80 bg-[#F8FBFF]/94 px-3 text-[10px] font-semibold text-[#123B73] shadow-sm backdrop-blur"><List className="size-4" />{tx("List", "စာရင်း")}</button>
              </div>
              {drawingArea && <div className="pointer-events-none absolute left-1/2 top-[66px] z-[600] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#101828]/92 px-4 py-2 text-[9px] font-semibold text-white shadow-lg">{tx("Tap two map corners to set your area", "ဧရိယာသတ်မှတ်ရန် မြေပုံထောင့်နှစ်နေရာကို နှိပ်ပါ")}</div>}
              {mapBounds && !drawingArea && <button type="button" onClick={() => { setMapBounds(null); resetResultWindow(); }} className="absolute bottom-[236px] left-1/2 z-[600] inline-flex h-11 -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/80 bg-[#F8FBFF]/94 px-4 text-[10px] font-semibold text-[#123B73] shadow-sm backdrop-blur lg:bottom-4"><X className="size-3.5" />{tx("Clear map area", "မြေပုံဧရိယာရှင်း")}</button>}
              <div ref={carouselRef} onScroll={handleCarouselScroll} className="hide-scrollbar absolute inset-x-0 bottom-0 z-[600] flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3 lg:hidden">
                {results.slice(0, 24).map((property) => (
                  <div key={property.id} data-property-id={property.id} onClick={() => setSelectedId(property.id)} className="w-[calc(100vw-40px)] max-w-[350px] shrink-0 snap-center">
                    <MobilePropertyCard property={property} variant="compact" saved={saved.includes(property.id)} onToggleSaved={toggleSaved} onOpen={() => rememberJourneyState(property.id)} className={cn("w-full min-w-0 transition-[border-color,box-shadow] duration-200", selectedId === property.id && "border-[#123B73] ring-2 ring-[#123B73]/15")} />
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
            <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, visibleCount).map((property, index) => <div key={property.id} data-search-property-id={property.id} className={cn(index === 0 && "lg:col-span-2 xl:col-span-3")}><MobileSearchCard variant={index === 0 ? "feature" : "compact"} property={property} saved={saved.includes(property.id)} onToggleSaved={toggleSaved} onOpen={() => rememberJourneyState(property.id)} priority={index < 2} compared={comparisonIds.includes(property.id)} compareDisabled={!comparisonIds.includes(property.id) && comparisonIds.length >= maxComparisonHomes} onToggleCompare={toggleCompared} /></div>)}
            </div>
            {visibleCount < results.length && (
              <div className="mt-7 text-center">
                <Button variant="outline" className="h-12 rounded-[14px] bg-[#F8FBFF] px-6" onClick={() => setVisibleCount((count) => count + 12)}>{tx(`Show ${Math.min(12, results.length - visibleCount)} more homes`, `နောက်ထပ် ${Math.min(12, results.length - visibleCount)} လုံး ပြရန်`)}</Button>
                <p className="mt-2 text-[9px] text-[#7B837F]">{tx(`Showing ${Math.min(visibleCount, results.length)} of ${results.length}`, `${results.length} လုံးအနက် ${Math.min(visibleCount, results.length)} လုံးပြထားသည်`)}</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 rounded-[20px] border border-dashed border-[#4DA3FF] bg-[#F8FBFF] px-6 py-12 text-center"><MapPin className="mx-auto size-8 text-[#123B73]" /><h2 className="mt-4 text-xl font-semibold">{tx("No exact matches yet", "အတိအကျကိုက်ညီသောအိမ် မတွေ့သေးပါ")}</h2><p className="mx-auto mt-2 max-w-md text-[12px] leading-6 text-[#707A75]">{tx("Try a nearby township or clear one filter.", "အနီးအနားမြို့နယ်ကို စမ်းကြည့်ပါ သို့မဟုတ် စစ်ထုတ်မှုတစ်ခုရှင်းပါ။")}</p><button type="button" onClick={clearFilters} className="mt-5 h-11 rounded-[14px] bg-[#123B73] px-5 text-[12px] font-semibold text-white">{tx("Clear filters", "စစ်ထုတ်မှုရှင်းရန်")}</button></div>
        )}

        {view === "list" && recentlyViewed.length > 0 && (
          <section className="mt-12 border-t border-a7-line pt-8" aria-labelledby="recently-viewed-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-a7-blue">{tx("Continue your home journey", "အိမ်ရှာဖွေမှုကို ဆက်လုပ်ပါ")}</p>
                <h2 id="recently-viewed-title" className="mt-1.5 text-[23px] font-semibold tracking-[-0.04em] text-a7-navy">{tx("Recently viewed", "မကြာသေးမီက ကြည့်ခဲ့သည်")}</h2>
              </div>
              <Link href="/saved" className="inline-flex min-h-11 shrink-0 items-center text-[10px] font-semibold text-a7-blue">{tx("Saved homes", "သိမ်းထားသောအိမ်များ")}</Link>
            </div>
            <div className="hide-scrollbar -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
              {recentlyViewed.map((property) => (
                <MobilePropertyCard key={property.id} property={property} variant="compact" saved={saved.includes(property.id)} onToggleSaved={toggleSaved} onOpen={() => rememberJourneyState(property.id)} className="w-[82vw] shrink-0 snap-start sm:w-auto" />
              ))}
            </div>
          </section>
        )}
      </main>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title={filterSheetCopy[filterFocus].title}
        description={filterFocus === "all" ? undefined : filterSheetCopy[filterFocus].description}
        className="!inset-x-3 !bottom-3 max-h-[calc(100svh-24px)] !rounded-[28px] border after:pointer-events-none after:absolute after:inset-x-3 after:-bottom-3 after:-z-10 after:h-8 after:rounded-b-[28px] after:bg-a7-blue sm:!left-[calc(50%-240px)] sm:!right-[calc(50%-240px)]"
        headerClassName="border-b-0 px-4 pb-2 pt-3 sm:px-5 sm:py-3"
        footerClassName="border-0 bg-[#F8FBFF] px-4 pb-4 pt-2 backdrop-blur-none sm:px-5"
        footer={<Button className="h-12 w-full rounded-full bg-a7-blue !text-white shadow-[var(--shadow-action)] hover:bg-[#0E2F5C]" onClick={() => setFiltersOpen(false)}>{tx("Apply Filters", "စစ်ထုတ်မည်")}</Button>}
      >
        <div className="px-4 pb-7 pt-2 sm:px-5"><FilterControls {...filterControlProps} /></div>
      </FilterSheet>
    </div>
  );
}

interface ExploreLandingProps {
  purpose: "rent" | "sale";
  searchTab: PropertySearchTab;
  homes: Property[];
  saved: string[];
  tx: (english: string, myanmar: string) => string;
  isMyanmar: boolean;
  onSearchValueChange: (value: string) => void;
  onSearchSubmit: () => void;
  onPurposeChange: (tab: PropertySearchTab) => void;
  onOpenFilters: () => void;
  onToggleSaved: (property: Property) => void;
  onOpenProperty: (propertyId: string) => void;
  filterSheet: React.ReactNode;
}

function ExploreLanding({ purpose, searchTab, homes, saved, tx, isMyanmar, onSearchValueChange, onSearchSubmit, onPurposeChange, onOpenFilters, onToggleSaved, onOpenProperty, filterSheet }: ExploreLandingProps) {
  const locationCards = [
    { location: "Yangon", image: "/images/properties/a7-yangon-blue-hour-hero.png", title: tx("Yangon", "ရန်ကုန်"), detail: tx("Explore homes in Yangon", "ရန်ကုန်ရှိအိမ်များကိုရှာရန်") },
    { location: "Mandalay", image: "/images/properties/hero-yangon-home.jpg", title: tx("Mandalay", "မန္တလေး"), detail: tx("Explore homes in Mandalay", "မန္တလေးရှိအိမ်များကိုရှာရန်") },
    { location: "All Myanmar", image: "/images/properties/a7-yangon-daylight-hero.png", title: tx("Across Myanmar", "မြန်မာတစ်ဝန်း"), detail: tx("Find your next place", "သင့်အိမ်အသစ်ကိုရှာရန်") },
  ];

  function locationHref(location: string) {
    const params = new URLSearchParams({ purpose });
    if (purpose === "sale") params.set("mode", "buy");
    if (location !== "All Myanmar") params.set("location", location);
    return `/search?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-[120px] text-[#1B1B1F] lg:pb-12">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[.035] bg-white/85 shadow-[0_1px_8px_rgba(0,0,0,.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[760px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label={tx("A7 Property home", "A7 Property ပင်မစာမျက်နှာ")}>
            <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_2px_7px_rgba(16,24,40,.12)]"><Image src="/images/brand/a7-property-logo.jpg" alt="" fill sizes="32px" className="scale-[2.55] object-contain" /></span>
            <span className="truncate text-[20px] font-semibold tracking-[-.035em] text-[#0053D2]">A7 Property</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher className="[&_button]:h-9 [&_button]:rounded-full [&_button]:bg-[#EFEDF1] [&_button]:px-2.5 [&_button]:text-[#424655] [&_button]:hover:bg-[#E3E2E6]" />
            <Link href="/messages" className="relative grid size-10 place-items-center rounded-full text-[#424655] transition-colors hover:bg-[#EFEDF1]" aria-label={tx("Messages and alerts", "မက်ဆေ့ချ်နှင့် အသိပေးချက်များ")}><Bell className="size-5" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#0053D2] ring-2 ring-white" /></Link>
            <Link href="/profile" className="relative size-9 overflow-hidden rounded-full" aria-label={tx("Open profile", "ပရိုဖိုင်ဖွင့်ရန်")}><Image src="/images/profile/thiri-win.jpg" alt={mockUser.name} fill sizes="36px" className="object-cover" /></Link>
          </div>
        </div>
      </header>

      <main className="pt-16" id="main-content" tabIndex={-1}>
        <section className="bg-white px-4 pb-5 pt-4 sm:px-6">
          <div className="mx-auto max-w-[760px]">
            <form onSubmit={(event) => { event.preventDefault(); onSearchSubmit(); }} role="search" className="flex h-14 items-center rounded-full bg-[#E9E7EC] px-4 shadow-sm transition-shadow focus-within:shadow-[0_0_0_3px_rgba(0,83,210,.12)]">
              <Search className="mr-3 size-5 shrink-0 text-[#424655]" />
              <input type="search" autoComplete="off" onChange={(event) => onSearchValueChange(event.target.value)} placeholder={tx("Search township, city or property...", "မြို့နယ်၊ မြို့ သို့မဟုတ် အိမ်ရှာရန်...")} aria-label={tx("Search properties", "အိမ်ခြံမြေရှာရန်")} className="min-w-0 flex-1 bg-transparent text-[14px] text-[#1B1B1F] outline-none placeholder:text-[#6B7280]" />
              <span className="mx-3 h-6 w-px bg-[#C2C6D8]" aria-hidden="true" />
              <button type="button" onClick={onOpenFilters} className="grid size-10 place-items-center rounded-full text-[#0053D2] transition-colors hover:bg-white/70" aria-label={tx("Open filters", "စစ်ထုတ်မှုဖွင့်ရန်")}><SlidersHorizontal className="size-5" /></button>
            </form>
            <div className="mt-4 flex rounded-full bg-[#EFEDF1] p-1" role="tablist" aria-label={tx("Property purpose", "အိမ်ခြံမြေ ရည်ရွယ်ချက်")}>
              <ExplorePurposeButton active={searchTab === "buy" || searchTab === "sale"} label={tx("Buy", "ဝယ်ရန်")} onClick={() => onPurposeChange("buy")} />
              <ExplorePurposeButton active={searchTab === "rent"} label={tx("Rent", "ငှားရန်")} onClick={() => onPurposeChange("rent")} />
            </div>
          </div>
        </section>

        <section className="py-5">
          <div className="mx-auto max-w-[760px]">
            <h1 className="px-4 text-[20px] font-semibold tracking-[-.03em] text-[#1B1B1F] sm:px-6">{tx("Where do you want to live?", "ဘယ်မှာနေချင်ပါသလဲ?")}</h1>
            <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6">
              {locationCards.map((location) => <ExploreLocationCard key={location.location} href={locationHref(location.location)} image={location.image} title={location.title} detail={location.detail} />)}
            </div>
          </div>
        </section>

        <section id="recommended-properties" className="mx-auto max-w-[760px] px-4 pb-5 pt-2 sm:px-6" aria-labelledby="recommended-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="recommended-title" className="text-[20px] font-semibold tracking-[-.03em] text-[#1B1B1F]">{tx("Recommended for you", "သင့်အတွက်အကြံပြုထားသည်")}</h2>
            <Link href="#all-properties" className="inline-flex h-10 items-center text-[13px] font-medium text-[#0053D2]">{tx("See all", "အားလုံးကြည့်ရန်")}</Link>
          </div>
          <div id="all-properties" className="space-y-6">
            {homes.slice(0, 4).map((property, index) => <ExploreRecommendationCard key={property.id} property={property} saved={saved.includes(property.id)} isMyanmar={isMyanmar} tx={tx} priority={index < 2} onToggleSaved={onToggleSaved} onOpen={onOpenProperty} />)}
          </div>
        </section>
      </main>
      {filterSheet}
    </div>
  );
}

function ExplorePurposeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={cn("h-10 flex-1 rounded-full text-[13px] font-medium transition-[background-color,color,box-shadow]", active ? "bg-[#0053D2] text-white shadow-[0_2px_5px_rgba(0,83,210,.25)]" : "text-[#424655] hover:bg-white/70")}>{label}</button>;
}

function ExploreLocationCard({ href, image, title, detail }: { href: string; image: string; title: string; detail: string }) {
  return (
    <Link href={href} className="group relative h-48 w-40 shrink-0 snap-start overflow-hidden rounded-[14px] bg-[#E3E2E6] shadow-[0_2px_8px_rgba(27,27,31,.08)]">
      <ProgressiveImage src={image} alt={title} fill sizes="160px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/[.72] via-black/[.15] to-transparent" />
      <span className="absolute inset-x-3 bottom-3 text-white"><strong className="block text-[20px] font-semibold tracking-[-.03em]">{title}</strong><small className="mt-1 block text-[10px] font-medium text-white/85">{detail}</small></span>
    </Link>
  );
}

function ExploreRecommendationCard({ property, saved, isMyanmar, tx, priority, onToggleSaved, onOpen }: { property: Property; saved: boolean; isMyanmar: boolean; tx: ExploreLandingProps["tx"]; priority: boolean; onToggleSaved: (property: Property) => void; onOpen: (propertyId: string) => void }) {
  const price = formatPropertyPrice(property, isMyanmar ? "my" : "en");
  const secondaryPrice = formatPropertyPrice(property, isMyanmar ? "en" : "my");

  return (
    <article className="overflow-hidden rounded-[14px] bg-white shadow-[0_4px_20px_rgba(0,0,0,.045)] transition-transform active:scale-[.99]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E3E2E6]">
        <Link href={`/properties/${property.id}`} onClick={() => onOpen(property.id)} className="absolute inset-0 z-10" aria-label={tx(`View ${property.title}`, `${property.title} ကိုကြည့်ရန်`)} />
        <ProgressiveImage src={property.images[0]} alt={property.title} fill priority={priority} sizes="(max-width: 800px) calc(100vw - 32px), 712px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 z-20 inline-flex h-7 items-center gap-1.5 rounded-full bg-white/90 px-2.5 text-[10px] font-semibold text-[#059669] shadow-sm backdrop-blur-md"><Check className="size-3.5" strokeWidth={3} />{property.verification_status === "verified" ? tx("Verified", "စိစစ်ပြီး") : tx("New listing", "အိမ်သစ်")}</span>
        <button type="button" onClick={() => onToggleSaved(property)} aria-label={saved ? tx(`Remove ${property.title} from saved homes`, `${property.title} ကို သိမ်းထားမှုမှဖယ်ရန်`) : tx(`Save ${property.title}`, `${property.title} ကို သိမ်းရန်`)} aria-pressed={saved} className={cn("absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-white/85 shadow-sm backdrop-blur-md transition-transform active:scale-95", saved ? "text-[#BA1A1A]" : "text-[#424655]")}><Heart className={cn("size-5", saved && "fill-current")} /></button>
        {property.images.length > 1 && <span className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5" aria-hidden="true">{property.images.slice(0, 3).map((_, index) => <i key={index} className={cn("size-2 rounded-full shadow-sm", index === 0 ? "bg-white" : "bg-white/50")} />)}</span>}
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[22px] font-semibold leading-7 tracking-[-.035em] text-[#1B1B1F] sm:text-[24px]">{price}<span className="ml-2 text-[13px] font-normal tracking-normal text-[#6B7280]">/ {secondaryPrice}</span></p>
        <Link href={`/properties/${property.id}`} onClick={() => onOpen(property.id)} className="mt-1.5 block"><h3 className="truncate text-[16px] leading-6 text-[#424655] transition-colors hover:text-[#0053D2] sm:text-[17px]">{property.title}</h3></Link>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280]"><MapPin className="size-4 text-[#424655]" />{property.township}, {property.city}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[#424655]">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium"><BedDouble className="size-[18px]" />{property.bedrooms} {property.bedrooms === 1 ? tx("Bed", "အိပ်ခန်း") : tx("Beds", "အိပ်ခန်း")}</span>
          <i className="size-[3px] rounded-full bg-[#727687]" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium"><Bath className="size-[18px]" />{property.bathrooms} {property.bathrooms === 1 ? tx("Bath", "ရေချိုးခန်း") : tx("Baths", "ရေချိုးခန်း")}</span>
          <i className="size-[3px] rounded-full bg-[#727687]" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium"><Maximize2 className="size-[17px]" />{property.area_sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </article>
  );
}

function formatFilterPrice(amount: number) {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  return `${amount / 1_000}K`;
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

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <button type="button" onClick={onRemove} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-[#C8D6E5] bg-[#F3F6F9] pl-3.5 pr-3 text-[10px] font-semibold text-[#123B73]" aria-label={`Remove ${label} filter`}>{label}<X className="size-3" /></button>;
}

function QuickFilterChip({ selected, onClick, label, icon, selectedTone = "navy" }: { selected: boolean; onClick: () => void; label: string; icon?: React.ReactNode; selectedTone?: "navy" | "blue" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold transition-[background-color,border-color,color,box-shadow]",
        selected
          ? selectedTone === "blue"
            ? "border-a7-blue bg-a7-blue text-white shadow-[0_5px_14px_rgba(18,59,115,.18)]"
            : "border-a7-navy bg-a7-navy text-white shadow-[0_5px_14px_rgba(16,24,40,.15)]"
          : "border-[#DEDCD7] bg-[#F8FBFF]/75 text-[#5F6873] hover:border-[#B8C8DB] hover:text-a7-blue",
      )}
    >
      {icon}{label}
    </button>
  );
}

function FilterGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section><div className="mb-2.5"><h3 className="text-[12px] font-semibold text-a7-navy">{title}</h3>{description && <p className="mt-1 text-[9px] leading-4 text-[#7B837F]">{description}</p>}</div>{children}</section>;
}

function ChoiceButton({ selected, onClick, children, compact = false, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; compact?: boolean; className?: string }) {
  return <button type="button" onClick={onClick} className={cn("inline-flex items-center justify-center gap-1.5 rounded-[14px] border font-semibold transition-[background-color,border-color,color,box-shadow] duration-[var(--duration-base)]", compact ? "h-11 px-3 text-[10px]" : "h-12 px-4 text-[11px]", selected ? "border-a7-blue bg-a7-blue text-white shadow-[0_3px_10px_rgba(18,59,115,.16)]" : "border-[#D0DEF0] bg-[#F8FBFF] text-[#66716C] hover:border-[#B8C8DB] hover:text-a7-navy", className)}>{selected && <Check className="size-3.5" />}{children}</button>;
}

interface FilterControlsProps {
  location: string;
  purpose: "rent" | "sale";
  searchTab: PropertySearchTab;
  minPrice: number | null;
  maxPrice: number | null;
  propertyTypes: Property["property_type"][];
  bedrooms: number | null;
  bathrooms: number | null;
  tx: (english: string, myanmar: string) => string;
  focus: FilterFocus;
  onSearchTabChange: (value: PropertySearchTab) => void;
  onLocationChange: (value: string) => void;
  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;
  onPropertyTypeToggle: (value: Property["property_type"]) => void;
  onPropertyTypesClear: () => void;
  onBedroomsChange: (value: number | null) => void;
  onBathroomsChange: (value: number | null) => void;
}

function LocationPicker({ value, onChange, tx }: { value: string; onChange: (value: string) => void; tx: FilterControlsProps["tx"] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <label className="block"><span className="mb-1.5 block text-[10px] font-semibold text-a7-navy">{tx("City", "မြို့")}</span><span className="relative block"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-full border border-a7-line bg-[#F8FBFF] pl-3.5 pr-8 text-[10px] font-medium text-[#515D58] outline-none focus:border-a7-blue"><option value="All Myanmar">{tx("All cities", "မြို့အားလုံး")}</option>{searchLocations.filter((item) => item !== "All Myanmar").map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-a7-muted" /></span></label>
      <label className="block"><span className="mb-1.5 block text-[10px] font-semibold text-a7-navy">{tx("Country", "နိုင်ငံ")}</span><span className="relative block"><select value="Myanmar" disabled className="h-11 w-full appearance-none rounded-full border border-a7-line bg-[#F8FBFF] pl-3.5 pr-8 text-[10px] font-medium text-[#515D58] opacity-100 outline-none"><option>Myanmar</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-a7-muted" /></span></label>
    </div>
  );
}

function PriceRangeControl({ purpose, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, tx }: Pick<FilterControlsProps, "purpose" | "minPrice" | "maxPrice" | "onMinPriceChange" | "onMaxPriceChange" | "tx">) {
  const options = purpose === "rent" ? [200000, 300000, 500000, 800000, 1500000, 3000000, 5000000] : [50000000, 80000000, 120000000, 300000000, 500000000, 800000000, 1200000000];
  const minIndex = minPrice === null ? 0 : Math.max(0, options.indexOf(minPrice));
  const maxIndex = maxPrice === null ? options.length - 1 : Math.max(0, options.indexOf(maxPrice));
  const minPercent = (minIndex / (options.length - 1)) * 100;
  const maxPercent = (maxIndex / (options.length - 1)) * 100;
  const rangeClassName = "pointer-events-none absolute inset-x-0 top-2 h-5 w-full appearance-none bg-transparent outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-a7-blue [&::-moz-range-thumb]:shadow-sm [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-a7-blue [&::-webkit-slider-thumb]:shadow-sm";

  return (
    <div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-[17px] h-px bg-[#CDD3D9]" />
        <div className="absolute top-[16px] h-[3px] rounded-full bg-a7-blue" style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }} />
        <input type="range" min={0} max={options.length - 1} value={minIndex} onChange={(event) => { const next = Math.min(Number(event.target.value), maxIndex - 1); onMinPriceChange(next === 0 ? null : options[next]); }} className={rangeClassName} aria-label={tx("Minimum price", "အနည်းဆုံးဈေးနှုန်း")} />
        <input type="range" min={0} max={options.length - 1} value={maxIndex} onChange={(event) => { const next = Math.max(Number(event.target.value), minIndex + 1); onMaxPriceChange(next === options.length - 1 ? null : options[next]); }} className={rangeClassName} aria-label={tx("Maximum price", "အများဆုံးဈေးနှုန်း")} />
      </div>
      <div className="flex items-center justify-between text-[9px] font-medium text-[#667085]"><span>{minPrice === null ? formatFilterPrice(options[0]) : formatFilterPrice(minPrice)} MMK</span><span>{maxPrice === null ? formatFilterPrice(options.at(-1)!) : formatFilterPrice(maxPrice)} MMK</span></div>
    </div>
  );
}

function FilterControls({ location, purpose, searchTab, minPrice, maxPrice, propertyTypes, bedrooms, bathrooms, tx, focus, onSearchTabChange, onLocationChange, onMinPriceChange, onMaxPriceChange, onPropertyTypeToggle, onPropertyTypesClear, onBedroomsChange, onBathroomsChange }: FilterControlsProps) {
  const show = (section: Exclude<FilterFocus, "all">) => focus === "all" || focus === section;
  return (
    <div className="space-y-5">
      {focus === "all" && <FilterGroup title={tx("Purpose", "ရည်ရွယ်ချက်")}>
        <div role="tablist" aria-label={tx("Property purpose", "အိမ်ခြံမြေ ရည်ရွယ်ချက်")} className="grid grid-cols-3 gap-1 rounded-full border border-a7-line bg-[#F8FBFF] p-1">
          {([
            { id: "sale", label: tx("For Sale", "ရောင်းရန်") },
            { id: "rent", label: tx("For Rent", "ငှားရန်") },
            { id: "buy", label: tx("For Buy", "ဝယ်မည်") },
          ] as Array<{ id: PropertySearchTab; label: string }>).map((option) => <button key={option.id} type="button" role="tab" aria-selected={searchTab === option.id} onClick={() => onSearchTabChange(option.id)} className={cn("min-h-11 rounded-full px-2 text-[10px] font-semibold transition-[background-color,color,box-shadow]", searchTab === option.id ? "bg-a7-blue text-white shadow-[0_4px_12px_rgba(18,59,115,.2)]" : "text-a7-muted hover:bg-[#F8FBFF] hover:text-a7-navy")}>{option.label}</button>)}
        </div>
      </FilterGroup>}
      {show("location") && <LocationPicker value={location} onChange={onLocationChange} tx={tx} />}
      {show("type") && <FilterGroup title={tx("Select Category", "အမျိုးအစားရွေးရန်")}><div className="flex flex-wrap gap-2"><ChoiceButton selected={propertyTypes.length === 0} onClick={onPropertyTypesClear} compact>{tx("All property", "အားလုံး")}</ChoiceButton>{(["condo", "apartment", "house", "villa", "mini_condo"] as const).map((type) => <ChoiceButton key={type} selected={propertyTypes.includes(type)} onClick={() => onPropertyTypeToggle(type)} compact>{propertyTypeLabels[type]}</ChoiceButton>)}</div></FilterGroup>}
      {show("price") && <FilterGroup title={tx("Price Range", "ဈေးနှုန်းအပိုင်းအခြား")}><PriceRangeControl purpose={purpose} minPrice={minPrice} maxPrice={maxPrice} onMinPriceChange={onMinPriceChange} onMaxPriceChange={onMaxPriceChange} tx={tx} /></FilterGroup>}
      {show("beds") && <FilterGroup title={tx("Beds & baths", "အိပ်ခန်းနှင့် ရေချိုးခန်း")}><div className="grid grid-cols-2 gap-2"><label className="block"><span className="mb-1.5 block text-[9px] font-semibold text-[#68726D]">{tx("Bedrooms", "အိပ်ခန်း")}</span><select value={bedrooms ?? ""} onChange={(event) => onBedroomsChange(event.target.value ? Number(event.target.value) : null)} className="h-12 w-full rounded-[12px] border border-[#D0DEF0] bg-[#F8FBFF] px-3 text-[11px] font-semibold text-[#334155] outline-none focus:border-a7-blue"><option value="">{tx("Any rooms", "အခန်းမရွေး")}</option>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{tx(`${value}+ rooms`, `${value}+ ခန်း`)}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-[9px] font-semibold text-[#68726D]">{tx("Bathrooms", "ရေချိုးခန်း")}</span><select value={bathrooms ?? ""} onChange={(event) => onBathroomsChange(event.target.value ? Number(event.target.value) : null)} className="h-12 w-full rounded-[12px] border border-[#D0DEF0] bg-[#F8FBFF] px-3 text-[11px] font-semibold text-[#334155] outline-none focus:border-a7-blue"><option value="">{tx("Any baths", "ရေချိုးခန်းမရွေး")}</option>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{tx(`${value}+ baths`, `${value}+ ခန်း`)}</option>)}</select></label></div></FilterGroup>}
    </div>
  );
}

export { MobilePropertySearch };

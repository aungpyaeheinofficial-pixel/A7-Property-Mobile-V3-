"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { PropertyCard, PropertyCardEmpty } from "@/components/property/property-card";
import { PropertyMap } from "@/components/property/property-map";
import { FilterPanel } from "@/components/search/filter-panel";
import { SearchToolbar } from "@/components/search/search-toolbar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  countActiveFilters,
  defaultSearchFilters,
  filterProperties,
  sortProperties,
  type Property,
  type PropertySort,
  type SearchFilters,
} from "@/lib/properties";
import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { cn } from "@/lib/utils";

function PropertySearch({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const initialPurpose = searchParams.get("purpose") === "sale" ? "sale" : "rent";
  const initialLocation = searchParams.get("location") ?? "All Myanmar";
  const initialType = searchParams.get("type") as Property["property_type"] | null;
  const initialMaxPrice = Number(searchParams.get("maxPrice"));
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultSearchFilters,
    purpose: initialPurpose,
    location: initialLocation,
    propertyTypes: initialType ? [initialType] : [],
    maxPrice: Number.isFinite(initialMaxPrice) && initialMaxPrice > 0 ? initialMaxPrice : null,
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [sort, setSort] = useState<PropertySort>("recommended");
  const [mapOpen, setMapOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const stored = readStoredIds(STORAGE_KEYS.saved, STORAGE_KEYS.legacySaved);
    if (stored.length) queueMicrotask(() => setSaved(stored));
  }, []);

  const results = useMemo(() => sortProperties(filterProperties(properties, filters), sort), [properties, filters, sort]);

  function toggleSaved(id: string) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeStoredIds(STORAGE_KEYS.saved, next);
      return next;
    });
  }

  function openMobileFilters() {
    setDraftFilters(filters);
    setFilterOpen(true);
  }

  function applyMobileFilters() {
    setFilters(draftFilters);
    setFilterOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AppHeader compact />
      <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5 rounded-[20px] border border-[#0b3768]/8 bg-white p-4 shadow-sm lg:hidden">
          <label className="block"><span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-wider text-[#728396]">Where do you want to live?</span><select className="h-11 w-full rounded-xl bg-[#edf3f8] px-3 text-sm font-semibold outline-none" value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })}><option>All Myanmar</option><option>Yangon</option><option>Bahan</option><option>Kamayut</option><option>Yankin</option><option>Sanchaung</option><option>Hlaing</option><option>Mayangone</option><option>Mandalay</option></select></label>
        </div>
        <div className="grid gap-7 lg:grid-cols-[285px_minmax(0,1fr)] xl:gap-9">
          <aside className="hidden lg:block">
            <div className="sticky top-[88px] max-h-[calc(100vh-110px)] overflow-y-auto rounded-[20px] border border-[#0b3768]/8 bg-white p-5 shadow-[0_7px_28px_rgba(11,55,104,.05)]">
              <FilterPanel value={filters} onChange={setFilters} />
            </div>
          </aside>

          <section className="min-w-0">
            <SearchToolbar count={results.length} location={filters.location} sort={sort} onSortChange={setSort} mapOpen={mapOpen} onMapToggle={() => setMapOpen((value) => !value)} activeFilters={countActiveFilters(filters)} onOpenFilters={openMobileFilters} />
            {results.length === 0 ? (
              <div className="mx-auto mt-10 max-w-sm"><PropertyCardEmpty onAction={() => setFilters(defaultSearchFilters)} /></div>
            ) : mapOpen ? (
              <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(320px,.78fr)_minmax(470px,1.22fr)]">
                <div className="grid gap-4 xl:max-h-[calc(100vh-170px)] xl:overflow-y-auto xl:pr-2">
                  {results.slice(0, 12).map((property) => <div key={property.id} className={cn("rounded-[22px] transition-shadow", selectedId === property.id && "ring-3 ring-[#47bbea]/30")}><PropertyCard property={property} href={`/properties/${property.id}`} isFavorite={saved.includes(property.id)} onFavoriteToggle={(item) => toggleSaved(item.id)} /></div>)}
                </div>
                <PropertyMap className="sticky top-[88px] h-[calc(100vh-112px)]" properties={results} selectedId={selectedId} onSelect={setSelectedId} />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {results.slice(0, 24).map((property) => <PropertyCard key={property.id} property={property} href={`/properties/${property.id}`} isFavorite={saved.includes(property.id)} onFavoriteToggle={(item) => toggleSaved(item.id)} />)}
              </div>
            )}
            {results.length > 24 && !mapOpen && <div className="mt-8 flex justify-center"><Button variant="outline">Load more homes</Button></div>}
          </section>
        </div>
      </main>

      <Sheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter homes"
        description={`${results.length} homes match your current search`}
        side="bottom"
        footer={<div className="grid grid-cols-[1fr_1.4fr] gap-2"><Button variant="outline" onClick={() => setDraftFilters(defaultSearchFilters)}>Clear all</Button><Button onClick={applyMobileFilters}>Show homes</Button></div>}
      >
        <FilterPanel className="p-5 pb-8" value={draftFilters} onChange={setDraftFilters} />
      </Sheet>
    </div>
  );
}

export { PropertySearch };

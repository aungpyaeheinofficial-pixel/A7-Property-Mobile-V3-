"use client";

import { CarFront, Check, RotateCcw } from "lucide-react";

import {
  defaultSearchFilters,
  furnitureLabels,
  propertyTypeLabels,
  searchLocations,
  type Property,
  type SearchFilters,
} from "@/lib/properties";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  value: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  className?: string;
}

const rentalPrices = [null, 300000, 500000, 800000, 1500000];
const salePrices = [null, 100000000, 200000000, 500000000, 800000000];

function formatOption(value: number | null) {
  if (value === null) return "Any price";
  if (value >= 1_000_000) return `${value / 1_000_000}M MMK`;
  return `${new Intl.NumberFormat("en-US").format(value)} MMK`;
}

function FilterPanel({ value, onChange, className }: FilterPanelProps) {
  const priceOptions = value.purpose === "sale" ? salePrices : rentalPrices;
  const set = <K extends keyof SearchFilters>(key: K, next: SearchFilters[K]) => onChange({ ...value, [key]: next });
  const togglePropertyType = (type: Property["property_type"]) => {
    const next = value.propertyTypes.includes(type) ? value.propertyTypes.filter((item) => item !== type) : [...value.propertyTypes, type];
    set("propertyTypes", next);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <button className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#006AFF]" onClick={() => onChange(defaultSearchFilters)}><RotateCcw className="size-3.5" />Reset</button>
      </div>

      <fieldset>
        <legend className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6B7078]">Looking to</legend>
        <div className="grid grid-cols-2 rounded-xl bg-[#E8E8EB] p-1">
          {(["rent", "sale"] as const).map((purpose) => <button key={purpose} className={cn("h-9 rounded-[9px] text-xs font-semibold capitalize transition-all", value.purpose === purpose ? "bg-white text-[#006AFF] shadow-sm" : "text-[#6B7078]")} onClick={() => onChange({ ...value, purpose, minPrice: null, maxPrice: null })}>{purpose === "sale" ? "Buy" : "Rent"}</button>)}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6B7078]">Location</span>
        <select className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-3 text-xs outline-none focus:border-[#006AFF] focus:ring-3 focus:ring-[#006AFF]/10" value={value.location} onChange={(event) => set("location", event.target.value)}>
          {searchLocations.map((location) => <option key={location}>{location}</option>)}
        </select>
      </label>

      <fieldset>
        <legend className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6B7078]">Price range</legend>
        <div className="grid grid-cols-2 gap-2">
          <label><span className="sr-only">Minimum price</span><select className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-2.5 text-[11px] outline-none focus:border-[#006AFF]" value={value.minPrice ?? ""} onChange={(event) => set("minPrice", event.target.value ? Number(event.target.value) : null)}>{priceOptions.map((price) => <option key={`min-${price}`} value={price ?? ""}>{price === null ? "Min price" : formatOption(price)}</option>)}</select></label>
          <label><span className="sr-only">Maximum price</span><select className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-2.5 text-[11px] outline-none focus:border-[#006AFF]" value={value.maxPrice ?? ""} onChange={(event) => set("maxPrice", event.target.value ? Number(event.target.value) : null)}>{priceOptions.map((price) => <option key={`max-${price}`} value={price ?? ""}>{price === null ? "Max price" : formatOption(price)}</option>)}</select></label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6B7078]">Property type</legend>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(propertyTypeLabels) as Array<[Property["property_type"], string]>).map(([type, label]) => {
            const selected = value.propertyTypes.includes(type);
            return <button key={type} className={cn("flex min-h-10 items-center justify-between rounded-xl border px-3 text-left text-[11px] font-medium transition-colors", selected ? "border-[#006AFF] bg-[#F6F8FC] text-[#006AFF]" : "border-[#2A2A33]/10 bg-white text-[#59616A]")} onClick={() => togglePropertyType(type)}>{label}{selected && <Check className="size-3.5" />}</button>;
          })}
        </div>
      </fieldset>

      {(["bedrooms", "bathrooms"] as const).map((field) => (
        <fieldset key={field}>
          <legend className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6B7078]">{field === "bedrooms" ? "Bedrooms" : "Bathrooms"}</legend>
          <div className="grid grid-cols-5 gap-1.5">
            {[null, 1, 2, 3, 4].map((count) => <button key={`${field}-${count}`} className={cn("h-9 rounded-[10px] border text-[11px] font-semibold", value[field] === count ? "border-[#006AFF] bg-[#006AFF] text-white" : "border-[#2A2A33]/10 bg-white text-[#59616A]")} onClick={() => set(field, count)}>{count === null ? "Any" : count === 4 ? "4+" : count}</button>)}
          </div>
        </fieldset>
      ))}

      <label className="block">
        <span className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6B7078]">Furniture</span>
        <select className="h-11 w-full rounded-xl border border-[#2A2A33]/12 bg-white px-3 text-xs outline-none focus:border-[#006AFF]" value={value.furniture} onChange={(event) => set("furniture", event.target.value as SearchFilters["furniture"])}>
          <option value="all">Any furniture</option>
          {(Object.entries(furnitureLabels) as Array<[Property["furniture"], string]>).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#2A2A33]/10 bg-white p-3">
        <span className="flex items-center gap-2 text-xs font-medium"><CarFront className="size-[18px] text-[#006AFF]" />Parking required</span>
        <input type="checkbox" className="size-4 accent-[#006AFF]" checked={value.parking} onChange={(event) => set("parking", event.target.checked)} />
      </label>
    </div>
  );
}

export { FilterPanel };

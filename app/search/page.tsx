import type { Metadata } from "next";

import { PropertySearch } from "@/components/search/property-search";
import { allProperties } from "@/lib/properties";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Search verified homes in Myanmar | A7 Property",
  description: "Filter verified Myanmar properties by location, price, home type, bedrooms, furniture and parking. Explore list and map views.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const purpose = params.purpose === "sale" ? "sale" : "rent";
  const location = typeof params.location === "string" ? params.location : "All Myanmar";
  const journey = params.journey === "sell" ? "sell" : purpose === "sale" ? "buy" : "rent";

  return <PropertySearch key={`${journey}:${purpose}:${location}`} properties={allProperties} />;
}

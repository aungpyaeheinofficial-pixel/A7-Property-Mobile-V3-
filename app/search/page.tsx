import type { Metadata } from "next";

import { PropertySearch } from "@/components/search/property-search";
import { allProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Search verified homes in Myanmar | Eain",
  description: "Filter verified Myanmar properties by location, price, home type, bedrooms, furniture and parking. Explore list and map views.",
};

export default function SearchPage() {
  return <PropertySearch properties={allProperties} />;
}

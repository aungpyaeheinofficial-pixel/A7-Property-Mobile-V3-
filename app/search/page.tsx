import type { Metadata } from "next";

import { MobilePropertySearch } from "@/components/mobile/mobile-property-search";
import { allProperties } from "@/lib/properties";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Explore homes in Myanmar | A7 Property",
  description: "Discover verified homes across Myanmar by location, price, and property type.",
  openGraph: {
    title: "Explore Homes | A7 Property",
    description: "Discover verified homes across Myanmar by location, price, and property type.",
    images: [{ url: "/og-explore-homes.png", width: 1734, height: 907, alt: "A7 Property Explore Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Homes | A7 Property",
    description: "Discover verified homes across Myanmar by location, price, and property type.",
    images: ["/og-explore-homes.png"],
  },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const purpose = params.purpose === "sale" ? "sale" : "rent";
  const location = typeof params.location === "string" ? params.location : "All Myanmar";
  const journey = params.journey === "sell" ? "sell" : purpose === "sale" ? "buy" : "rent";

  return <MobilePropertySearch key={`${journey}:${purpose}:${location}`} properties={allProperties} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PropertyDetailView } from "@/components/property/property-detail-view";
import { allProperties, formatPropertyPrice, getProperty } from "@/lib/properties";

type RouteProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return allProperties.map((property) => ({ id: property.id }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) return { title: "Property not found | A7 Property" };
  return {
    title: `${property.title} | A7 Property`,
    description: `${formatPropertyPrice(property)} · ${property.bedrooms} bedrooms · ${property.area_sqft} sqft in ${property.township}, ${property.city}. Verified on A7 Property.`,
    openGraph: { images: [{ url: property.images[0], alt: property.title }] },
  };
}

export default async function PropertyDetailPage({ params }: RouteProps) {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) notFound();
  return <PropertyDetailView property={property} />;
}

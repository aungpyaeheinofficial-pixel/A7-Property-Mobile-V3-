import type { Metadata } from "next";

import { PropertyComparison } from "@/components/compare/property-comparison";

export const metadata: Metadata = {
  title: "Compare homes | A7 Property",
  description: "Compare verified Myanmar homes side by side by price, space, features and trust signals.",
  robots: { index: false, follow: false },
};

export default function ComparePage() {
  return <PropertyComparison />;
}

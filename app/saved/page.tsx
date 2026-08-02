import type { Metadata } from "next";

import { SavedJourney } from "@/components/mobile/saved-journey";

export const metadata: Metadata = {
  title: "Saved homes | A7 Property",
  description: "Your personal shortlist, saved searches, price alerts, and recommendations.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedJourney />;
}

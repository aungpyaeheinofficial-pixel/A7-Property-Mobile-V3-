import type { Metadata } from "next";

import { PropertyConsultant } from "@/components/assistant/property-consultant";

export const metadata: Metadata = { title: "AI home assistant | Eain", description: "Describe the Myanmar home you need and get explainable, verified property recommendations and comparisons." };

export default function AssistantPage() { return <PropertyConsultant />; }

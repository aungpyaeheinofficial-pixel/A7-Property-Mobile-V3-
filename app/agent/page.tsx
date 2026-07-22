import type { Metadata } from "next";

import { PropertyCRM } from "@/components/dashboard/property-crm";

export const metadata: Metadata = { title: "Agent workspace | A7 Property", description: "Professional Myanmar property CRM for inventory, leads, analytics and verification.", robots: { index: false, follow: false } };

export default function AgentPage() { return <PropertyCRM role="agent" />; }

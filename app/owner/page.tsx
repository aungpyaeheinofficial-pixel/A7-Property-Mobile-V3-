import type { Metadata } from "next";

import { PropertyCRM } from "@/components/dashboard/property-crm";

export const metadata: Metadata = { title: "Owner dashboard | Eain", description: "Manage property listings, inquiries, pricing, analytics and verification.", robots: { index: false, follow: false } };

export default function OwnerPage() { return <PropertyCRM role="owner" />; }

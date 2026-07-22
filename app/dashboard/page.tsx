import type { Metadata } from "next";

import { UserDashboard } from "@/components/dashboard/user-dashboard";

export const metadata: Metadata = { title: "My A7 Property dashboard", description: "Manage saved properties, messages and viewing appointments on A7 Property.", robots: { index: false, follow: false } };

export default function DashboardPage() { return <UserDashboard />; }

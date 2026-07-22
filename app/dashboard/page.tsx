import type { Metadata } from "next";

import { UserDashboard } from "@/components/dashboard/user-dashboard";

export const metadata: Metadata = { title: "My Eain dashboard", description: "Manage saved properties, messages and viewing appointments on Eain.", robots: { index: false, follow: false } };

export default function DashboardPage() { return <UserDashboard />; }

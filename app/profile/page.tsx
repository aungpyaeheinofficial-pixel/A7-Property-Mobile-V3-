import type { Metadata } from "next";

import { UserProfile } from "@/components/profile/user-profile";

export const metadata: Metadata = {
  title: "My profile | A7 Property",
  description: "Manage your personal home journey, verification, preferences, saved searches, and account settings.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <UserProfile />;
}

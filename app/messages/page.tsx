import type { Metadata } from "next";

import { MessagesExperience } from "@/components/mobile/messages-experience";

export const metadata: Metadata = {
  title: "Messages | A7 Property",
  description: "Chat with verified property owners and agents, and manage viewing requests.",
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return <MessagesExperience />;
}

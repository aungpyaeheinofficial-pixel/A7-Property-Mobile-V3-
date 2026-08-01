import { InformationPage } from "@/components/content/information-page";

export default function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="A7 Property privacy"
      title="Your home search should stay personal."
      intro="This policy explains what information A7 uses to power saved homes, recommendations, messages, and viewing requests."
      sections={[
        { title: "Information you choose to share", body: "Your profile, preferences, saved searches, messages, and viewing requests help personalize the experience.", points: ["Contact details remain private until you choose to share them.", "Saved homes and preferences support more relevant recommendations.", "Safety reports are handled separately from marketplace activity."] },
        { title: "How your information is used", body: "A7 uses account information to provide requested features, protect marketplace trust, and improve property discovery." },
        { title: "Your controls", body: "Profile settings let you manage notifications, language, communication permission, data export, and account-deletion requests." },
        { title: "Local preview data", body: "In the current local frontend, saved homes and preferences are stored on this device. Clearing browser data removes that local information." },
      ]}
    />
  );
}

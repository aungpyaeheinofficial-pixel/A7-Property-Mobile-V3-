import { InformationPage } from "@/components/content/information-page";

export default function HelpPage() {
  return (
    <InformationPage
      eyebrow="A7 Property help center"
      title="Help for every step toward home."
      intro="Quick guidance for searching, saving, contacting owners, arranging viewings, and keeping your account safe."
      helpMode
      updated="Available throughout your local A7 experience"
      sections={[
        { title: "Search and filters", body: "Choose Rent, Buy, or Sell from navigation, enter a township or landmark, then refine by price, home type, bedrooms, bathrooms, and verification." },
        { title: "Saved homes", body: "Use the heart button on any property card or detail page. Your saved count updates immediately and your shortlist appears in My Home Journey." },
        { title: "Messages and viewings", body: "Open a property, contact its owner, or request a viewing. New requests appear in your dashboard conversations and upcoming viewings." },
        { title: "Safety", body: "Never feel pressured to pay before verifying the property and agreement. Report concerns from Profile → Help → Report a safety concern." },
      ]}
    />
  );
}

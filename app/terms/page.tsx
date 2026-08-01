import { InformationPage } from "@/components/content/information-page";

export default function TermsPage() {
  return (
    <InformationPage
      eyebrow="A7 Property legal"
      title="Terms designed for a fair home journey."
      intro="These terms explain how home seekers, owners, and agents can use A7 Property responsibly."
      sections={[
        { title: "Using A7 Property", body: "Use accurate information, respect other people, and use the marketplace only for genuine property journeys.", points: ["Do not impersonate another person.", "Do not post misleading prices or unavailable homes.", "Keep conversations respectful and property-focused."] },
        { title: "Listings and verification", body: "Verification improves trust but does not replace your own inspection, legal review, or ownership checks before making a payment." },
        { title: "Payments and agreements", body: "A7 Property does not ask home seekers to transfer deposits inside this frontend experience. Any agreement should be reviewed carefully and documented." },
        { title: "Account safety", body: "You are responsible for keeping your sign-in details private and reporting suspicious activity quickly through the Help Center." },
      ]}
    />
  );
}

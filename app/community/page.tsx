import { InformationPage } from "@/components/content/information-page";

export default function CommunityPage() {
  return (
    <InformationPage
      eyebrow="A7 Property community"
      title="Homes deserve honest, respectful conversations."
      intro="Our standards help home seekers, owners, and agents feel safe while discovering and sharing property."
      sections={[
        { title: "Be truthful", body: "Photos, prices, availability, ownership details, and property facts should be current and accurate." },
        { title: "Be respectful", body: "Harassment, discrimination, intimidation, and pressure tactics are not allowed on A7 Property." },
        { title: "Protect each other", body: "Do not request unnecessary personal information. Meet in safe locations and report suspicious behavior." },
        { title: "Build trust", body: "Respond clearly, keep appointments, and update listings promptly when circumstances change." },
      ]}
    />
  );
}

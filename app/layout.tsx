import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/noto-sans-myanmar/400.css";
import "@fontsource/noto-sans-myanmar/600.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "eain-home.pages.dev";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "A7 Property — Find a place you can call home";
  const description = "Discover verified homes to rent and buy across Myanmar with A7 Property.";

  return {
    metadataBase: baseUrl,
    title,
    description,
    icons: { icon: "/images/brand/a7-property-logo.jpg", shortcut: "/images/brand/a7-property-logo.jpg" },
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: new URL("/og-a7-property-1200x630.png", baseUrl).toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og-a7-property-1200x630.png", baseUrl).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

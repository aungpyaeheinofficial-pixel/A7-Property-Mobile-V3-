import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/noto-sans-myanmar/400.css";
import "@fontsource/noto-sans-myanmar/500.css";
import "@fontsource/noto-sans-myanmar/600.css";
import "leaflet/dist/leaflet.css";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ComparisonTray } from "@/components/compare/comparison-tray";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";


export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "eain-home.pages.dev";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "A7 Property — Find a place you can call home";
  const description = "Find beautiful, thoughtfully verified homes to rent and buy across Myanmar.";

  return {
    metadataBase: baseUrl,
    title,
    description,
    icons: { icon: "/images/brand/a7-property-logo.jpg", shortcut: "/images/brand/a7-property-logo.jpg" },
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: new URL("/og.png", baseUrl).toString(), width: 1731, height: 909, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", baseUrl).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body>
        <a href="#main-content" className="fixed left-4 top-3 z-[200] -translate-y-24 rounded-[12px] bg-a7-navy px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0">Skip to main content</a>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <div id="main-content" tabIndex={-1}>{children}</div>
              <ComparisonTray />
              <MobileBottomNav />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

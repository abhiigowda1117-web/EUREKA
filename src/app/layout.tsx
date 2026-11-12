import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "FORGE — Where Talent Meets Opportunity", template: "%s · FORGE" },
  description:
    "FORGE is a student-focused freelance marketplace. Post projects, discover talented students and freelancers, and turn your skills into real-world opportunities.",
  openGraph: { siteName: "FORGE", type: "website", locale: "en_IN" },
};

// Every page shows the logged-in user in the header, so render per request.
// (Simple and correct for the MVP; revisit with Cache Components later.)
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#070b14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

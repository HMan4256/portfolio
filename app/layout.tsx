import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import { getRoute } from "@/lib/locale";
import { siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const pixelify = localFont({
  src: "./PixelifySans.ttf",
  variable: "--font-pixelify",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteName,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const route = await getRoute();
  return (
    <html lang={route.locale} className={pixelify.variable}>
      <body>
        <SiteShell initialRoute={route}>{children}</SiteShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { PageMotion } from "@/components/page-motion";
import { getCopy, getLocale } from "@/lib/locale";
import { LanguageSwitcher } from "@/components/language-switcher";
import "./globals.css";

const pixelify = localFont({
  src: "./PixelifySans.ttf",
  variable: "--font-pixelify",
  weight: "400 700",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return {
    title: { default: "HMan", template: "%s | HMan" },
    description: copy.description,
    icons: { icon: "/pixel/cat.png" },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const copy = await getCopy();
  return (
    <html lang={locale} className={pixelify.variable}>
      <body>
        <LanguageSwitcher locale={locale} label={copy.language} />
        <PageMotion>{children}</PageMotion>
      </body>
    </html>
  );
}

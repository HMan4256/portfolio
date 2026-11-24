import type { Metadata } from "next";
import { languages, type Locale } from "./translations";
import { localizedPath, type PagePath } from "./routes";

export const siteUrl = new URL(process.env.SITE_URL?.trim() || "https://www.fancyweb.top");
export const siteName = "HMan";
export const locales = Object.keys(languages) as Locale[];

const socialLocales: Record<Locale, string> = { en: "en_US", cs: "cs_CZ", de: "de_DE" };
const imageAlt: Record<Locale, string> = {
  en: "HMan’s portfolio title card with a pixel-art cat and the words Software, Graphics, and Hardware.",
  cs: "Titulní obrázek HManova portfolia s pixelovou kočkou a nápisem Software, Graphics, Hardware.",
  de: "Titelbild von HMans Portfolio mit einer Pixelkatze und dem Schriftzug Software, Graphics, Hardware.",
};

export const seoCopy = {
  en: {
    "/snake": { title: "Snake | HMan", description: "Play HMan’s pixel arcade Snake with a keyboard, swipes, or on-screen buttons." },
    "/": {
      title: "HMan | Software, Design & Hardware Portfolio",
      description: "Explore HMan’s personal portfolio of software, graphic design, and hardware. Browse recent GitHub projects and get in touch to collaborate.",
    },
    "/about": {
      title: "About HMan | Software, Graphics & Hardware",
      description: "Get to know HMan, a creator working across web and mobile apps, UI/UX design, graphic design, PCB design, and microcontroller programming.",
    },
    "/projects": {
      title: "HMan’s Projects | Latest GitHub Repositories",
      description: "Browse HMan’s latest public GitHub projects. Read what each repository does, see its stars, and explore the source code.",
    },
    "/contact": {
      title: "Contact HMan | Projects & Collaborations",
      description: "Have a project or collaboration in mind? Find HMan on Telegram, Instagram, or GitHub, or support the work through Buy Me a Coffee.",
    },
  },
  cs: {
    "/snake": { title: "Had | HMan", description: "Zahraj si pixelového Hada na klávesnici, gesty nebo tlačítky na obrazovce." },
    "/": {
      title: "HMan | Portfolio softwaru, grafiky a hardwaru",
      description: "HManovo osobní portfolio se softwarem, grafikou a hardwarem. Mrkni na nejnovější projekty na GitHubu nebo se ozvi kvůli spolupráci.",
    },
    "/about": {
      title: "O HManovi | Software, grafika a hardware",
      description: "Seznam se s HManem. Tvoří weby a mobilní appky, věnuje se UI/UX designu, grafice, návrhu PCB a programování MCU.",
    },
    "/projects": {
      title: "HManovy projekty | Nejnovější repozitáře na GitHubu",
      description: "Prozkoumej nejnovější veřejné projekty od HMana na GitHubu. Přečti si, co jednotlivé repozitáře dělají, a mrkni do zdrojového kódu.",
    },
    "/contact": {
      title: "Kontakt na HMana | Projekty a spolupráce",
      description: "Máš nápad na projekt nebo spolupráci? Najdi HMana na Telegramu, Instagramu nebo GitHubu, případně ho podpoř přes Buy Me a Coffee.",
    },
  },
  de: {
    "/snake": { title: "Snake | HMan", description: "Spiel HMans Pixel-Snake per Tastatur, Wischgeste oder Bildschirmtasten." },
    "/": {
      title: "HMan | Portfolio für Software, Grafik und Hardware",
      description: "Entdecke HMans persönliches Portfolio für Software, Grafikdesign und Hardware. Schau dir aktuelle GitHub-Projekte an oder melde dich für eine Zusammenarbeit.",
    },
    "/about": {
      title: "Über HMan | Software, Grafik und Hardware",
      description: "Lerne HMan kennen. Er entwickelt Web- und Mobil-Apps und arbeitet an UI/UX-Design, Grafik, PCB-Design und MCU-Programmierung.",
    },
    "/projects": {
      title: "HMans Projekte | Aktuelle GitHub-Repositories",
      description: "Entdecke HMans aktuelle öffentliche GitHub-Projekte. Lies die Projektbeschreibungen, sieh dir die Sterne an und erkunde den Quellcode.",
    },
    "/contact": {
      title: "Kontakt zu HMan | Projekte und Zusammenarbeit",
      description: "Du hast eine Projektidee? Erreiche HMan über Telegram, Instagram oder GitHub oder unterstütze seine Arbeit auf Buy Me a Coffee.",
    },
  },
} satisfies Record<Locale, Record<PagePath, { title: string; description: string }>>;

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).href;
}

export function alternateLanguages(page: PagePath) {
  return {
    en: absoluteUrl(localizedPath("en", page)),
    cs: absoluteUrl(localizedPath("cs", page)),
    de: absoluteUrl(localizedPath("de", page)),
    "x-default": absoluteUrl(localizedPath("en", page)),
  };
}

export function pageMetadata(locale: Locale, page: PagePath): Metadata {
  const { title, description } = seoCopy[locale][page];
  const url = absoluteUrl(localizedPath(locale, page));
  const image = {
    url: absoluteUrl("/social/portfolio.png"),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: imageAlt[locale],
  };

  return {
    title,
    description,
    alternates: { canonical: url, languages: alternateLanguages(page) },
    openGraph: {
      type: page === "/about" ? "profile" : "website",
      siteName,
      title,
      description,
      url,
      locale: socialLocales[locale],
      alternateLocale: locales.filter(language => language !== locale).map(language => socialLocales[language]),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

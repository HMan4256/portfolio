import { cache } from "react";
import { cookies, headers } from "next/headers";
import { isLocale, translations, type Locale } from "./translations";

export const languageCookie = "hman-language";

function browserLocale(header: string): Locale {
  const preferences = header.toLowerCase().split(",").map(entry => {
    const [tag, weight] = entry.trim().split(/\s*;\s*q\s*=\s*/);
    return { language: tag.split("-")[0], quality: weight === undefined ? 1 : Number(weight) };
  }).filter(({ quality }) => quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality);

  for (const { language } of preferences) {
    if (isLocale(language)) return language;
  }
  return "en";
}

export const getLocale = cache(async (): Promise<Locale> => {
  const saved = (await cookies()).get(languageCookie)?.value;
  if (isLocale(saved)) return saved;

  const request = await headers();
  const country = (request.get("cf-ipcountry") || request.get("x-vercel-ip-country"))?.toUpperCase();
  if (country === "CZ") return "cs";
  if (country === "DE" || country === "AT" || country === "LI") return "de";
  return browserLocale(request.get("accept-language") ?? "");
});

export async function getCopy() {
  return translations[await getLocale()];
}

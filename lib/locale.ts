import { cache } from "react";
import { headers } from "next/headers";
import { parseLocalizedPath, type LocalizedRoute } from "./routes";
import { translations } from "./translations";

export const getRoute = cache(async (): Promise<LocalizedRoute> => {
  const path = (await headers()).get("x-hman-route") ?? "";
  return parseLocalizedPath(path) ?? { locale: "en", page: "/" };
});

export async function getLocale() {
  return (await getRoute()).locale;
}

export async function getCopy() {
  return translations[await getLocale()];
}

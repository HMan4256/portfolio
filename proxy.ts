import { NextResponse, type NextRequest } from "next/server";
import { isPagePath, languageCookie, legacyLanguageCookie, localizedPath, parseLocalizedPath } from "@/lib/routes";
import { isLocale, type Locale } from "@/lib/translations";

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(languageCookie)?.value ?? request.cookies.get(legacyLanguageCookie)?.value;
  if (isLocale(saved)) return saved;

  const country = (request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country"))?.toUpperCase();
  if (country === "CZ") return "cs";
  if (country === "DE" || country === "AT" || country === "LI") return "de";

  const languages = (request.headers.get("accept-language") ?? "").toLowerCase().split(",").map(entry => {
    const [tag, weight] = entry.trim().split(/\s*;\s*q\s*=\s*/);
    return { language: tag.split("-")[0], quality: weight === undefined ? 1 : Number(weight) };
  }).filter(({ quality }) => quality > 0 && quality <= 1).sort((a, b) => b.quality - a.quality);
  for (const { language } of languages) {
    if (isLocale(language)) return language;
  }
  return "en";
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const route = parseLocalizedPath(path);
  const url = request.nextUrl.clone();
  if (route) {
    url.pathname = route.page;
    // Distinguish the translated server payloads in the client router cache.
    url.searchParams.set("lang", route.locale);
    const headers = new Headers(request.headers);
    headers.set("x-hman-route", localizedPath(route.locale, route.page));
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (isPagePath(path)) {
    url.pathname = localizedPath(preferredLocale(request), path);
    // Each unprefixed URL is an entry point whose destination depends on the visitor.
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/about", "/projects", "/contact", "/snake", "/en/:path*", "/cs/:path*", "/de/:path*"],
};

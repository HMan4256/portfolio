import { isLocale, type Locale } from "./translations";

export const portfolioPaths = ["/", "/about", "/projects", "/contact"] as const;
const pagePaths = [...portfolioPaths, "/snake"] as const;
export type PagePath = typeof pagePaths[number];
export type LocalizedRoute = { locale: Locale; page: PagePath };

export const languageCookie = "hman-preferred-language";
export const legacyLanguageCookie = "hman-language";

export function isPagePath(path: string): path is PagePath {
  return pagePaths.some(page => page === path);
}

export function localizedPath(locale: Locale, page: PagePath) {
  return `/${locale}${page === "/" ? "" : page}`;
}

export function parseLocalizedPath(path: string): LocalizedRoute | undefined {
  const [, locale, ...segments] = path.split("/");
  const page = `/${segments.join("/")}`;
  if (isLocale(locale) && isPagePath(page)) return { locale, page };
}

export function screenPath(pathname: string) {
  return parseLocalizedPath(pathname)?.page ?? pathname;
}

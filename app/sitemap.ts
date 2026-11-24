import type { MetadataRoute } from "next";
import { localizedPath, portfolioPaths } from "@/lib/routes";
import { absoluteUrl, alternateLanguages, locales } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return portfolioPaths.flatMap(page => locales.map(locale => ({
    url: absoluteUrl(localizedPath(locale, page)),
    alternates: { languages: alternateLanguages(page) },
  })));
}

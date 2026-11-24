import { RouteLink } from "@/components/page-motion";
import { SnakeGame } from "@/components/snake-game";
import { Sprite } from "@/components/sprite";
import { getLocale } from "@/lib/locale";
import { localizedPath } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { translations } from "@/lib/translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { ...pageMetadata(await getLocale(), "/snake"), robots: { index: false, follow: true } };
}

export default async function SnakePage() {
  const locale = await getLocale();
  const copy = translations[locale];
  return (
    <main className="snake-screen" tabIndex={-1}>
      <RouteLink className="snake-home home-button" href={localizedPath(locale, "/")} aria-label={copy.back}
        title={copy.back} data-motion="icon">
        <Sprite name="home" />
      </RouteLink>
      <SnakeGame copy={copy.snake} />
    </main>
  );
}

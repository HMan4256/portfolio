import { PageSchema } from "@/components/page-schema";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { DecodeText } from "@/components/decode-text";
import { getCopy, getLocale } from "@/lib/locale";
import { HomeMenu } from "@/components/home-menu";
import { KnightButton } from "@/components/knight-button";
import { PetCat } from "@/components/pet-cat";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getLocale(), "/");
}

export default async function HomePage() {
  const locale = await getLocale();
  const copy = await getCopy();
  return (
    <main className="home-screen" tabIndex={-1}>
      <PageSchema locale={locale} page="/" />
      <div className="home-content">
        <header className="home-intro" data-enter>
          <PetCat label={copy.pet} alt={copy.home.catAlt} className="hero-cat" priority />
          <h1 className="pixel-title"><DecodeText text={copy.home.greeting} /> <span className="accent">HMan</span></h1>
        </header>
        <HomeMenu copy={copy.home} locale={locale} />
      </div>
      <KnightButton locale={locale} label={copy.snake.open} />
    </main>
  );
}

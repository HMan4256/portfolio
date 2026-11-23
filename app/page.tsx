import { DecodeText } from "@/components/decode-text";
import { getCopy } from "@/lib/locale";
import { HomeMenu } from "@/components/home-menu";
import { KnightButton } from "@/components/knight-button";
import { PetCat } from "@/components/pet-cat";

export default async function HomePage() {
  const copy = await getCopy();
  return (
    <main className="home-screen" tabIndex={-1}>
      <div className="home-content">
        <header className="home-intro" data-enter>
          <PetCat label={copy.pet} className="hero-cat" priority />
          <h1 className="pixel-title"><DecodeText text={copy.home.greeting} /> <span className="accent">HMan</span></h1>
        </header>
        <HomeMenu copy={copy.home} />
      </div>
      <KnightButton label={copy.chess} />
    </main>
  );
}

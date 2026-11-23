import { getCopy } from "@/lib/locale";
import type { ReactNode } from "react";
import { RouteLink } from "./page-motion";
import { PetCat } from "./pet-cat";
import { Sprite } from "./sprite";

type InnerScreenProps = {
  title: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export async function InnerScreen({ title, footer, children }: InnerScreenProps) {
  const copy = await getCopy();
  return (
    <main className="inner-screen" tabIndex={-1}>
      <h1 className="pixel-title" data-enter>{title}</h1>
      {children}
      <footer className="screen-footer" data-enter>
        <div className="footer-note">
          <PetCat label={copy.pet} className="footer-cat" />
          <span>{footer}</span>
        </div>
        <RouteLink href="/" className="home-button" aria-label={copy.back} data-motion="icon">
          <Sprite name="home" />
        </RouteLink>
      </footer>
    </main>
  );
}

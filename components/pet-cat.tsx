"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { PixelIcon } from "./pixel-icon";
import { Sprite } from "./sprite";

export function PetCat({ className, priority, label }: { label: string; className: string; priority?: boolean }) {
  const button = useRef<HTMLButtonElement>(null);
  const reaction = useRef<gsap.core.Timeline | null>(null);
  const { contextSafe } = useGSAP({ scope: button });

  const pet = contextSafe(() => {
    const el = button.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    reaction.current?.kill();
    const tl = gsap.timeline();
    reaction.current = tl;
    const hearts = el.querySelectorAll(".pet-heart");
    tl.set(hearts, { opacity: 0, x: 0, y: 0 });
    if (reduced) {
      tl.set(hearts[1], { opacity: 1 }).set(hearts, { opacity: 0 }, 0.85);
      return;
    }
    tl.to(el.querySelector(".cat-body"), {
      scaleX: 1.12, scaleY: 0.87, rotation: -4, duration: 0.12, transformOrigin: "50% 100%",
    }, 0).to(el.querySelector(".cat-body"), {
      scaleX: 1, scaleY: 1, rotation: 0, duration: 0.45, ease: "elastic.out(1, 0.4)",
    });
    tl.fromTo(hearts, { opacity: 1 }, {
      x: (i) => (i - 1) * 18, y: (i) => i === 1 ? -32 : -22,
      snap: { x: 2, y: 2 }, duration: 0.52, ease: "power2.out", stagger: 0.06,
    }, 0).to(hearts, { opacity: 0, duration: 0.22, stagger: 0.05 }, 0.62);
  });

  return (
    <button type="button" ref={button} className={`pet-cat ${className}`}
      aria-label={label} title={label} onClick={pet}>
      <span className="cat-body"><Sprite name="cat" priority={priority} /></span>
      <span className="pet-hearts" aria-hidden="true">
        {[0, 1, 2].map(i => <PixelIcon key={i} name="heart" className="pet-heart" />)}
      </span>
    </button>
  );
}

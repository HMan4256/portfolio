"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Sprite } from "./sprite";

export function KnightButton({ label }: { label: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const { contextSafe } = useGSAP({ scope: button });

  const nudge = contextSafe(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animation.current?.kill();

    animation.current = gsap.timeline({ defaults: { duration: 0.08, ease: "power2.inOut" } })
      .to(button.current?.firstElementChild ?? null, {
        keyframes: [{ x: -4 }, { x: 4 }, { x: -2 }, { x: 0 }],
        duration: 0.32,
        clearProps: "transform",
      });
  });

  return (
    <button
      ref={button}
      type="button"
      className="knight-button"
      aria-label={label}
      aria-disabled="true"
      data-motion="icon"
      onClick={nudge}
    >
      <Sprite name="knight" />
    </button>
  );
}

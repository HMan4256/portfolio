"use client";

import { DecodeText } from "@/components/decode-text";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

type Effect = "ink" | "decode" | "signal";

export function RippleText({ text, focusable = false, effect = "ink" }: {
  text: string;
  focusable?: boolean;
  effect?: Effect;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const wave = useRef<gsap.core.Timeline | null>(null);
  const { contextSafe } = useGSAP({ scope: ref });

  const play = contextSafe((pointerX?: number) => {
    const letters = Array.from(ref.current!.querySelectorAll<HTMLElement>(".ripple-letter"));
    wave.current?.revert();
    const tl = gsap.timeline();
    wave.current = tl;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl.set(letters, { color: "var(--accent)" }).set(letters, { clearProps: "color" }, 0.6);
      return;
    }
    const hit = pointerX === undefined ? 0 : letters.findIndex(letter => letter.getBoundingClientRect().right >= pointerX);
    const origin = hit < 0 ? letters.length - 1 : hit;
    const ink = getComputedStyle(ref.current!).color;
    if (effect === "signal") {
      tl.fromTo(ref.current, { "--trace": 0 }, { "--trace": 1, duration: 0.32, ease: "steps(12)" })
        .to(ref.current, { "--trace": 0, duration: 0.17 }, 0.52);
    }
    // A wave radiates from the letter under the pointer. Inline boxes keep their original measure.
    letters.forEach((letter, index) => {
      const offset = Math.abs(index - origin) * 0.023;
      if (effect === "decode") {
        tl.set(letter, { attr: { "data-decoding": "1" } }, offset)
          .set(letter, { attr: { "data-decoding": "0" } }, offset + 0.12);
      }
      tl.to(letter, {
        yPercent: effect === "ink" ? -28 : -12, rotation: effect === "ink" ? (index % 2 ? 5 : -5) : 0, color: "#d13c39",
        textShadow: "2px 3px 0 #e9a3a1", duration: 0.16, ease: "power2.out",
      }, offset).to(letter, {
        yPercent: 0, rotation: 0, color: ink, textShadow: "0px 0px 0px transparent",
        duration: 0.36, ease: "back.out(2)", clearProps: "transform,color,textShadow",
      }, offset + 0.16);
    });
  });

  return (
    <span className={`ripple-text ripple-${effect}`} ref={ref} tabIndex={focusable ? 0 : undefined} data-sound-ripple
      onPointerEnter={e => { if (e.pointerType === "mouse") play(e.clientX); }}
      onPointerDown={e => { if (e.pointerType !== "mouse") play(e.clientX); }}
      onFocus={e => { if (e.currentTarget.matches(":focus-visible")) play(); }}>
      <DecodeText text={text} renderWord={word => Array.from(word).map((letter, i) => (
        <span key={i} className="ripple-letter" data-rune={effect === "decode" ? "{}_+<>#"[i % 7] : undefined}>{letter}</span>
      ))} />
    </span>
  );
}

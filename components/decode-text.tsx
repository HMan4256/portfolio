"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const glyphs = "#%+<>/=?*";

export function DecodeText({ text, renderWord }: {
  text: string;
  renderWord?: (word: string) => ReactNode;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const previous = useRef(text);

  useGSAP(() => {
    const changed = previous.current !== text;
    previous.current = text;
    if (!changed || !text.trim() || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = Array.from(root.current!.querySelectorAll<HTMLElement>(".decode-word"));
    const letters = words.map(word => Array.from(word.textContent ?? ""));
    const frames = 12;
    const clock = { frame: 0 };
    let lastFrame = -1;
    const draw = () => {
      if (lastFrame === clock.frame) return;
      lastFrame = clock.frame;
      words.forEach((word, index) => {
        const chars = letters[index];
        // Stagger the words slightly, then resolve each one from left to right.
        const progress = Math.max(0, (clock.frame - 2 * index / words.length) / (frames - 2));
        const resolved = Math.floor(chars.length * progress);
        if (resolved >= chars.length) {
          delete word.dataset.ascii;
          return;
        }
        word.dataset.ascii = chars.map((char, i) =>
          i < resolved ? char : glyphs[(clock.frame * 5 + i * 7 + index) % glyphs.length]
        ).join("");
      });
    };

    draw();
    gsap.to(clock, {
      frame: frames, duration: 0.58, ease: "none", snap: { frame: 1 }, onUpdate: draw,
    });
    return () => words.forEach(word => { delete word.dataset.ascii; });
  }, { scope: root, dependencies: [text], revertOnUpdate: true });

  return (
    <span ref={root}>
      {renderWord && <span className="sr-only">{text}</span>}
      <span aria-hidden={renderWord ? true : undefined}>{text.split(/(\s+)/u).map((word, i) =>
        !word.trim() ? word : (
          <span className="decode-word" key={i}><span>{renderWord ? renderWord(word) : word}</span></span>
        )
      )}</span>
    </span>
  );
}

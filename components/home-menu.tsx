"use client";

import { DecodeText } from "@/components/decode-text";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type PointerEvent } from "react";
import { RouteLink } from "./page-motion";
import { useUiSound } from "./soundscape";
import { Sprite } from "./sprite";

import { localizedPath } from "@/lib/routes";
import type { Locale, translations } from "@/lib/translations";

const pages = ["about", "projects", "contact"] as const;
let lastOpened = 0;

export function HomeMenu({ copy, locale }: { copy: typeof translations.en.home; locale: Locale }) {
  const menu = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const selected = useRef(0);
  const hop = useRef<gsap.core.Timeline | null>(null);
  const playSound = useUiSound();

  const { contextSafe } = useGSAP(() => {
    const nav = menu.current!;
    const rows = nav.querySelectorAll<HTMLLIElement>("li");
    const cat = nav.closest("main")?.querySelector(".hero-cat");
    const motion = gsap.matchMedia();
    selected.current = lastOpened;

    function align() {
      const row = rows[selected.current];
      rows.forEach((item) => item.toggleAttribute("data-selected", item === row));
      gsap.set(cursor.current, { y: row.offsetTop + row.offsetHeight / 2 });
    }
    align();
    const observer = new ResizeObserver(align);
    observer.observe(nav);

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(nav.querySelector(".menu-cursor img"), {
        x: 5, repeat: -1, yoyo: true, duration: 0.62, ease: "sine.inOut",
      });
      if (cat) gsap.to(cat, {
        scaleY: 0.96, scaleX: 1.025, transformOrigin: "bottom center",
        repeat: -1, yoyo: true, duration: 1.25, ease: "sine.inOut",
      });
    });

    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement;
      if (!nav.getClientRects().length || (!nav.contains(target) && target.closest("a,button,input,textarea,select,[contenteditable=true]"))) return;
      const index = selected.current;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!event.repeat) rows[index].querySelector("a")?.click();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = (index + step + rows.length) % rows.length;
      rows[next].querySelector("a")?.focus();
      select(next);
    }
    window.addEventListener("keydown", keydown);
    return () => {
      observer.disconnect();
      motion.revert();
      window.removeEventListener("keydown", keydown);
    };
  }, { scope: menu });

  const select = contextSafe((index: number) => {
    if (index === selected.current) return;
    const rows = menu.current!.querySelectorAll("li");
    rows[selected.current].removeAttribute("data-selected");
    selected.current = index;
    const row = rows[index];
    row.setAttribute("data-selected", "");
    playSound("select");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cat = menu.current!.closest("main")?.querySelector(".hero-cat");
    if (!reduced && cat) {
      hop.current?.kill();
      hop.current = gsap.timeline().to(cat, { y: -7, duration: 0.12, ease: "power2.out" })
        .to(cat, { y: 0, duration: 0.18, ease: "power2.in" });
    }
    gsap.to(cursor.current, {
      y: row.offsetTop + row.offsetHeight / 2,
      duration: reduced ? 0 : 0.21,
      ease: "power3.out", overwrite: "auto",
    });
  });

  function hoverChoice(event: PointerEvent<HTMLAnchorElement>, index: number) {
    if (event.pointerType === "touch") return;
    if (document.activeElement !== event.currentTarget && menu.current?.contains(document.activeElement)) {
      event.currentTarget.focus({ preventScroll: true });
    }
    select(index);
  }

  return (
    <nav ref={menu} aria-label={copy.menu} className="home-menu">
      <div ref={cursor} className="menu-cursor" aria-hidden="true"><Sprite name="cursor" /></div>
      <ul className="grid">
        {pages.map((page, index) => (
          <li key={page} data-enter data-selected={index === 0 ? "" : undefined}>
            <RouteLink
              aria-label={copy[page].join("")}
              className="menu-choice" href={localizedPath(locale, `/${page}`)}
              onFocus={event => {
                if (index === selected.current && event.currentTarget.matches(":focus-visible")) playSound("select");
                select(index);
              }}
              onPointerEnter={event => {
                if (event.pointerType !== "touch" && index === selected.current) playSound("hover");
                hoverChoice(event, index);
              }}
              onPointerMove={event => hoverChoice(event, index)}
              onPointerDown={() => select(index)}
              onClick={() => { lastOpened = index; }}
            >
              <span><DecodeText text={copy[page][0]} /><span className="accent"><DecodeText text={copy[page][1]} /></span><DecodeText text={copy[page][2]} /></span>
            </RouteLink>
          </li>
        ))}
      </ul>
      <p className="menu-hint" data-enter><kbd>↑</kbd><kbd>↓</kbd> <DecodeText text={copy.select} /> <kbd>enter</kbd> <DecodeText text={copy.open} /></p>
    </nav>
  );
}

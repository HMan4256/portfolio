"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

gsap.registerPlugin(useGSAP);

const Navigation = createContext<((href: string) => void) | null>(null);
const bands = Array.from({ length: 24 }, (_, index) => index);
const reduceMotion = "(prefers-reduced-motion: reduce)";
const hoverOffsets = {
  panel: { x: -3, y: -4 },
  icon: { y: -4, scale: 1.08 },
};

// Adjacent strips lead by different amounts to give the wipe its stepped edge.
function stripDelay(index: number) {
  return (index % 6) * 0.014 + Math.floor(index / 6) * 0.011;
}

export function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const historyFrame = useRef<HTMLDivElement>(null);
  const wipe = useRef<gsap.core.Timeline | null>(null);
  const previousPath = useRef<string | null>(null);
  const phase = useRef<"idle" | "covering" | "covered" | "revealing">("idle");
  const ready = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  function activeScreen() {
    return Array.from(root.current!.querySelectorAll("main")).find(page => page.getClientRects().length);
  }

  function enter(delay = 0) {
    const main = activeScreen();
    if (!main) return;
    const reduced = matchMedia(reduceMotion).matches;
    const tl = gsap.timeline({ delay });
    const title = main.querySelector("h1");
    const content = Array.from(main.querySelectorAll<HTMLElement>("[data-enter]")).filter(el => el !== title);
    if (title && !reduced) tl.fromTo(title, { clipPath: "inset(0 100% 0 0)" }, {
      clipPath: "inset(0 0% 0 0)", duration: 0.52, ease: "steps(22)", clearProps: "clipPath",
    }, 0);
    tl.fromTo(content, { opacity: reduced ? 0.7 : 0, y: reduced ? 0 : 10 }, {
      opacity: 1, y: 0, duration: reduced ? 0.12 : 0.4,
      stagger: reduced ? 0 : 0.055, ease: "power2.out", clearProps: "opacity,transform",
    }, 0);
  }

  function reveal() {
    if (phase.current !== "covered" || !ready.current) return;
    phase.current = "revealing";
    historyFrame.current?.replaceChildren();
    const overlay = curtain.current!;
    const reduced = matchMedia(reduceMotion).matches;
    activeScreen()?.focus({ preventScroll: true });
    enter(reduced ? 0 : 0.10);
    const tl = gsap.timeline({ onComplete: () => {
      delete overlay.dataset.visible;
      phase.current = "idle";
    } });
    wipe.current = tl;
    tl.to(overlay, { opacity: reduced ? 0 : 1, duration: reduced ? 0.14 : 0 }, 0);
    if (!reduced) tl.to(overlay.children, {
      xPercent: 113, duration: 0.42, ease: "power3.inOut", stagger: stripDelay,
    }, 0);
  }

  function cover(back: boolean, onCovered?: () => void) {
    const overlay = curtain.current!;
    wipe.current?.kill();
    phase.current = "covering";
    ready.current = false;
    overlay.dataset.visible = "true";
    overlay.dataset.back = String(back);
    const reduced = matchMedia(reduceMotion).matches;
    gsap.set(overlay, { opacity: reduced ? 0 : 1 });
    gsap.set(overlay.children, { xPercent: reduced ? 0 : -113 });
    const tl = gsap.timeline({ onComplete: () => {
      phase.current = "covered";
      onCovered?.();
      reveal();
    } });
    wipe.current = tl;
    if (reduced) tl.to(overlay, { opacity: 1, duration: 0.14 });
    else tl.to(overlay.children, {
      xPercent: 0, duration: 0.37, stagger: stripDelay, ease: "power3.inOut",
    });
  }

  const { contextSafe } = useGSAP(() => {
    if (previousPath.current === null || previousPath.current === pathname) enter();
    else {
      ready.current = true;
      if (phase.current === "idle") enter();
      else reveal();
    }
    previousPath.current = pathname;
  }, { scope: root, dependencies: [pathname] });

  useEffect(() => {
    // History traversal commits independently of Link. Keep the outgoing pixels
    // visible at their current scroll position until the curtain covers them.
    const onPop = contextSafe(() => {
      if (window.location.pathname === previousPath.current) {
        if (historyFrame.current?.hasChildNodes()) {
          ready.current = true;
          reveal();
        }
        return;
      }
      const copy = root.current!.cloneNode(true) as HTMLDivElement;
      copy.style.transform = `translateY(-${window.scrollY}px)`;
      historyFrame.current!.replaceChildren(copy);
      cover(window.location.pathname === "/");
    });
    window.addEventListener("popstate", onPop, true);
    return () => window.removeEventListener("popstate", onPop, true);
  }, [contextSafe]);

  const move = contextSafe((event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    const target = (event.target as Element).closest<HTMLElement>("[data-motion]");
    if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
    if (matchMedia(reduceMotion).matches || ("pointerType" in event && event.pointerType === "touch")) return;

    const active = event.type === "pointerover" || event.type === "focus";
    if (event.type === "pointerout" && target.matches(":focus-visible")) return;
    if (event.type === "blur" && target.matches(":hover")) return;

    const offsets = hoverOffsets[target.dataset.motion as keyof typeof hoverOffsets];
    gsap.to(target, {
      ...(active ? offsets : { x: 0, y: 0, scale: 1, clearProps: "transform" }),
      duration: active ? 0.25 : 0.2,
      ease: active ? "power3.out" : "power2.out",
      overwrite: "auto",
    });
  });

  const navigate = contextSafe((href: string) => {
    if (pathname === href || phase.current === "covering" || phase.current === "covered") return;
    const choice = activeScreen()?.querySelector("[data-selected] .menu-choice, .home-button");
    if (choice && !matchMedia(reduceMotion).matches) {
      gsap.fromTo(choice, { scale: 0.96 }, { scale: 1, duration: 0.22, clearProps: "scale", ease: "power2.out" });
    }
    cover(href === "/", () => router.push(href));
  });

  return (
    <Navigation.Provider value={navigate}>
      <div ref={root} onPointerOver={move} onPointerOut={move} onFocus={move} onBlur={move}>
        {children}
      </div>
      <div ref={historyFrame} className="history-frame" inert aria-hidden="true" />
      <div ref={curtain} className="pixel-curtain" aria-hidden="true">
        {bands.map((index) => <span key={index} />)}
      </div>
    </Navigation.Provider>
  );
}

type RouteLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & { href: string };

export function RouteLink({ href, ...props }: RouteLinkProps) {
  const navigate = useContext(Navigation);

  return (
    <Link
      {...props}
      href={href}
      onNavigate={(event) => {
        if (!navigate) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}

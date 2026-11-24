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
import { screenPath } from "@/lib/routes";
import { useUiSound } from "./soundscape";

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
  const startup = useRef<HTMLCanvasElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const historyFrame = useRef<HTMLDivElement>(null);
  const wipe = useRef<gsap.core.Timeline | null>(null);
  const phase = useRef<"idle" | "covering" | "covered" | "revealing">("idle");
  const ready = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const screen = screenPath(pathname);
  const previousPath = useRef(screen);
  const playSound = useUiSound();

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

  function startIntro() {
    const overlay = startup.current!;
    const style = getComputedStyle(overlay);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) < 1) {
      enter();
      return;
    }

    const ctx = overlay.getContext("2d");
    if (!ctx) {
      gsap.set(overlay, { visibility: "hidden" });
      return;
    }

    // Draw in whole pixels on a small canvas and let CSS scale it to the screen.
    const centerX = Math.ceil(overlay.clientWidth / 32);
    const centerY = Math.ceil(overlay.clientHeight / 32);
    const width = centerX * 2 + 1;
    const height = centerY * 2 + 1;
    overlay.width = width;
    overlay.height = height;
    const coverColor = style.backgroundColor;
    const aperture = { radius: -1 };

    function draw(context: CanvasRenderingContext2D) {
      const { radius } = aperture;
      context.fillStyle = coverColor;
      context.fillRect(0, 0, width, height);
      if (radius < 0) return;

      const rim = radius + 1;
      context.fillStyle = "#3c4752";
      for (let row = 0; row < height; row++) {
        const offset = row - centerY;
        if (Math.abs(offset) > rim) continue;
        const edge = Math.floor(Math.sqrt(rim ** 2 - offset ** 2));
        context.fillRect(centerX - edge, row, edge * 2 + 1, 1);
        if (Math.abs(offset) > radius) continue;
        const opening = Math.floor(Math.sqrt(radius ** 2 - offset ** 2));
        context.clearRect(centerX - opening, row, opening * 2 + 1, 1);
      }
    }

    draw(ctx);
    gsap.timeline()
      .set(overlay, { backgroundColor: "transparent", animationDelay: "4s" })
      .to(aperture, {
        radius: Math.hypot(centerX, centerY) + 1,
        duration: 0.88,
        ease: "power2.inOut",
        onUpdate: () => draw(ctx),
      }, 0.06)
      .set(overlay, { visibility: "hidden" });
  }

  function reveal() {
    if (phase.current !== "covered" || !ready.current) return;
    phase.current = "revealing";
    playSound("reveal");
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
    if (startup.current) startup.current.hidden = true;
    wipe.current?.kill();
    phase.current = "covering";
    playSound("cover");
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

  useGSAP(startIntro, { scope: startup });

  const { contextSafe } = useGSAP(() => {
    if (previousPath.current === screen) return;
    ready.current = true;
    if (phase.current === "idle") {
      playSound("reveal");
      enter();
    } else reveal();
    previousPath.current = screen;
  }, { scope: root, dependencies: [screen] });

  useEffect(() => {
    // History traversal commits independently of Link. Keep the outgoing pixels
    // visible at their current scroll position until the curtain covers them.
    const onPop = contextSafe(() => {
      if (screenPath(window.location.pathname) === previousPath.current) {
        if (historyFrame.current?.hasChildNodes()) {
          ready.current = true;
          reveal();
        }
        return;
      }
      const copy = root.current!.cloneNode(true) as HTMLDivElement;
      const scrollPosition = window.scrollY;
      const frame = historyFrame.current!;
      frame.replaceChildren(copy);
      frame.scrollTop = scrollPosition;
      cover(screenPath(window.location.pathname) === "/");
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
    cover(screenPath(href) === "/", () => router.push(href));
  });

  return (
    <Navigation.Provider value={navigate}>
      <div ref={root} onPointerOver={move} onPointerOut={move} onFocus={move} onBlur={move}>
        {children}
      </div>
      <canvas ref={startup} className="startup-screen" inert aria-hidden="true" />
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

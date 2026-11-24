"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { advance, columns, newRound, queueTurn, rows, type Direction, type Round } from "@/lib/snake";
import type { translations } from "@/lib/translations";
import { useUiSound } from "./soundscape";

const directions = ["up", "left", "down", "right"] as const;
const keys = new Map<string, Direction>([
  ["arrowup", "up"], ["w", "up"], ["arrowleft", "left"], ["a", "left"],
  ["arrowdown", "down"], ["s", "down"], ["arrowright", "right"], ["d", "right"],
]);
const gridSize = { "--cols": columns, "--rows": rows } as CSSProperties;

function position({ x, y }: { x: number; y: number }) {
  return { gridColumn: x + 1, gridRow: y + 1 };
}

export function SnakeGame({ copy }: { copy: typeof translations.en.snake }) {
  const [round, setRound] = useState(newRound);
  const [held, setHeld] = useState<Direction | null>(null);
  const current = useRef(round);
  const game = useRef<HTMLElement>(null);
  const turns = useRef<Direction[]>([]);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const sound = useUiSound();
  const { phase } = round;
  const finished = phase === "over" || phase === "won";
  const score = round.body.length - 4;

  function update(next: Round) {
    current.current = next;
    setRound(next);
  }

  function pause() {
    turns.current = [];
    swipe.current = null;
    if (current.current.phase === "playing") update({ ...current.current, phase: "paused" });
  }

  function toggle() {
    const state = current.current;
    if (state.phase === "playing") {
      pause();
      sound("snakePause");
    } else {
      turns.current = [];
      const start = state.phase === "over" || state.phase === "won" ? newRound() : state;
      update({ ...start, phase: "playing" });
      sound("snakeStart");
    }
  }

  function steer(direction: Direction) {
    const state = current.current;
    if (state.phase === "ready" && direction !== "left") {
      // Take the first step on input so the controls feel immediate.
      update(advance(state, direction));
      sound("snakeStart");
    } else if (state.phase === "playing") {
      queueTurn(turns.current, state.heading, direction);
    }
  }

  const handleKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
        !game.current?.getClientRects().length) return;
    const direction = keys.get(event.key.toLowerCase());
    if (direction) {
      event.preventDefault();
      if (!event.repeat) {
        setHeld(direction);
        steer(direction);
      }
    } else if (event.code === "Space" && !(event.target instanceof Element && event.target.closest("button,a,input"))) {
      event.preventDefault();
      if (!event.repeat) toggle();
    }
  });

  useEffect(() => {
    function releaseKey(event: KeyboardEvent) {
      const direction = keys.get(event.key.toLowerCase());
      setHeld(pressed => pressed === direction ? null : pressed);
    }
    function suspend() {
      setHeld(null);
      pause();
    }
    function onVisibility() { if (document.hidden) suspend(); }
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", releaseKey);
    window.addEventListener("blur", suspend);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", releaseKey);
      window.removeEventListener("blur", suspend);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    let timer: number;

    function schedule() {
      const apples = current.current.body.length - 4;
      timer = window.setTimeout(step, Math.max(82, 145 - apples * 4));
    }

    function step() {
      const previous = current.current;
      if (previous.phase !== "playing") return;
      const next = advance(previous, turns.current.shift() ?? previous.heading);
      update(next);
      if (next.phase === "over") sound("snakeCrash");
      else if (next.phase === "won") sound("snakeWin");
      else if (next.body.length > previous.body.length) sound("snakeEat");
      else if (next.heading !== previous.heading) sound("snakeTurn");
      if (next.phase === "playing") schedule();
    }

    schedule();
    return () => window.clearTimeout(timer);
  }, [phase, sound]);

  function readSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = swipe.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  return (
    <section className="snake-game" ref={game} aria-labelledby="snake-title">
      <header className="snake-header">
        <h1 id="snake-title">{copy.title}</h1>
        <p>{copy.score} <strong>{String(score).padStart(2, "0")}</strong></p>
      </header>
      <div className="snake-bezel">
        <div className="snake-field" style={gridSize} onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        }} onPointerMove={readSwipe} onPointerUp={event => {
          readSwipe(event);
          swipe.current = null;
        }} onPointerCancel={() => { swipe.current = null; }}>
          {round.food && <span className="snake-cell snake-fruit" aria-hidden="true" style={position(round.food)} />}
          {round.body.map((cell, index) => (
            <span key={index} aria-hidden="true" style={position(cell)} className="snake-cell snake-piece"
              data-heading={index === 0 ? round.heading : undefined} />
          ))}
          <div className="snake-message" role="status">{phase === "over" ? copy.over : phase === "won" ? copy.won : phase === "paused" ? copy.paused : ""}</div>
        </div>
      </div>
      <div className="snake-controls">
        <div className="snake-pad">
          {directions.map(direction => (
            <button key={direction} type="button" className="snake-key" data-direction={direction}
              data-held={held === direction || undefined} aria-label={copy[direction]} data-sound-click="none"
              onPointerDown={event => { if (event.button === 0) steer(direction); }}
              onClick={event => { if (event.detail === 0) steer(direction); }}>
              <span className="snake-arrow" aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="snake-actions">
          <button type="button" className="snake-key snake-action" data-sound-click="none" onClick={toggle}>
            <span>{phase === "ready" ? copy.play : finished ? copy.retry : phase === "paused" ? copy.resume : copy.pause}</span>
          </button>
          <p className="snake-keys">{copy.keys}</p>
          <p className="snake-touch-hint">{copy.swipe}</p>
        </div>
      </div>
    </section>
  );
}

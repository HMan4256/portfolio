"use client";

import { createUiAudio, type SoundCue } from "@/lib/ui-sounds";
import type { Locale } from "@/lib/translations";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const Sound = createContext<(cue: SoundCue) => void>(() => {});
const preferenceKey = "hman-sound-muted";
const activationEvents = ["pointerdown", "pointerup", "touchend", "keydown", "click"];

export function useUiSound() {
  return useContext(Sound);
}

function soundTarget(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLElement>("a[href], button:not(:disabled), [data-sound-ripple]")
    : null;
}

export function Soundscape({ children, languageSwitcher, locale, muteLabel, unmuteLabel }: {
  children: ReactNode;
  languageSwitcher: ReactNode;
  locale: Locale;
  muteLabel: string;
  unmuteLabel: string;
}) {
  const [audio] = useState(createUiAudio);
  const [muted, setMuted] = useState(false);
  const previousLocale = useRef(locale);

  useEffect(() => {
    function applyPreference(value: boolean) {
      audio.setMuted(value);
      setMuted(value);
    }

    try {
      applyPreference(localStorage.getItem(preferenceKey) === "true");
    } catch {
      // The toggle still works for this page if storage is unavailable.
    }

    function syncPreference(event: StorageEvent) {
      if (event.storageArea === localStorage && (event.key === preferenceKey || event.key === null)) {
        applyPreference(event.newValue === "true");
      }
    }

    function unlock(event: Event) {
      if (event.isTrusted) audio.unlock();
    }

    for (const event of activationEvents) window.addEventListener(event, unlock, { capture: true, passive: true });
    window.addEventListener("storage", syncPreference);
    return () => {
      for (const event of activationEvents) window.removeEventListener(event, unlock, true);
      window.removeEventListener("storage", syncPreference);
      audio.close();
    };
  }, [audio]);

  useEffect(() => {
    if (previousLocale.current !== locale) {
      previousLocale.current = locale;
      audio.play("language");
    }
  }, [audio, locale]);

  function toggleMute() {
    const next = !muted;
    audio.setMuted(next);
    setMuted(next);
    try {
      localStorage.setItem(preferenceKey, String(next));
    } catch {
      // Storage is optional.
    }
    if (!next) {
      audio.unlock();
      audio.play("reveal");
    }
  }

  function clickSound(target: EventTarget | null) {
    const control = soundTarget(target);
    if (!control || control.matches(".mute-button")) return;
    switch (control.dataset.soundClick) {
      case "none": break;
      case "pet": audio.play("pet"); break;
      case "bump": audio.play("bump"); break;
      default: audio.play("click");
    }
  }

  return (
    <Sound.Provider value={audio.play}>
      <div
        onPointerOverCapture={event => {
          if (event.pointerType === "touch") return;
          const control = soundTarget(event.target);
          if (!control || control === soundTarget(event.relatedTarget) || control.matches(".menu-choice")) return;
          audio.play(control.hasAttribute("data-sound-ripple") ? "ripple" : "hover");
        }}
        onFocusCapture={event => {
          const control = soundTarget(event.target);
          if (!control?.matches(":focus-visible") || control.matches(".menu-choice")) return;
          audio.play(control.hasAttribute("data-sound-ripple") ? "ripple" : "select");
        }}
        onClickCapture={event => clickSound(event.target)}
        onAuxClickCapture={event => { if (event.button === 1) clickSound(event.target); }}
      >
        <header className="site-tools">
          {languageSwitcher}
          <button
            type="button"
            className="mute-button"
            aria-label={muteLabel}
            aria-pressed={muted}
            title={muted ? unmuteLabel : muteLabel}
            onClick={toggleMute}
          >
            <span className="sound-icon" aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </Sound.Provider>
  );
}

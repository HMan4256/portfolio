"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { parseLocalizedPath, type LocalizedRoute } from "@/lib/routes";
import { translations } from "@/lib/translations";
import { LanguageSwitcher } from "./language-switcher";
import { PageMotion } from "./page-motion";
import { Soundscape } from "./soundscape";

export function SiteShell({ initialRoute, children }: { initialRoute: LocalizedRoute; children: ReactNode }) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  // On entry, the server supplies the public path even when Next rewrites the request.
  const route = (hydrated && parseLocalizedPath(pathname)) || initialRoute;
  const { language, sound } = translations[route.locale];

  useEffect(() => setHydrated(true), []);
  useEffect(() => { document.documentElement.lang = route.locale; }, [route.locale]);

  return (
    <Soundscape
      locale={route.locale}
      muteLabel={sound.mute}
      unmuteLabel={sound.unmute}
      languageSwitcher={<LanguageSwitcher route={route} label={language} />}
    >
      <PageMotion>{children}</PageMotion>
    </Soundscape>
  );
}

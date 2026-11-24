"use client";

import Link from "next/link";
import { languageCookie, localizedPath, type LocalizedRoute } from "@/lib/routes";
import { languages, type Locale } from "@/lib/translations";

function rememberLanguage(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${languageCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function LanguageSwitcher({ route, label }: { route: LocalizedRoute; label: string }) {
  return (
    <nav className="language-switcher" aria-label={label}>
      {(Object.keys(languages) as Locale[]).map(locale => (
        <Link
          key={locale}
          href={localizedPath(locale, route.page)}
          lang={locale}
          hrefLang={locale}
          aria-label={languages[locale]}
          aria-current={route.locale === locale ? "page" : undefined}
          title={languages[locale]}
          scroll={false}
          onNavigate={() => rememberLanguage(locale)}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}

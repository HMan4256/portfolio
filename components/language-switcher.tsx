import { cookies } from "next/headers";
import { languageCookie } from "@/lib/locale";
import { isLocale, languages, type Locale } from "@/lib/translations";

async function chooseLanguage(formData: FormData) {
  "use server";
  const choice = formData.get("language");
  if (!isLocale(choice)) return;
  (await cookies()).set(languageCookie, choice, {
    path: "/", sameSite: "lax", httpOnly: true, maxAge: 365 * 24 * 60 * 60,
  });
}

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  return (
    <form action={chooseLanguage} className="language-switcher" aria-label={label}>
      {Object.entries(languages).map(([code, name]) => (
        <button key={code} name="language" value={code} lang={code} aria-label={name}
          title={name} aria-pressed={locale === code}>
          {code.toUpperCase()}
        </button>
      ))}
    </form>
  );
}

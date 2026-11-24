import { localizedPath } from "@/lib/routes";
import type { Locale } from "@/lib/translations";
import { RouteLink } from "./page-motion";
import { Sprite } from "./sprite";

export function KnightButton({ locale, label }: { locale: Locale; label: string }) {
  return (
    <RouteLink href={localizedPath(locale, "/snake")} className="knight-button"
      aria-label={label} title={label} data-motion="icon">
      <Sprite name="knight" />
    </RouteLink>
  );
}

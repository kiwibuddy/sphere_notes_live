import type { SupportedLocale } from "@/types/session";

/** Google Cloud Translation target language codes. */
export function toGoogleTranslateCode(locale: SupportedLocale): string | null {
  if (locale === "en") return null;
  const map: Record<Exclude<SupportedLocale, "en">, string> = {
    nb: "no",
    nn: "no",
    sv: "sv",
    da: "da",
    fi: "fi",
    fr: "fr",
    de: "de",
    es: "es",
  };
  return map[locale];
}

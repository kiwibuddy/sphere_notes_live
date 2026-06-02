"use client";

import type { SubtitleLine, SupportedLocale } from "@/types/session";
import { useEffect, useMemo, useRef, useState } from "react";

function sourceText(line: SubtitleLine): string {
  return (line.rawTextEn ?? line.textEn).trim();
}

/**
 * Fetches missing subtitle translations for non-English locales.
 * Uses raw speech text (not Claude-corrected English) per product rule.
 */
export function useSubtitleTranslations(
  lines: SubtitleLine[],
  locale: SupportedLocale
): SubtitleLine[] {
  const [overlay, setOverlay] = useState<Record<string, string>>({});
  const fetchedRef = useRef(new Set<string>());

  const signature = useMemo(
    () =>
      lines
        .map((l) => `${l.id}:${sourceText(l)}:${l.translations[locale] ?? ""}`)
        .join("|"),
    [lines, locale]
  );

  useEffect(() => {
    fetchedRef.current.clear();
    setOverlay({});
  }, [locale]);

  useEffect(() => {
    if (locale === "en") return;

    const need = lines.filter((line) => {
      const src = sourceText(line);
      if (!src) return false;
      if (line.translations[locale]) return false;
      const key = `${line.id}:${src}`;
      if (fetchedRef.current.has(key)) return false;
      return true;
    });

    if (need.length === 0) return;

    let cancelled = false;

    void (async () => {
      const batch = need.slice(0, 12);
      for (const line of batch) {
        fetchedRef.current.add(`${line.id}:${sourceText(line)}`);
      }

      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts: batch.map(sourceText),
            targetLocale: locale,
          }),
        });

        if (!res.ok || cancelled) return;

        const data = (await res.json()) as { translations?: string[] };
        const translated = data.translations ?? [];

        const updates: Record<string, string> = {};
        batch.forEach((line, i) => {
          const t = translated[i]?.trim();
          if (t) updates[line.id] = t;
        });

        if (!cancelled && Object.keys(updates).length > 0) {
          setOverlay((prev) => ({ ...prev, ...updates }));
        }
      } catch {
        for (const line of batch) {
          fetchedRef.current.delete(`${line.id}:${sourceText(line)}`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signature, locale, lines]);

  return useMemo(() => {
    if (locale === "en") return lines;

    return lines.map((line) => {
      if (line.translations[locale]) return line;
      const translated = overlay[line.id];
      if (!translated) return line;
      return {
        ...line,
        translations: { ...line.translations, [locale]: translated },
      };
    });
  }, [lines, locale, overlay]);
}

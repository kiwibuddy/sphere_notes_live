"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/session/context";
import type { Clipping, SupportedLocale } from "@/types/session";
import { LOCALE_LABELS } from "@/types/session";

const MINE_PREFIX = "spherenotes-mine-day-";

export function useMineNotes(day: number) {
  const { meta } = useSession();

  const [content, setContent] = useState("");
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const storageKey = `${MINE_PREFIX}${day}`;

  const clearNotes = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setContent("");
    setClippings([]);
    setLastSaved(null);
  }, [storageKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          content: string;
          clippings: Clipping[];
        };
        setContent(parsed.content ?? "");
        setClippings(parsed.clippings ?? []);
      } else {
        setContent("");
        setClippings([]);
      }
    } catch {
      setContent("");
      setClippings([]);
    }
  }, [storageKey]);

  // Expire student notes between sessions so exported PDFs don't include stale content.
  const prevStatusRef = useRef(meta.status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    const next = meta.status;
    if (prev === next) return;

    const isGoLive = prev === "waiting" && next === "live";
    const isEndDay = (prev === "live" || prev === "paused") && next === "waiting";

    if (isGoLive || isEndDay) {
      clearNotes();
    }

    prevStatusRef.current = next;
  }, [meta.status, clearNotes]);

  const save = useCallback(
    (newContent: string, newClippings: Clipping[]) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ content: newContent, clippings: newClippings })
      );
      setLastSaved(new Date());
    },
    [storageKey]
  );

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);
      save(newContent, clippings);
    },
    [clippings, save]
  );

  const addClipping = useCallback(
    (clipping: Clipping) => {
      setClippings((prev) => {
        const next = [...prev, clipping];
        save(content, next);
        return next;
      });
    },
    [content, save]
  );

  const removeClipping = useCallback(
    (id: string) => {
      setClippings((prev) => {
        const next = prev.filter((c) => c.id !== id);
        save(content, next);
        return next;
      });
    },
    [content, save]
  );

  return {
    content,
    clippings,
    lastSaved,
    updateContent,
    addClipping,
    removeClipping,
    clearNotes,
  };
}

const LOCALE_CODES = new Set<string>(Object.keys(LOCALE_LABELS));

function parseStoredLocale(stored: string | null): SupportedLocale {
  if (stored && LOCALE_CODES.has(stored)) {
    return stored as SupportedLocale;
  }
  return "en";
}

export function useLocale() {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  useEffect(() => {
    setLocaleState(parseStoredLocale(localStorage.getItem("spherenotes-locale")));
  }, []);

  const setLocale = useCallback((code: SupportedLocale) => {
    setLocaleState(code);
    localStorage.setItem("spherenotes-locale", code);
  }, []);

  return { locale, setLocale };
}

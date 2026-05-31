"use client";

import { useCallback, useEffect, useState } from "react";
import type { Clipping } from "@/types/session";

const MINE_PREFIX = "spherenotes-mine-day-";

export function useMineNotes(day: number) {
  const [content, setContent] = useState("");
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const storageKey = `${MINE_PREFIX}${day}`;

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
  };
}

export function useLocale() {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("spherenotes-locale");
    if (stored) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((code: string) => {
    setLocaleState(code);
    localStorage.setItem("spherenotes-locale", code);
  }, []);

  return { locale, setLocale };
}

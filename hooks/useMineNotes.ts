"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/session/session-context";
import {
  archiveMineStorageKey,
  clearMineDraft,
  liveMineStorageKey,
  readMineDraft,
  saveMineDraft,
} from "@/lib/notes/mine-storage";
import type { Clipping, SupportedLocale } from "@/types/session";
import { LOCALE_LABELS } from "@/types/session";

type MineScope = "live" | "archive";

interface UseMineNotesOptions {
  scope?: MineScope;
  eventId?: string;
}

export function useMineNotes(day: number, options: UseMineNotesOptions = {}) {
  const { joinEventId } = useSession();

  const [content, setContent] = useState("");
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const eventId = options.eventId ?? joinEventId;
  const scope = options.scope ?? "live";
  const storageKey =
    scope === "archive"
      ? archiveMineStorageKey(eventId, day)
      : liveMineStorageKey(eventId);

  const clearNotes = useCallback(() => {
    try {
      clearMineDraft(storageKey);
    } catch {
      /* ignore */
    }
    setContent("");
    setClippings([]);
    setLastSaved(null);
  }, [storageKey]);

  useEffect(() => {
    try {
      const draft = readMineDraft(storageKey);
      setContent(draft.content);
      setClippings(draft.clippings);
    } catch {
      setContent("");
      setClippings([]);
    }
  }, [storageKey]);

  const save = useCallback(
    (newContent: string, newClippings: Clipping[]) => {
      saveMineDraft(storageKey, { content: newContent, clippings: newClippings });
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

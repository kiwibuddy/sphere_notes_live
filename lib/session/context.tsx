"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultMeta } from "@/lib/mock/session";
import { getSubtitlesForDay } from "@/lib/mock/subtitles";
import { getQuestionsForDay } from "@/lib/mock/questions";
import { getNotesForDay } from "@/lib/mock/notes";
import { getWordcloudForDay } from "@/lib/mock/wordcloud";
import { getSlidesForDay } from "@/lib/mock/slides";
import { getSessionMapForDay } from "@/lib/mock/sessionMap";
import type {
  Clipping,
  DisplayMode,
  Reactions,
  SessionContextValue,
  SessionMeta,
  SessionStatus,
} from "@/types/session";

const STORAGE_KEY = "spherenotes-session-state";

interface PersistedState {
  meta: SessionMeta;
  clippings: Clipping[];
}

const SessionContext = createContext<SessionContextValue | null>(null);

function loadPersisted(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {};
  }
}

function savePersisted(meta: SessionMeta, clippings: Clipping[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ meta, clippings })
  );
}

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<SessionMeta>(() => ({
    ...defaultMeta,
    ...loadPersisted().meta,
  }));
  const [clippings, setClippings] = useState<Clipping[]>(
    () => loadPersisted().clippings ?? []
  );
  const [questions, setQuestions] = useState(() =>
    getQuestionsForDay(meta.currentDay)
  );
  const [displayMode, setDisplayModeState] = useState<DisplayMode>("idle");
  const [displayQuote, setDisplayQuote] = useState("");
  const [reactions, setReactions] = useState<Reactions>({
    fire: 42,
    clap: 28,
    think: 7,
    question: 3,
  });

  const day = meta.currentDay;

  const subtitles = useMemo(() => getSubtitlesForDay(day), [day]);
  const notes = useMemo(() => getNotesForDay(day), [day]);
  const wordcloud = useMemo(() => getWordcloudForDay(day), [day]);
  const slides = useMemo(() => getSlidesForDay(day), [day]);
  const sessionMap = useMemo(() => getSessionMapForDay(day), [day]);

  useEffect(() => {
    savePersisted(meta, clippings);
  }, [meta, clippings]);

  const loadDayData = useCallback((newDay: number) => {
    setQuestions(getQuestionsForDay(newDay));
  }, []);

  const setStatus = useCallback((status: SessionStatus) => {
    setMeta((m) => ({ ...m, status }));
  }, []);

  const goLive = useCallback(() => setStatus("live"), [setStatus]);
  const pause = useCallback(() => setStatus("paused"), [setStatus]);
  const resume = useCallback(() => setStatus("live"), [setStatus]);

  const endDay = useCallback(() => {
    setMeta((m) => {
      const nextDay = Math.min(m.currentDay + 1, m.totalDays);
      const newDay = nextDay === m.currentDay ? m.currentDay : nextDay;
      loadDayData(newDay);
      return {
        ...m,
        status: "waiting",
        currentDay: newDay,
      };
    });
  }, [loadDayData]);

  const setDay = useCallback(
    (newDay: number) => {
      setMeta((m) => ({
        ...m,
        currentDay: Math.max(1, Math.min(newDay, m.totalDays)),
        status: "waiting",
      }));
      loadDayData(newDay);
    },
    [loadDayData]
  );

  const isTabLiveActive = useCallback(
    (tab: "live" | "slides" | "notes" | "qa") => {
      if (tab === "qa") return meta.status === "live";
      return meta.status === "live" || meta.status === "paused";
    },
    [meta.status]
  );

  const voteQuestion = useCallback((id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || q.hasVoted) return q;
        return { ...q, votes: q.votes + 1, hasVoted: true };
      })
    );
  }, []);

  const submitQuestion = useCallback(
    (text: string) => {
      if (meta.status !== "live" || !text.trim()) return;
      const newQ = {
        id: `q-${Date.now()}`,
        text: text.trim(),
        votes: 0,
        createdAt: "just now",
        status: "open" as const,
      };
      setQuestions((prev) => [newQ, ...prev]);
    },
    [meta.status]
  );

  const addReaction = useCallback((key: keyof Reactions) => {
    setReactions((r) => ({ ...r, [key]: r[key] + 1 }));
  }, []);

  const setDisplayMode = useCallback((mode: DisplayMode, quote?: string) => {
    setDisplayModeState(mode);
    if (quote) setDisplayQuote(quote);
  }, []);

  const addClipping = useCallback(
    (clipping: Omit<Clipping, "id" | "createdAt">) => {
      setClippings((prev) => [
        ...prev,
        {
          ...clipping,
          id: `clip-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const value: SessionContextValue = {
    meta,
    subtitles,
    questions,
    notes,
    wordcloud,
    slides,
    sessionMap,
    reactions,
    displayMode,
    displayQuote,
    goLive,
    pause,
    resume,
    endDay,
    setDay,
    isTabLiveActive,
    voteQuestion,
    submitQuestion,
    addReaction,
    setDisplayMode,
    addClipping,
    clippings,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within MockSessionProvider");
  }
  return ctx;
}

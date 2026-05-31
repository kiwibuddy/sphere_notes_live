"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultMeta } from "@/lib/mock/session";
import { getSubtitlesForDay } from "@/lib/mock/subtitles";
import { getQuestionsForDay } from "@/lib/mock/questions";
import { getNotesForDay } from "@/lib/mock/notes";
import { getSlidesForDay } from "@/lib/mock/slides";
import { getSessionMapForDay } from "@/lib/mock/sessionMap";
import type { WordCloudEntry } from "@/lib/wordcloud/entries";
import {
  buildSpeechPool,
  resetWordcloudForDay,
  seedWordcloud,
  tickWordcloudFromSpeech,
} from "@/lib/wordcloud/simulation";
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
  const hasHydrated = useRef(false);
  const [meta, setMeta] = useState<SessionMeta>(defaultMeta);
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [questions, setQuestions] = useState(() =>
    getQuestionsForDay(defaultMeta.currentDay)
  );
  const [displayMode, setDisplayModeState] = useState<DisplayMode>("idle");
  const [displayQuote, setDisplayQuote] = useState("");
  const [reactions, setReactions] = useState<Reactions>({
    fire: 42,
    clap: 28,
    think: 7,
    question: 3,
  });
  const [wordcloudEntries, setWordcloudEntries] = useState<WordCloudEntry[]>(
    () => resetWordcloudForDay(defaultMeta.currentDay)
  );
  const speechPoolRef = useRef<WordCloudEntry[]>([]);

  const day = meta.currentDay;

  const subtitles = useMemo(() => getSubtitlesForDay(day), [day]);
  const notes = useMemo(() => getNotesForDay(day), [day]);
  const slides = useMemo(() => getSlidesForDay(day), [day]);
  const sessionMap = useMemo(() => getSessionMapForDay(day), [day]);

  // Restore session from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const persisted = loadPersisted();
    const nextMeta = persisted.meta
      ? { ...defaultMeta, ...persisted.meta }
      : defaultMeta;
    setMeta(nextMeta);
    setClippings(persisted.clippings ?? []);
    setQuestions(getQuestionsForDay(nextMeta.currentDay));
    setWordcloudEntries(resetWordcloudForDay(nextMeta.currentDay));
    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    speechPoolRef.current = buildSpeechPool(subtitles);
  }, [subtitles]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    setWordcloudEntries(resetWordcloudForDay(day));
  }, [day]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    savePersisted(meta, clippings);
  }, [meta, clippings]);

  // LIVE: mock speech → word cloud growth while session is live
  useEffect(() => {
    if (meta.status !== "live") return;

    const interval = setInterval(() => {
      setWordcloudEntries((prev) =>
        tickWordcloudFromSpeech(prev, speechPoolRef.current, 2)
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [meta.status]);

  const loadDayData = useCallback((newDay: number) => {
    setQuestions(getQuestionsForDay(newDay));
    setWordcloudEntries(resetWordcloudForDay(newDay));
  }, []);

  const setStatus = useCallback((status: SessionStatus) => {
    setMeta((m) => ({ ...m, status }));
  }, []);

  const goLive = useCallback(() => {
    setWordcloudEntries(seedWordcloud(speechPoolRef.current));
    setStatus("live");
  }, [setStatus]);

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
    wordcloudEntries,
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

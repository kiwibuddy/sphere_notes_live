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
import { defaultMeta, defaultDayInfo } from "@/lib/mock/session";
import { getSubtitlesForDay } from "@/lib/mock/subtitles";
import { getQuestionsForDay } from "@/lib/mock/questions";
import { getNotesForDay } from "@/lib/mock/notes";
import { getSessionMapForDay } from "@/lib/mock/sessionMap";
import { placeholderSlides } from "@/lib/slides/placeholder";
import type { WordCloudEntry } from "@/lib/wordcloud/entries";
import {
  buildSpeechPool,
  resetWordcloudForDay,
  seedWordcloud,
  tickWordcloudFromSpeech,
} from "@/lib/wordcloud/simulation";
import type {
  Clipping,
  DayInfo,
  DisplayMode,
  DisplayPayload,
  Reactions,
  SessionContextValue,
  SessionMeta,
  SessionStatus,
  SlideInfo,
} from "@/types/session";

const STORAGE_KEY = "spherenotes-session-state";

interface PersistedState {
  meta: SessionMeta;
  clippings: Clipping[];
  dayInfo: Record<number, DayInfo>;
  slideCurrentByDay: Record<number, number>;
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

function savePersisted(state: PersistedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function fetchSlidesForDay(
  day: number,
  eventTitle: string,
  current: number
): Promise<SlideInfo> {
  try {
    const res = await fetch(`/api/slides?day=${day}`);
    if (!res.ok) throw new Error("Failed to load slides");
    const data = (await res.json()) as { total: number; images: string[] };

    if (data.total === 0) {
      return placeholderSlides(day, eventTitle);
    }

    const total = data.total;
    const safeCurrent = Math.max(1, Math.min(current, total));
    return {
      current: safeCurrent,
      total,
      images: data.images,
    };
  } catch {
    return placeholderSlides(day, eventTitle);
  }
}

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const hasHydrated = useRef(false);
  const [meta, setMeta] = useState<SessionMeta>(defaultMeta);
  const [dayInfo, setDayInfo] =
    useState<Record<number, DayInfo>>(defaultDayInfo);
  const [slideCurrentByDay, setSlideCurrentByDay] = useState<
    Record<number, number>
  >({});
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [slides, setSlides] = useState<SlideInfo>(() =>
    placeholderSlides(defaultMeta.currentDay, defaultMeta.title)
  );
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [questions, setQuestions] = useState(() =>
    getQuestionsForDay(defaultMeta.currentDay)
  );
  const [displayMode, setDisplayModeState] = useState<DisplayMode>("idle");
  const [displayQuote, setDisplayQuote] = useState("");
  const [displayQuestion, setDisplayQuestion] = useState<{
    id: string;
    text: string;
    votes: number;
  } | null>(null);
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
  const sessionMap = useMemo(() => getSessionMapForDay(day), [day]);

  const getDayInfo = useCallback(
    (d: number): DayInfo => dayInfo[d] ?? defaultDayInfo[d],
    [dayInfo]
  );

  const slideCurrentByDayRef = useRef(slideCurrentByDay);
  slideCurrentByDayRef.current = slideCurrentByDay;

  const refreshSlides = useCallback(async () => {
    setSlidesLoading(true);
    const current = slideCurrentByDayRef.current[day] ?? 1;
    const next = await fetchSlidesForDay(day, meta.title, current);
    setSlides(next);
    setSlideCurrentByDay((prev) => ({ ...prev, [day]: next.current }));
    setSlidesLoading(false);
  }, [day, meta.title]);

  const setSlideCurrent = useCallback(
    (current: number) => {
      setSlides((prev) => {
        const total = Math.max(prev.total, 1);
        const safe = Math.max(1, Math.min(current, total));
        setSlideCurrentByDay((byDay) => ({ ...byDay, [day]: safe }));
        return { ...prev, current: safe };
      });
    },
    [day]
  );

  const setEventTitle = useCallback((title: string) => {
    setMeta((m) => ({ ...m, title: title.trim() || m.title }));
  }, []);

  const setDayTopic = useCallback((targetDay: number, topic: string) => {
    setDayInfo((prev) => ({
      ...prev,
      [targetDay]: {
        ...(prev[targetDay] ?? defaultDayInfo[targetDay]),
        topic: topic.trim() || (prev[targetDay]?.topic ?? `Day ${targetDay}`),
      },
    }));
  }, []);

  const setDayDate = useCallback((targetDay: number, date: string) => {
    setDayInfo((prev) => ({
      ...prev,
      [targetDay]: {
        ...(prev[targetDay] ?? defaultDayInfo[targetDay]),
        date: date.trim() || prev[targetDay]?.date || "",
      },
    }));
  }, []);

  // Restore session from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const persisted = loadPersisted();
    const nextMeta = persisted.meta
      ? { ...defaultMeta, ...persisted.meta }
      : defaultMeta;
    const nextDayInfo = persisted.dayInfo
      ? { ...defaultDayInfo, ...persisted.dayInfo }
      : defaultDayInfo;
    const nextSlideCurrent = persisted.slideCurrentByDay ?? {};

    setMeta(nextMeta);
    setDayInfo(nextDayInfo);
    setSlideCurrentByDay(nextSlideCurrent);
    setClippings(persisted.clippings ?? []);
    setQuestions(getQuestionsForDay(nextMeta.currentDay));
    setWordcloudEntries(resetWordcloudForDay(nextMeta.currentDay));
    hasHydrated.current = true;
  }, []);

  // Load slide PNGs when day or week title changes
  useEffect(() => {
    if (!hasHydrated.current) return;
    void refreshSlides();
  }, [day, meta.title, refreshSlides]);

  useEffect(() => {
    speechPoolRef.current = buildSpeechPool(subtitles);
  }, [subtitles]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    setWordcloudEntries(resetWordcloudForDay(day));
  }, [day]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    savePersisted({ meta, clippings, dayInfo, slideCurrentByDay });
  }, [meta, clippings, dayInfo, slideCurrentByDay]);

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

  const setDisplay = useCallback((mode: DisplayMode, payload?: DisplayPayload) => {
    setDisplayModeState(mode);
    if (mode === "idle") {
      setDisplayQuote("");
      setDisplayQuestion(null);
      return;
    }
    if (payload?.quoteText) setDisplayQuote(payload.quoteText);
    if (payload?.questionText && payload?.questionId) {
      setDisplayQuestion({
        id: payload.questionId,
        text: payload.questionText,
        votes: payload.questionVotes ?? 0,
      });
    }
  }, []);

  // Keep setDisplayMode as alias for any legacy callers
  const setDisplayMode = setDisplay;

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
    dayInfo,
    getDayInfo,
    setEventTitle,
    setDayTopic,
    setDayDate,
    subtitles,
    questions,
    notes,
    wordcloudEntries,
    slides,
    slidesLoading,
    refreshSlides,
    setSlideCurrent,
    sessionMap,
    reactions,
    displayMode,
    displayQuote,
    displayQuestion,
    goLive,
    pause,
    resume,
    endDay,
    setDay,
    isTabLiveActive,
    voteQuestion,
    submitQuestion,
    addReaction,
    setDisplay,
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

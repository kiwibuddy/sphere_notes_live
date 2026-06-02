"use client";

import { SessionContext } from "@/lib/session/session-context";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { wordcloudEntriesToWords } from "@/lib/archive/week";
import {
  defaultDayInfo,
  defaultMeta,
} from "@/lib/session/defaults";
import {
  buildStudentJoinUrl,
  getConfigEventId,
  isPresenterRoute,
  isStudentRoute,
  parseJoinDay,
} from "@/lib/session/join-url";
import { placeholderSlides } from "@/lib/slides/placeholder";
import { SLIDE_SYNC_DAY } from "@/lib/slides/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureSupabaseAuth } from "@/lib/session/ensure-auth";
import { withTimeout, TimeoutError } from "@/lib/session/with-timeout";
import { SessionConnectionScreen } from "@/components/setup/SessionConnectionScreen";
import {
  fetchQuestionsForDay,
  mergeQuestionRow,
  sortQuestions,
} from "@/lib/session/questions-sync";
import {
  displayModeFromRow,
  mapDayMetaRows,
  mapEventRow,
  mapNoteCards,
  mapReactionsRow,
  mapSubtitleLines,
  mapWordcloudJson,
} from "@/lib/session/supabase-mappers";
import { resetWordcloudForDay } from "@/lib/wordcloud/simulation";
import type { WordCloudEntry } from "@/lib/wordcloud/entries";
import type { Json } from "@/lib/supabase/database.types";
import type {
  Clipping,
  DayInfo,
  DisplayMode,
  DisplayPayload,
  Reactions,
  SessionContextValue,
  SessionMeta,
  SessionSegment,
  SessionStatus,
  SlideInfo,
} from "@/types/session";

const STORAGE_KEY = "spherenotes-clippings";

function loadClippings(): Clipping[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Clipping[];
  } catch {
    return [];
  }
}

function saveClippings(clippings: Clipping[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clippings));
}

async function fetchSlidesDeck(
  eventTitle: string,
  current: number
): Promise<SlideInfo> {
  try {
    const res = await fetch("/api/slides");
    if (!res.ok) throw new Error("Failed to load slides");
    const data = (await res.json()) as { total: number; images: string[] };
    if (data.total === 0) {
      return placeholderSlides(1, eventTitle);
    }
    const total = data.total;
    const safeCurrent = Math.max(1, Math.min(current, total));
    return {
      current: safeCurrent,
      total,
      images: data.images,
    };
  } catch {
    return placeholderSlides(1, eventTitle);
  }
}

function getResolvedEventId(
  pathname: string,
  urlEvent: string | null
): string {
  const configId = getConfigEventId();
  if (isStudentRoute(pathname) && urlEvent?.trim()) {
    return urlEvent.trim();
  }
  return configId;
}

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlEvent = searchParams.get("event");
  const urlDayRaw = searchParams.get("day");
  const eventId = getResolvedEventId(pathname, urlEvent);
  const isStudent = isStudentRoute(pathname);
  const isPresenter = isPresenterRoute(pathname);

  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [meta, setMeta] = useState<SessionMeta>(defaultMeta);
  const [dayInfo, setDayInfo] =
    useState<Record<number, DayInfo>>(defaultDayInfo);
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [slides, setSlides] = useState<SlideInfo>(() =>
    placeholderSlides(defaultMeta.currentDay, defaultMeta.title)
  );
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [questions, setQuestions] = useState<SessionContextValue["questions"]>(
    []
  );
  const [displayMode, setDisplayModeState] = useState<DisplayMode>("idle");
  const [displayQuote, setDisplayQuote] = useState("");
  const [displayQuestion, setDisplayQuestion] = useState<{
    id: string;
    text: string;
    votes: number;
  } | null>(null);
  const [reactions, setReactions] = useState<Reactions>({
    fire: 0,
    clap: 0,
    think: 0,
    question: 0,
  });
  const [wordcloudEntries, setWordcloudEntries] = useState<WordCloudEntry[]>(
    () => resetWordcloudForDay(defaultMeta.currentDay)
  );
  const [subtitles, setSubtitles] = useState<SessionContextValue["subtitles"]>(
    []
  );
  const [notes, setNotes] = useState<SessionContextValue["notes"]>([]);
  const [sessionMap, setSessionMap] = useState<SessionSegment[]>([]);
  const votedIdsRef = useRef<Set<string>>(new Set());
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const markReady = useCallback(() => {
    setReady(true);
  }, []);

  const activeDay = useMemo(() => {
    if (isStudent) {
      return parseJoinDay(urlDayRaw, meta.totalDays, meta.currentDay);
    }
    return meta.currentDay;
  }, [isStudent, urlDayRaw, meta.totalDays, meta.currentDay]);

  const studentJoinUrl = useMemo(
    () => buildStudentJoinUrl(eventId, isPresenter ? meta.currentDay : activeDay),
    [eventId, isPresenter, meta.currentDay, activeDay]
  );

  const getDayInfo = useCallback(
    (d: number): DayInfo => dayInfo[d] ?? defaultDayInfo[d],
    [dayInfo]
  );

  const refreshSlides = useCallback(async () => {
    setSlidesLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data: slideRow } = await supabase
      .from("day_slides")
      .select("current")
      .eq("event_id", eventId)
      .eq("day", SLIDE_SYNC_DAY)
      .maybeSingle();
    const current = slideRow?.current ?? 1;
    const next = await fetchSlidesDeck(meta.title, current);
    setSlides(next);
    setSlidesLoading(false);
  }, [meta.title, eventId]);

  const setSlideCurrent = useCallback(
    async (current: number) => {
      const total = Math.max(slides.total, 1);
      const safe = Math.max(1, Math.min(current, total));
      setSlides((prev) => ({ ...prev, current: safe }));
      const supabase = getSupabaseBrowserClient();
      await supabase
        .from("day_slides")
        .update({ current: safe, total, updated_at: new Date().toISOString() })
        .eq("event_id", eventId)
        .eq("day", SLIDE_SYNC_DAY);
    },
    [slides.total, eventId]
  );

  useEffect(() => {
    let cancelled = false;
    setClippings(loadClippings());
    setSessionError(null);

    const supabase = getSupabaseBrowserClient();

    const fail = (msg: string) => {
      if (cancelled) return;
      setSessionError(msg);
      markReady();
    };

    async function run() {
      try {
        const eventResult = await withTimeout(
          supabase.from("events").select("*").eq("id", eventId).single(),
          12_000,
          "Could not reach Supabase"
        );
        if (cancelled) return;

        if (eventResult.error) {
          fail(
            eventResult.error.message.includes("JWT")
              ? "Invalid Supabase API key — check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
              : `Session load failed: ${eventResult.error.message}`
          );
          return;
        }

        const event = eventResult.data;
        if (event) setMeta(mapEventRow(event));

        const fetchDay = isStudent
          ? parseJoinDay(
              urlDayRaw,
              event?.total_days ?? defaultMeta.totalDays,
              event?.current_day ?? defaultMeta.currentDay
            )
          : event?.current_day ?? defaultMeta.currentDay;

        const eventTitle = event?.title ?? defaultMeta.title;

        markReady();

        void withTimeout(ensureSupabaseAuth(), 8_000, "Anonymous sign-in")
          .then((uid) => {
            if (cancelled) return;
            setUserId(uid);
            void fetchQuestionsForDay(
              supabase,
              eventId,
              fetchDay,
              uid,
              votedIdsRef.current
            ).then((q) => {
              if (!cancelled) setQuestions(q);
            });
          })
          .catch((err: unknown) => {
            console.warn("[session] auth skipped or timed out", err);
          });

        const critical = await withTimeout(
          Promise.all([
            supabase.from("day_meta").select("*").eq("event_id", eventId),
            supabase
              .from("day_display")
              .select("*")
              .eq("event_id", eventId)
              .eq("day", fetchDay)
              .maybeSingle(),
            supabase
              .from("day_slides")
              .select("current,total")
              .eq("event_id", eventId)
              .eq("day", SLIDE_SYNC_DAY)
              .maybeSingle(),
            supabase
              .from("day_reactions")
              .select("*")
              .eq("event_id", eventId)
              .eq("day", fetchDay)
              .maybeSingle(),
          ]),
          12_000,
          "Loading session data"
        );
        if (cancelled) return;

        const [
          { data: metaRows },
          { data: displayRow },
          { data: slideRow },
          { data: reactionRow },
        ] = critical;

        if (metaRows?.length) {
          setDayInfo({ ...defaultDayInfo, ...mapDayMetaRows(metaRows) });
        }

        if (displayRow) {
          const d = displayModeFromRow(displayRow);
          setDisplayModeState(d.mode);
          setDisplayQuote(d.quote);
          setDisplayQuestion(d.question);
        }

        if (reactionRow) setReactions(mapReactionsRow(reactionRow));

        const slideCurrent = slideRow?.current ?? 1;
        if (slideRow?.total) {
          setSlides((prev) => ({
            ...prev,
            current: Math.min(slideCurrent, slideRow.total),
            total: slideRow.total,
          }));
        }

        void fetchSlidesDeck(eventTitle, slideCurrent).then(
          (slideInfo) => {
            if (cancelled) return;
            if (slideRow?.total) {
              slideInfo.total = slideRow.total;
              slideInfo.current = Math.min(slideCurrent, slideRow.total);
            }
            setSlides(slideInfo);
          }
        );

        void Promise.all([
          supabase
            .from("day_subtitles")
            .select("lines")
            .eq("event_id", eventId)
            .eq("day", fetchDay)
            .maybeSingle(),
          supabase
            .from("day_wordcloud")
            .select("words")
            .eq("event_id", eventId)
            .eq("day", fetchDay)
            .maybeSingle(),
          supabase
            .from("note_cards")
            .select("*")
            .eq("event_id", eventId)
            .eq("day", fetchDay)
            .order("created_at", { ascending: true }),
          supabase
            .from("session_segments")
            .select("*")
            .eq("event_id", eventId)
            .eq("day", fetchDay)
            .order("sort_order", { ascending: true }),
        ]).then(
          ([
            { data: subtitleRow },
            { data: wordRow },
            { data: noteRows },
            { data: segmentRows },
          ]) => {
            if (cancelled) return;
            if (subtitleRow?.lines) {
              setSubtitles(mapSubtitleLines(subtitleRow.lines));
            }
            if (wordRow?.words && typeof wordRow.words === "object") {
              const mapped = mapWordcloudJson(
                wordRow.words as Record<
                  string,
                  { count: number; category: string; lastAt: string }
                >
              );
              setWordcloudEntries(mapped.length ? mapped : []);
            }
            setNotes(noteRows?.length ? mapNoteCards(noteRows) : []);
            if (segmentRows?.length) {
              setSessionMap(
                segmentRows.map((s) => ({
                  id: s.id,
                  title: s.title,
                  startTime: s.start_time,
                  noteIds: Array.isArray(s.note_ids)
                    ? (s.note_ids as string[])
                    : [],
                }))
              );
            }
          }
        );
      } catch (err) {
        const msg =
          err instanceof TimeoutError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Unknown connection error";
        console.error("[session] load failed", err);
        fail(msg);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [eventId, urlDayRaw, isStudent, markReady, reloadToken]);

  useEffect(() => {
    saveClippings(clippings);
  }, [clippings]);

  // Realtime — subscribe as soon as core session is ready; refetch on connect
  useEffect(() => {
    if (!ready) return;
    const supabase = getSupabaseBrowserClient();

    const refetchQuestions = () => {
      void fetchQuestionsForDay(
        supabase,
        eventId,
        activeDay,
        userId,
        votedIdsRef.current
      ).then(setQuestions);
    };

    const channel = supabase
      .channel(`session-${eventId}-${activeDay}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          setMeta(mapEventRow(payload.new as Parameters<typeof mapEventRow>[0]));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "day_meta",
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          const { data } = await supabase
            .from("day_meta")
            .select("*")
            .eq("event_id", eventId);
          if (data?.length) {
            setDayInfo({ ...defaultDayInfo, ...mapDayMetaRows(data) });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "day_display",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            day: number;
            mode: string;
            quote_text: string;
            question_id: string | null;
            question_text: string | null;
            question_votes: number;
          };
          if (row.day !== activeDay) return;
          const d = displayModeFromRow(row);
          setDisplayModeState(d.mode);
          setDisplayQuote(d.quote);
          setDisplayQuestion(d.question);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "day_slides",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const row = payload.new as { day: number; current: number; total: number };
          if (row.day !== SLIDE_SYNC_DAY) return;
          setSlides((prev) => ({
            ...prev,
            current: row.current,
            total: row.total || prev.total,
          }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "day_reactions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as { day: number } & Reactions;
          if (row.day !== activeDay) return;
          setReactions(mapReactionsRow(row));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            day: number;
            text: string;
            votes: number;
            status: string;
            created_at: string;
          };
          if (row.day !== activeDay) return;
          setQuestions((prev) =>
            sortQuestions([
              mergeQuestionRow(row, votedIdsRef.current),
              ...prev.filter((q) => q.id !== row.id),
            ])
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            day: number;
            text: string;
            votes: number;
            status: string;
            created_at: string;
          };
          if (row.day !== activeDay) return;
          setQuestions((prev) =>
            sortQuestions(
              prev.map((q) =>
                q.id === row.id
                  ? mergeQuestionRow(row, votedIdsRef.current)
                  : q
              )
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "day_subtitles",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as { day: number; lines: unknown };
          if (row.day !== activeDay) return;
          setSubtitles(mapSubtitleLines(row.lines));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "note_cards",
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          const { data } = await supabase
            .from("note_cards")
            .select("*")
            .eq("event_id", eventId)
            .eq("day", activeDay)
            .order("created_at", { ascending: true });
          setNotes(data?.length ? mapNoteCards(data) : []);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "day_wordcloud",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as { day: number; words: unknown };
          if (row.day !== activeDay) return;
          if (row.words && typeof row.words === "object") {
            setWordcloudEntries(
              mapWordcloudJson(
                row.words as Record<
                  string,
                  { count: number; category: string; lastAt: string }
                >
              )
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          refetchQuestions();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [ready, eventId, activeDay, userId]);

  const setEventTitle = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      setMeta((m) => ({ ...m, title: trimmed }));
      const supabase = getSupabaseBrowserClient();
      await supabase
        .from("events")
        .update({ title: trimmed, updated_at: new Date().toISOString() })
        .eq("id", eventId);
    },
    [eventId]
  );

  const setDayTopic = useCallback(
    async (targetDay: number, topic: string) => {
      const trimmed = topic.trim();
      setDayInfo((prev) => ({
        ...prev,
        [targetDay]: {
          ...(prev[targetDay] ?? defaultDayInfo[targetDay]),
          topic: trimmed || (prev[targetDay]?.topic ?? `Day ${targetDay}`),
        },
      }));
      const supabase = getSupabaseBrowserClient();
      await supabase.from("day_meta").upsert({
        event_id: eventId,
        day: targetDay,
        topic: trimmed,
        date: dayInfo[targetDay]?.date ?? "",
      });
    },
    [eventId, dayInfo]
  );

  const setDayDate = useCallback(
    async (targetDay: number, date: string) => {
      const trimmed = date.trim();
      setDayInfo((prev) => ({
        ...prev,
        [targetDay]: {
          ...(prev[targetDay] ?? defaultDayInfo[targetDay]),
          date: trimmed || prev[targetDay]?.date || "",
        },
      }));
      const supabase = getSupabaseBrowserClient();
      await supabase.from("day_meta").upsert({
        event_id: eventId,
        day: targetDay,
        topic: dayInfo[targetDay]?.topic ?? `Day ${targetDay}`,
        date: trimmed,
      });
    },
    [eventId, dayInfo]
  );

  const setStatus = useCallback(
    async (status: SessionStatus) => {
      setMeta((m) => ({ ...m, status }));
      const supabase = getSupabaseBrowserClient();
      const patch: {
        status: SessionStatus;
        updated_at: string;
        started_at?: string | null;
      } = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === "live") {
        patch.started_at = new Date().toISOString();
      }
      await supabase.from("events").update(patch).eq("id", eventId);
    },
    [eventId]
  );

  const goLive = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const day = meta.currentDay;
    await supabase
      .from("day_subtitles")
      .update({
        lines: [],
        full_transcript: "",
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .eq("day", day);
    setSubtitles([]);
    setWordcloudEntries(resetWordcloudForDay(day));
    await setStatus("live");
  }, [setStatus, eventId, meta.currentDay]);

  const pause = useCallback(async () => {
    await setStatus("paused");
  }, [setStatus]);

  const resume = useCallback(async () => {
    await setStatus("live");
  }, [setStatus]);

  const endDay = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const archivingDay = meta.currentDay;
    const info = dayInfo[archivingDay] ?? defaultDayInfo[archivingDay];

    await supabase.from("day_archives").upsert({
      event_id: eventId,
      day: archivingDay,
      archived_at: new Date().toISOString(),
      snapshot: {
        label: info?.topic ?? `Day ${archivingDay}`,
        date: info?.date ?? "",
        subtitles,
        questions,
        notes,
        slides: {
          current: slides.current,
          total: slides.total,
          images: slides.images,
        },
        wordcloud: wordcloudEntriesToWords(wordcloudEntries),
        sessionMap,
      } as unknown as Json,
    });

    const nextDay = Math.min(meta.currentDay + 1, meta.totalDays);
    const newDay = nextDay === meta.currentDay ? meta.currentDay : nextDay;
    await supabase
      .from("events")
      .update({
        status: "waiting",
        current_day: newDay,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);
    setMeta((m) => ({
      ...m,
      status: "waiting",
      currentDay: newDay,
    }));
    setWordcloudEntries(resetWordcloudForDay(newDay));
    setSubtitles([]);
    setNotes([]);
    setSessionMap([]);
  }, [
    eventId,
    meta.currentDay,
    meta.totalDays,
    dayInfo,
    subtitles,
    questions,
    notes,
    slides,
    wordcloudEntries,
    sessionMap,
  ]);

  const setDay = useCallback(
    async (newDay: number) => {
      const safe = Math.max(1, Math.min(newDay, meta.totalDays));
      const supabase = getSupabaseBrowserClient();
      await supabase
        .from("events")
        .update({
          current_day: safe,
          status: "waiting",
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);
      setMeta((m) => ({ ...m, currentDay: safe, status: "waiting" }));
      setWordcloudEntries(resetWordcloudForDay(safe));
    },
    [eventId, meta.totalDays]
  );

  const isTabLiveActive = useCallback(
    (tab: "live" | "slides" | "notes" | "qa") => {
      if (tab === "qa") return meta.status === "live";
      return meta.status === "live" || meta.status === "paused";
    },
    [meta.status]
  );

  const voteQuestion = useCallback(
    async (id: string) => {
      if (!userId || votedIdsRef.current.has(id)) return;
      const supabase = getSupabaseBrowserClient();
      const q = questions.find((x) => x.id === id);
      if (!q || q.hasVoted) return;

      const { error: voteErr } = await supabase.from("question_votes").insert({
        question_id: id,
        voter_id: userId,
      });
      if (voteErr) return;

      votedIdsRef.current.add(id);
      await supabase
        .from("questions")
        .update({ votes: q.votes + 1 })
        .eq("id", id);

      setQuestions((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, votes: item.votes + 1, hasVoted: true }
            : item
        )
      );
    },
    [userId, questions]
  );

  const submitQuestion = useCallback(
    async (text: string) => {
      if (meta.status !== "live" || !text.trim()) return;
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("questions")
        .insert({
          event_id: eventId,
          day: activeDay,
          text: text.trim(),
        })
        .select("*")
        .single();

      if (error || !data) return;

      setQuestions((prev) =>
        sortQuestions([
          mergeQuestionRow(data, votedIdsRef.current),
          ...prev.filter((q) => q.id !== data.id),
        ])
      );
    },
    [meta.status, eventId, activeDay]
  );

  const addReaction = useCallback(
    async (key: keyof Reactions) => {
      const supabase = getSupabaseBrowserClient();
      const next = { ...reactions, [key]: reactions[key] + 1 };
      setReactions(next);
      await supabase
        .from("day_reactions")
        .update({
          fire: next.fire,
          clap: next.clap,
          think: next.think,
          question: next.question,
        })
        .eq("event_id", eventId)
        .eq("day", activeDay);
    },
    [reactions, eventId, activeDay]
  );

  const setDisplay = useCallback(
    async (mode: DisplayMode, payload?: DisplayPayload) => {
      setDisplayModeState(mode);
      let quote = displayQuote;
      let question = displayQuestion;
      if (mode === "idle") {
        quote = "";
        question = null;
      }
      if (payload?.quoteText) quote = payload.quoteText;
      if (payload?.questionText && payload?.questionId) {
        question = {
          id: payload.questionId,
          text: payload.questionText,
          votes: payload.questionVotes ?? 0,
        };
      }
      setDisplayQuote(quote);
      setDisplayQuestion(question);

      const supabase = getSupabaseBrowserClient();
      await supabase
        .from("day_display")
        .update({
          mode,
          quote_text: quote,
          question_id: question?.id ?? null,
          question_text: question?.text ?? null,
          question_votes: question?.votes ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq("event_id", eventId)
        .eq("day", meta.currentDay);
    },
    [displayQuote, displayQuestion, eventId, meta.currentDay]
  );

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
    activeDay,
    joinEventId: eventId,
    studentJoinUrl,
    sessionReady: ready,
  };

  if (!ready) {
    return (
      <SessionConnectionScreen
        message="Connecting to session…"
        error={sessionError}
        onRetry={
          sessionError
            ? () => {
                setReady(false);
                setSessionError(null);
                setReloadToken((t) => t + 1);
              }
            : undefined
        }
      />
    );
  }

  if (sessionError) {
    return (
      <>
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-900">
          {sessionError}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              setSessionError(null);
              setReady(false);
              setReloadToken((t) => t + 1);
            }}
          >
            Retry
          </button>
        </div>
        <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
      </>
    );
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

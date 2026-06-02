"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildLiveDayArchive,
  emptyDayArchive,
  parseArchiveSnapshot,
} from "@/lib/archive/week";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/session/session-context";
import type { DayArchive } from "@/types/session";

const EVENT_ID =
  process.env.NEXT_PUBLIC_EVENT_ID ?? "biblical-worldview-2026";

export type DayArchiveSource = "live" | "stored";

export function useDayArchive(
  day: number,
  source: DayArchiveSource = "stored"
): {
  archive: DayArchive;
  loading: boolean;
  isLiveDay: boolean;
} {
  const session = useSession();
  const { meta, dayInfo, subtitles, questions, notes, slides, wordcloudEntries, sessionMap } =
    session;

  const isLiveDay = source === "live";
  const [stored, setStored] = useState<DayArchive | null>(null);
  const [loading, setLoading] = useState(!isLiveDay);

  useEffect(() => {
    if (isLiveDay) {
      setStored(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("day_archives")
        .select("snapshot")
        .eq("event_id", EVENT_ID)
        .eq("day", day)
        .maybeSingle();

      if (cancelled) return;

      const parsed = data?.snapshot
        ? parseArchiveSnapshot(day, meta, dayInfo, data.snapshot)
        : null;
      setStored(parsed);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [day, isLiveDay, meta, dayInfo]);

  const archive = useMemo(() => {
    if (isLiveDay) {
      return buildLiveDayArchive(day, meta, dayInfo, {
        subtitles,
        questions,
        notes,
        slides,
        wordcloudEntries,
        sessionMap,
      });
    }
    if (stored) return stored;
    return emptyDayArchive(day, meta, dayInfo);
  }, [
    isLiveDay,
    day,
    meta,
    dayInfo,
    stored,
    subtitles,
    questions,
    notes,
    slides,
    wordcloudEntries,
    sessionMap,
  ]);

  return { archive, loading, isLiveDay };
}

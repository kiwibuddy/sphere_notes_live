"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getConfigEventId } from "@/lib/session/join-url";

export type WeekArchiveListItem = {
  day: number;
  label: string;
  date: string;
  archivedAt: string;
};

export function useWeekArchiveList(): {
  archives: WeekArchiveListItem[];
  loading: boolean;
} {
  const eventId = getConfigEventId();
  const [archives, setArchives] = useState<WeekArchiveListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("day_archives")
        .select("day, archived_at, snapshot")
        .eq("event_id", eventId)
        .order("day", { ascending: false });

      if (cancelled) return;

      const items: WeekArchiveListItem[] = (data ?? []).map((row) => {
        const snap =
          row.snapshot && typeof row.snapshot === "object"
            ? (row.snapshot as Record<string, unknown>)
            : {};
        return {
          day: row.day,
          label:
            (typeof snap.label === "string" && snap.label.trim()) ||
            `Session ${row.day}`,
          date: typeof snap.date === "string" ? snap.date : "",
          archivedAt: row.archived_at,
        };
      });
      setArchives(items);
      setLoading(false);
    };

    void load();

    const channel = supabase
      .channel(`week-archives-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "day_archives",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [eventId]);

  return { archives, loading };
}

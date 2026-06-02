"use client";

import { useSession } from "@/lib/session/session-context";
import { useStudentPathBuilder } from "@/hooks/useStudentHref";
import { useDayArchive, type DayArchiveSource } from "@/hooks/useDayArchive";
import { useWeekArchiveList } from "@/hooks/useWeekArchiveList";
import { WeekArchivePanel } from "@/components/week/WeekArchivePanel";
import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type WeekSelection =
  | { kind: "live" }
  | { kind: "archive"; day: number };

export default function WeekPage() {
  const { getSessionInfo } = useSession();
  const studentPath = useStudentPathBuilder();
  const { archives, loading: listLoading } = useWeekArchiveList();
  const sessionInfo = getSessionInfo();

  const [selection, setSelection] = useState<WeekSelection>({ kind: "live" });

  useEffect(() => {
    if (selection.kind === "archive") {
      const stillExists = archives.some((a) => a.day === selection.day);
      if (!stillExists && archives.length > 0) {
        setSelection({ kind: "archive", day: archives[0].day });
      }
    }
  }, [archives, selection]);

  const archiveDay =
    selection.kind === "live" ? LIVE_SYNC_DAY : selection.day;
  const archiveSource: DayArchiveSource =
    selection.kind === "live" ? "live" : "stored";
  const { archive, loading: archiveLoading } = useDayArchive(
    archiveDay,
    archiveSource
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <div className="shrink-0 border-b border-border p-4 md:w-72 md:border-b-0 md:border-r md:p-6">
        <p className="mb-4 text-sm text-muted">
          Review past sessions. Archived days are read-only (saved on End Day).
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSelection({ kind: "live" })}
            className={cn(
              "flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors hover:bg-surface",
              selection.kind === "live"
                ? "bg-surface shadow-card ring-1 ring-border"
                : "bg-transparent"
            )}
          >
            <div>
              <p className="font-medium text-foreground">
                {sessionInfo.topic.trim() || "Current session"}
                <span className="ml-2 text-xs font-normal text-live-active">
                  Active
                </span>
              </p>
              <p className="text-xs text-muted">
                {sessionInfo.date || "—"} · Live bucket (resets on End Day)
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted md:hidden" />
          </button>

          {listLoading && (
            <p className="px-4 text-xs text-muted">Loading archives…</p>
          )}

          {archives.map((item) => (
            <button
              key={item.day}
              type="button"
              onClick={() =>
                setSelection({ kind: "archive", day: item.day })
              }
              className={cn(
                "flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors hover:bg-surface",
                selection.kind === "archive" && selection.day === item.day
                  ? "bg-surface shadow-card ring-1 ring-border"
                  : "bg-transparent"
              )}
            >
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted">{item.date || "—"}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted md:hidden" />
            </button>
          ))}
        </div>

        <div className="mt-4 md:hidden">
          <Link
            href={studentPath(
              selection.kind === "live"
                ? "/student/week/live"
                : `/student/week/${selection.day}`
            )}
            className="block rounded-lg bg-tab-week/10 px-4 py-3 text-center text-sm font-medium text-foreground"
          >
            Open {archive.label} full screen
          </Link>
        </div>
      </div>

      <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex md:p-6">
        <div className="mb-4">
          <p className="font-display text-xl text-foreground">{archive.label}</p>
          <p className="text-sm text-muted">
            {archive.date || "—"} ·{" "}
            {selection.kind === "live" ? "Current session" : "Read-only"}
            {archiveLoading && " · Loading…"}
          </p>
        </div>
        <WeekArchivePanel archive={archive} />
      </div>
    </div>
  );
}

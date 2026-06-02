"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDayArchive } from "@/hooks/useDayArchive";
import { WeekArchivePanel } from "@/components/week/WeekArchivePanel";
import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import { ArrowLeft } from "lucide-react";

export default function DayArchivePage() {
  const params = useParams();
  const raw = params.day as string;
  const isLiveRoute = raw === "live";
  const day = isLiveRoute ? LIVE_SYNC_DAY : Number(raw);
  const { archive, loading } = useDayArchive(
    day,
    isLiveRoute ? "live" : "stored"
  );

  if (!isLiveRoute && (Number.isNaN(day) || day < 1)) {
    return (
      <div className="p-8 text-center text-muted">
        Session not found.{" "}
        <Link href="/student/week" className="text-tab-live underline">
          Back to Week
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/student/week" className="text-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="font-display text-lg text-foreground">{archive.label}</p>
          <p className="text-xs text-muted">
            {archive.date || "—"} ·{" "}
            {isLiveRoute ? "Current session" : "Read-only"}
            {loading && " · Loading…"}
          </p>
        </div>
      </div>
      <WeekArchivePanel archive={archive} source={isLiveRoute ? "live" : "stored"} />
    </div>
  );
}

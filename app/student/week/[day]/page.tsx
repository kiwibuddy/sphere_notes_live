"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { buildDayArchive } from "@/lib/mock/week";
import { useSession } from "@/lib/session/context";
import { WeekArchivePanel } from "@/components/week/WeekArchivePanel";
import { ArrowLeft } from "lucide-react";

export default function DayArchivePage() {
  const params = useParams();
  const day = Number(params.day);
  const { meta } = useSession();
  const archive = buildDayArchive(day, meta.currentDay);

  if (Number.isNaN(day) || day < 1 || day > 4) {
    return (
      <div className="p-8 text-center text-muted">
        Day not found.{" "}
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
          <p className="text-xs text-muted">{archive.date} · Read-only</p>
        </div>
      </div>
      <WeekArchivePanel archive={archive} />
    </div>
  );
}

"use client";

import { useSession } from "@/lib/session/context";
import { getWeekDays, buildDayArchive } from "@/lib/mock/week";
import { WeekArchivePanel } from "@/components/week/WeekArchivePanel";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export default function WeekPage() {
  const { meta } = useSession();
  const days = getWeekDays(meta.currentDay);
  const selectableDays = days.filter((d) => d.status !== "upcoming");
  const defaultDay =
    selectableDays.find((d) => d.status === "today")?.day ??
    selectableDays[selectableDays.length - 1]?.day ??
    1;

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const archive = buildDayArchive(selectedDay, meta.currentDay);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      {/* Day list */}
      <div className="shrink-0 border-b border-border p-4 md:w-72 md:border-b-0 md:border-r md:p-6">
        <p className="mb-4 text-sm text-muted">
          Review past sessions. Archived days are read-only.
        </p>
        <div className="space-y-2">
          {days.map((day) => (
            <button
              key={day.day}
              type="button"
              disabled={day.status === "upcoming"}
              onClick={() => day.status !== "upcoming" && setSelectedDay(day.day)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors",
                day.status === "upcoming" && "pointer-events-none opacity-50",
                day.status !== "upcoming" && "hover:bg-surface",
                selectedDay === day.day && day.status !== "upcoming"
                  ? "bg-surface shadow-card ring-1 ring-border"
                  : "bg-transparent"
              )}
            >
              <div>
                <p className="font-medium text-foreground">
                  {day.label}
                  {day.status === "today" && (
                    <span className="ml-2 text-xs font-normal text-live-active">
                      Today
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">{day.date}</p>
              </div>
              {day.status !== "upcoming" && (
                <ChevronRight className="h-4 w-4 text-muted md:hidden" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile: link to full-page archive */}
        <div className="mt-4 md:hidden">
          <Link
            href={`/student/week/${selectedDay}`}
            className="block rounded-lg bg-tab-week/10 px-4 py-3 text-center text-sm font-medium text-foreground"
          >
            Open {archive.label} full screen
          </Link>
        </div>
      </div>

      {/* Archive panel — tablet/desktop master-detail */}
      <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex md:p-6">
        <div className="mb-4">
          <p className="font-display text-xl text-foreground">{archive.label}</p>
          <p className="text-sm text-muted">{archive.date} · Read-only</p>
        </div>
        <WeekArchivePanel archive={archive} />
      </div>
    </div>
  );
}

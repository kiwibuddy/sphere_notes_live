"use client";

import Link from "next/link";
import { useSession } from "@/lib/session/context";
import { getWeekDays } from "@/lib/mock/week";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function WeekPage() {
  const { meta } = useSession();
  const days = getWeekDays(meta.currentDay);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="mb-4 text-sm text-muted">
        Review past sessions. Archived days are read-only.
      </p>
      <div className="space-y-2">
        {days.map((day) => (
          <Link
            key={day.day}
            href={
              day.status === "upcoming"
                ? "#"
                : `/student/week/${day.day}`
            }
            className={cn(
              "flex items-center justify-between rounded-lg bg-surface p-4 shadow-card transition-colors",
              day.status === "upcoming" && "pointer-events-none opacity-50",
              day.status === "today" && "ring-1 ring-live-active/30",
              day.status !== "upcoming" && "hover:bg-background"
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
              <ChevronRight className="h-4 w-4 text-muted" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

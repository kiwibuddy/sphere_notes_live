"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/context";
import {
  formatInternalDaySlot,
  formatSessionHeader,
} from "@/lib/session/day-label";
import { cn } from "@/lib/utils";

/** Presenter-only: jump to day 1–4 (updates join QR + speech sync). */
export function TeachingDayPicker() {
  const { meta, setDay, getDayInfo } = useSession();

  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-semibold text-foreground">Event day slot</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Internal counter (1–4). iPad <strong>End Day</strong> moves to the next
        slot. Set the topic for each slot below — that is what students see
        (e.g. Introduction).
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: meta.totalDays }, (_, i) => i + 1).map((d) => (
          <Button
            key={d}
            type="button"
            size="sm"
            variant={d === meta.currentDay ? "default" : "outline"}
            className={cn(
              d === meta.currentDay && "bg-foreground text-background"
            )}
            onClick={() => {
              if (d !== meta.currentDay) void setDay(d);
            }}
          >
            Day {d}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">
        Active: {formatSessionHeader(getDayInfo(meta.currentDay), meta.currentDay)}
        <span className="block mt-1 text-[10px]">
          {formatInternalDaySlot(meta.currentDay, meta.totalDays)}
        </span>
      </p>
    </div>
  );
}

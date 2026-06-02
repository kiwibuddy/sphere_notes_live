"use client";

import { SendToMineButton } from "@/components/cards/SendToMineButton";
import type { SessionSegment } from "@/types/session";
import { cn } from "@/lib/utils";

interface SessionOverviewProps {
  segments: SessionSegment[];
  onSendToMine?: (text: string) => void;
}

export function SessionOverview({
  segments,
  onSendToMine,
}: SessionOverviewProps) {
  return (
    <div className="space-y-0">
      {segments.map((seg, i) => (
        <div key={seg.id} className="relative flex gap-4 pb-6">
          {i < segments.length - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          )}
          <span
            className={cn(
              "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-tab-overview bg-surface",
              i === segments.length - 1 && "border-live-active bg-live-active"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs tabular-nums text-muted">{seg.startTime}</p>
            <p className="mt-0.5 font-medium text-foreground">{seg.title}</p>
            {seg.noteIds.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {seg.noteIds.length} note
                {seg.noteIds.length !== 1 ? "s" : ""} linked
              </p>
            )}
          </div>
        </div>
      ))}
      {onSendToMine && segments.length > 0 && (
        <div className="flex justify-end pt-2">
          <SendToMineButton
            onSend={() =>
              onSendToMine(
                segments.map((s) => `${s.startTime} — ${s.title}`).join("\n")
              )
            }
          />
        </div>
      )}
    </div>
  );
}

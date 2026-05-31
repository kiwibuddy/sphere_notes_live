"use client";

import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/session/context";
import { dayLabels } from "@/lib/mock/session";
import { cn } from "@/lib/utils";

export function SessionHeader() {
  const { meta } = useSession();
  const dayInfo = dayLabels[meta.currentDay];

  return (
    <header className="shrink-0 border-b border-border px-5 pb-3 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl leading-tight text-foreground">
            {meta.title}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {dayInfo.label} · {dayInfo.date} · {meta.presenter}
          </p>
        </div>
        <StatusChip status={meta.status} />
      </div>
    </header>
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === "live") {
    return (
      <Badge variant="live" className="shrink-0 uppercase tracking-wider">
        <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-live-chip" />
        Live
      </Badge>
    );
  }
  if (status === "paused") {
    return (
      <Badge variant="muted" className="shrink-0 uppercase tracking-wider">
        Paused
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0 text-muted uppercase tracking-wider">
      Waiting
    </Badge>
  );
}

export function WaitingOverlay({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 px-8 backdrop-blur-sm">
      <p className="text-center text-sm text-muted">{message}</p>
    </div>
  );
}

export function tabAccentClass(
  tab: string,
  isActive: boolean,
  isLive: boolean
) {
  if (!isLive && tab !== "week" && tab !== "qa") {
    return "text-live-waiting";
  }
  const colors: Record<string, string> = {
    live: "text-tab-live",
    qa: "text-tab-qa",
    slides: "text-tab-slides",
    notes: "text-tab-notes",
    week: "text-tab-week",
  };
  return cn(isActive ? colors[tab] : "text-muted");
}

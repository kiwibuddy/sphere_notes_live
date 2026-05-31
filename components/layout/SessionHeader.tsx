"use client";

import { Badge } from "@/components/ui/badge";
import { ReactionsInline } from "@/components/layout/ReactionsInline";
import { useSession } from "@/lib/session/context";

export function SessionHeader() {
  const { meta, getDayInfo } = useSession();
  const dayInfo = getDayInfo(meta.currentDay);

  return (
    <header className="shrink-0 border-b border-border px-4 pb-3 pt-3 md:px-6 md:pb-4 md:pt-4 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl leading-tight text-foreground md:text-2xl lg:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 text-xs text-muted md:text-sm">
            {dayInfo.topic} · {dayInfo.date} · {meta.presenter}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ReactionsInline />
          <StatusChip status={meta.status} />
        </div>
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
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background px-8">
      <p className="max-w-md text-center text-sm text-muted md:text-base">
        {message}
      </p>
    </div>
  );
}

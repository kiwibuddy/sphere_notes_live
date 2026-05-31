"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { WordCloudCanvas } from "@/components/notes/WordCloudCanvas";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";
import { entryCount, filterWordcloud } from "@/lib/wordcloud/entries";
import type { WordCloudMode } from "@/types/session";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export default function CloudNotesPage() {
  const { wordcloudEntries, meta, isTabLiveActive } = useSession();
  const sendToMine = useSendToMine();
  const [mode, setMode] = useState<WordCloudMode>("session");
  const [tick, setTick] = useState(0);
  const isLive = isTabLiveActive("notes");
  const showContent = isLive || meta.status === "paused";

  // Re-filter 5 min window as time passes
  useEffect(() => {
    if (mode !== "5min" || meta.status !== "live") return;
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, [mode, meta.status]);

  const filtered = useMemo(
    () => filterWordcloud(wordcloudEntries, mode, Date.now()),
    // tick forces 5 min window to refresh as time passes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wordcloudEntries, mode, tick]
  );

  const wordCount = useMemo(
    () => entryCount(wordcloudEntries, mode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wordcloudEntries, mode, tick]
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2 md:px-6">
        <div className="flex rounded-lg bg-background p-0.5">
          {(["session", "5min"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium md:text-sm",
                mode === m
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {m === "session" ? "Session" : "5 min"}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted md:text-sm">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
          {meta.status === "live" && (
            <span className="ml-2 text-live-active">· growing live</span>
          )}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 p-2 md:p-4">
        <WaitingOverlay
          show={!showContent}
          message="Word cloud builds from live speech when the session starts."
        />
        {showContent && (
          <WordCloudCanvas
            words={filtered}
            mode={mode}
            onSendToMine={({ text, imageData }) =>
              sendToMine(text, "cloud", "Word Cloud", { imageData })
            }
          />
        )}
      </div>
    </div>
  );
}

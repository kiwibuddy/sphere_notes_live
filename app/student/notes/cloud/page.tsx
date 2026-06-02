"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { WordCloudCanvas } from "@/components/notes/WordCloudCanvas";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";
import {
  entryCount,
  filterWordcloud,
  liveResetStorageKey,
} from "@/lib/wordcloud/entries";
import type { WordCloudMode } from "@/types/session";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CloudNotesPage() {
  const { wordcloudEntries, meta, isTabLiveActive, joinEventId } = useSession();
  const sendToMine = useSendToMine();
  const [mode, setMode] = useState<WordCloudMode>("live");
  const [liveSince, setLiveSince] = useState(() => Date.now());
  const isLive = isTabLiveActive("notes");
  const showContent = isLive || meta.status === "paused";

  const storageKey = liveResetStorageKey(joinEventId);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    const parsed = parseInt(stored, 10);
    if (!Number.isNaN(parsed)) setLiveSince(parsed);
  }, [storageKey]);

  const resetLiveView = useCallback(() => {
    const now = Date.now();
    setLiveSince(now);
    localStorage.setItem(storageKey, String(now));
  }, [storageKey]);

  const filterOptions = useMemo(
    () => (mode === "live" ? { liveSince } : {}),
    [mode, liveSince]
  );

  const filtered = useMemo(
    () => filterWordcloud(wordcloudEntries, mode, filterOptions),
    [wordcloudEntries, mode, filterOptions]
  );

  const wordCount = useMemo(
    () => entryCount(wordcloudEntries, mode, filterOptions),
    [wordcloudEntries, mode, filterOptions]
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-background p-0.5">
            {(
              [
                { id: "live" as const, label: "Live" },
                { id: "session" as const, label: "Session" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium md:text-sm",
                  mode === id
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "live" && showContent && (
            <button
              type="button"
              onClick={resetLiveView}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted shadow-sm transition-colors hover:text-foreground"
              title="Clear Live view and show only new words from here"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Reset
            </button>
          )}
        </div>
        <span className="text-xs text-muted md:text-sm">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
          {meta.status === "live" && mode === "live" && (
            <span className="ml-2 text-live-active">· growing live</span>
          )}
          {mode === "session" && meta.status === "live" && (
            <span className="ml-2 text-muted">· full session</span>
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
              sendToMine(
                text,
                "cloud",
                mode === "live" ? "Word Cloud (Live)" : "Word Cloud (Session)",
                { imageData }
              )
            }
          />
        )}
      </div>
    </div>
  );
}

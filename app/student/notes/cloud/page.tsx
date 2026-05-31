"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { WordCloudCanvas } from "@/components/notes/WordCloudCanvas";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";
import { useState } from "react";

export default function CloudNotesPage() {
  const { wordcloud, meta, isTabLiveActive } = useSession();
  const sendToMine = useSendToMine();
  const [mode, setMode] = useState<"session" | "5min">("session");
  const isLive = isTabLiveActive("notes");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <WaitingOverlay
        show={!isLive && meta.status !== "paused"}
        message="Word cloud builds from live speech when the session starts."
      />
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <div className="flex rounded-lg bg-background p-0.5">
          {(["session", "5min"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                mode === m
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted"
              }`}
            >
              {m === "session" ? "Session" : "5 min"}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">{wordcloud.length} words</span>
      </div>
      <div className="min-h-0 flex-1">
        <WordCloudCanvas
          words={wordcloud}
          onSendToMine={(text) => sendToMine(text, "cloud", "Word Cloud")}
        />
      </div>
    </div>
  );
}

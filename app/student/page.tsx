"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { LanguagePicker } from "@/components/live/LanguagePicker";
import { SubtitleFeed } from "@/components/live/SubtitleFeed";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useLocale } from "@/hooks/useMineNotes";
import { useSession } from "@/lib/session/context";
import { useState } from "react";

export default function LivePage() {
  const { subtitles, meta, isTabLiveActive } = useSession();
  const { locale, setLocale } = useLocale();
  const [fontSize, setFontSize] = useState(16);
  const sendToMine = useSendToMine();
  const isLive = isTabLiveActive("live");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <WaitingOverlay
        show={!isLive && meta.status !== "paused"}
        message="Live subtitles will appear when the session starts."
      />
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          {meta.status === "live" && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-tab-live">
              <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-live-active" />
              Live · Corrected
            </span>
          )}
          {meta.status === "paused" && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Paused
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguagePicker locale={locale} onChange={setLocale} />
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(12, s - 2))}
            className="rounded border border-border px-2 py-0.5 text-xs text-muted"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(22, s + 2))}
            className="rounded border border-border px-2 py-0.5 text-xs text-muted"
          >
            A+
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <SubtitleFeed
          lines={subtitles}
          locale={locale}
          fontSize={fontSize}
          onSendToMine={(text) => sendToMine(text, "live", "Live subtitles")}
        />
      </div>
    </div>
  );
}

"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { StudentContent } from "@/components/layout/StudentContent";
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
  const showContent = isLive || meta.status === "paused";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {meta.status === "live" && (
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-tab-live md:text-xs">
                <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-live-active" />
                Live · Corrected
              </span>
            )}
            {meta.status === "paused" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted md:text-xs">
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
      </div>

      <StudentContent width="narrow" className="relative">
        <WaitingOverlay
          show={!showContent}
          message="Live subtitles will appear when the session starts."
        />
        {showContent && (
          <SubtitleFeed
            lines={subtitles}
            locale={locale}
            fontSize={fontSize}
            onSendToMine={(text) => sendToMine(text, "live", "Live subtitles")}
          />
        )}
      </StudentContent>
    </div>
  );
}

"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { LanguagePicker } from "@/components/live/LanguagePicker";
import { SubtitleFeed } from "@/components/live/SubtitleFeed";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useLocale } from "@/hooks/useMineNotes";
import { useSubtitleTranslations } from "@/hooks/useSubtitleTranslations";
import { useSession } from "@/lib/session/context";
import { useState } from "react";

export default function LivePage() {
  const { subtitles, meta, isTabLiveActive } = useSession();
  const { locale, setLocale } = useLocale();
  const displayLines = useSubtitleTranslations(subtitles, locale);
  const [fontSize, setFontSize] = useState(17);
  const sendToMine = useSendToMine();
  const isLive = isTabLiveActive("live");
  const showContent = isLive || meta.status === "paused";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-4 py-2 backdrop-blur-sm md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {meta.status === "live" && (
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-tab-live md:text-xs">
                <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-live-active" />
                Live
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
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted shadow-sm"
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(24, s + 2))}
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted shadow-sm"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 md:px-6">
        <WaitingOverlay
          show={!showContent}
          message="Live subtitles will appear when the session starts."
        />
        {showContent && (
          <SubtitleFeed
            className="min-h-0 flex-1"
            lines={displayLines}
            locale={locale}
            fontSize={fontSize}
            onSendToMine={(text) => sendToMine(text, "live", "Live subtitles")}
          />
        )}
      </div>
    </div>
  );
}

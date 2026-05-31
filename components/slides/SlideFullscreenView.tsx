"use client";

import { LanguagePicker } from "@/components/live/LanguagePicker";
import { useLocale } from "@/hooks/useMineNotes";
import { cn } from "@/lib/utils";
import type { SubtitleLine } from "@/types/session";
import { Captions, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SlideFullscreenViewProps {
  slideSrc: string;
  subtitles: SubtitleLine[];
  onClose: () => void;
}

function getFullscreenElement(): Element | null {
  return (
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element })
      .webkitFullscreenElement ??
    null
  );
}

async function requestElementFullscreen(el: HTMLElement) {
  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }

  const webkitEl = el as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };
  if (webkitEl.webkitRequestFullscreen) {
    await webkitEl.webkitRequestFullscreen();
  }
}

async function exitDocumentFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }

  const webkitDoc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
  };
  if (webkitDoc.webkitExitFullscreen) {
    await webkitDoc.webkitExitFullscreen();
  }
}

export function SlideFullscreenView({
  slideSrc,
  subtitles,
  onClose,
}: SlideFullscreenViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const intentionalExitRef = useRef(false);
  const { locale, setLocale } = useLocale();
  const [subtitlesOn, setSubtitlesOn] = useState(false);

  onCloseRef.current = onClose;

  const currentLine = useMemo(
    () =>
      subtitles.find((line) => line.isCurrent) ??
      subtitles[subtitles.length - 1],
    [subtitles]
  );

  const subtitleText = currentLine
    ? locale === "en"
      ? currentLine.textEn
      : currentLine.translations[locale] ?? currentLine.textEn
    : null;

  const handleClose = useCallback(async () => {
    if (getFullscreenElement()) {
      intentionalExitRef.current = true;
      try {
        await exitDocumentFullscreen();
      } catch {
        intentionalExitRef.current = false;
        onCloseRef.current();
      }
      return;
    }
    onCloseRef.current();
  }, []);

  // Enter fullscreen once on mount; only exit on unmount or explicit user close.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    void requestElementFullscreen(el).catch(() => {
      // Fixed overlay fallback when native fullscreen is unavailable.
    });

    const onFullscreenChange = () => {
      if (intentionalExitRef.current) {
        intentionalExitRef.current = false;
        if (!getFullscreenElement()) {
          onCloseRef.current();
        }
        return;
      }

      if (!getFullscreenElement()) {
        onCloseRef.current();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);

      if (getFullscreenElement() === el) {
        intentionalExitRef.current = true;
        void exitDocumentFullscreen().catch(() => {
          intentionalExitRef.current = false;
        });
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex h-dvh w-dvw flex-col bg-[#F7F5F2]"
      role="dialog"
      aria-modal="true"
      aria-label="Slide fullscreen view"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "flex min-h-0 flex-1 items-stretch justify-center",
            subtitlesOn && "pb-2"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slideSrc}
            alt="Current slide"
            className="h-full w-full object-contain"
          />
        </div>

        {subtitlesOn && (
          <div className="shrink-0 px-4 pb-6 pt-4">
            {subtitleText ? (
              <p className="text-center text-base leading-relaxed text-foreground md:text-lg">
                {subtitleText}
              </p>
            ) : (
              <p className="text-center text-sm text-muted">
                Subtitles will appear when the session is live.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#F7F5F2] via-[#F7F5F2]/90 to-transparent px-4 pb-8 pt-3">
        <div className="pointer-events-auto flex items-center justify-end gap-2">
          {subtitlesOn && (
            <LanguagePicker locale={locale} onChange={setLocale} />
          )}
          <button
            type="button"
            onClick={() => setSubtitlesOn((on) => !on)}
            aria-pressed={subtitlesOn}
            aria-label={subtitlesOn ? "Hide subtitles" : "Show subtitles"}
            className={cn(
              "rounded-md p-2 transition-colors",
              subtitlesOn
                ? "bg-tab-slides/15 text-tab-slides"
                : "text-muted hover:bg-surface hover:text-foreground"
            )}
          >
            <Captions className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => void handleClose()}
            aria-label="Exit fullscreen"
            className="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

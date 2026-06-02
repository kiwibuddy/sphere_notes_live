"use client";

import { LanguagePicker } from "@/components/live/LanguagePicker";
import { useLocale } from "@/hooks/useMineNotes";
import {
  isIOS,
  supportsElementFullscreen,
} from "@/lib/device/ios";
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
  const nativeFsActiveRef = useRef(false);
  const { locale, setLocale } = useLocale();
  const [subtitlesOn, setSubtitlesOn] = useState(isIOS());

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
    if (nativeFsActiveRef.current && getFullscreenElement()) {
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("slide-immersive-open");

    const useNative = supportsElementFullscreen();

    if (useNative) {
      void requestElementFullscreen(el)
        .then(() => {
          nativeFsActiveRef.current = !!getFullscreenElement();
        })
        .catch(() => {
          nativeFsActiveRef.current = false;
        });
    }

    const onFullscreenChange = () => {
      if (!nativeFsActiveRef.current) return;

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
      document.body.classList.remove("slide-immersive-open");
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);

      if (nativeFsActiveRef.current && getFullscreenElement() === el) {
        intentionalExitRef.current = true;
        void exitDocumentFullscreen().catch(() => {
          intentionalExitRef.current = false;
        });
      }
      nativeFsActiveRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col bg-[#F7F5F2]",
        "h-[100dvh] min-h-[100dvh] w-full max-w-[100vw]",
        "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Slide fullscreen view"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "flex min-h-0 flex-1 items-center justify-center",
            subtitlesOn && "pb-1"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slideSrc}
            alt="Current slide"
            className="max-h-full max-w-full object-contain"
            style={{
              maxHeight: subtitlesOn
                ? "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 7rem)"
                : "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 3.5rem)",
            }}
          />
        </div>

        {subtitlesOn && (
          <div className="shrink-0 px-4 pb-4 pt-2">
            {subtitleText ? (
              <p className="text-center text-base leading-relaxed text-foreground">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#F7F5F2] via-[#F7F5F2]/95 to-transparent px-3 pb-6 pt-[max(0.5rem,env(safe-area-inset-top))]">
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
              "rounded-md p-2.5 transition-colors",
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
            className="rounded-md p-2.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

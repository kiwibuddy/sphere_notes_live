"use client";

import { SlideCaptionLine } from "@/components/slides/SlideCaptionLine";
import { SlideFullscreenView } from "@/components/slides/SlideFullscreenView";
import { LanguagePicker } from "@/components/live/LanguagePicker";
import { useLocale } from "@/hooks/useMineNotes";
import { useSlideCaptionDismiss } from "@/hooks/useSlideCaptionDismiss";
import { useSubtitleTranslations } from "@/hooks/useSubtitleTranslations";
import { isLandscape, isMobilePhone } from "@/lib/device/ios";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";
import { Captions, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SlideViewerProps {
  readOnly?: boolean;
}

/** Student view: current live slide — immersive overlay on phone landscape. */
export function SlideViewer({ readOnly }: SlideViewerProps) {
  const { slides, subtitles, isTabLiveActive } = useSession();
  const { locale, setLocale } = useLocale();
  const displaySubtitles = useSubtitleTranslations(subtitles, locale);
  const [fullscreen, setFullscreen] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const autoLandscapeRef = useRef(false);

  const index = Math.max(0, Math.min(slides.current - 1, slides.total - 1));
  const current = slides.images[index] ?? slides.images[0];
  const isLive = isTabLiveActive("slides");

  const currentLine = useMemo(
    () =>
      displaySubtitles.find((line) => line.isCurrent) ??
      displaySubtitles[displaySubtitles.length - 1],
    [displaySubtitles]
  );

  const subtitleText = currentLine
    ? locale === "en"
      ? currentLine.textEn
      : currentLine.translations[locale] ?? currentLine.textEn
    : null;

  const captionKey =
    currentLine && subtitleText ? `${currentLine.id}:${subtitleText}` : null;
  const captionVisible = useSlideCaptionDismiss(captionKey, subtitlesOn);

  const openFullscreen = useCallback(() => {
    setFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    autoLandscapeRef.current = false;
    setFullscreen(false);
  }, []);

  /** On phones, rotating to landscape opens the immersive slide view. */
  useEffect(() => {
    if (!isMobilePhone()) return;

    const sync = () => {
      if (isLandscape()) {
        autoLandscapeRef.current = true;
        setFullscreen(true);
      } else if (autoLandscapeRef.current) {
        autoLandscapeRef.current = false;
        setFullscreen(false);
      }
    };

    sync();
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          fullscreen && "invisible"
        )}
        aria-hidden={fullscreen}
      >
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            !isLive && !readOnly && "opacity-60"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt="Current slide"
            className="h-[95%] w-auto max-w-[95%] object-contain"
          />
        </div>

        <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5 sm:right-3 sm:top-3">
          {subtitlesOn && (
            <LanguagePicker locale={locale} onChange={setLocale} />
          )}
          <button
            type="button"
            onClick={() => setSubtitlesOn((on) => !on)}
            aria-pressed={subtitlesOn}
            aria-label={subtitlesOn ? "Hide subtitles" : "Show subtitles"}
            className={cn(
              "rounded-full bg-surface/95 p-2 shadow-card ring-1 ring-border transition-colors",
              subtitlesOn
                ? "text-tab-slides"
                : "text-muted hover:text-foreground"
            )}
          >
            <Captions className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openFullscreen}
            aria-label="Fullscreen"
            className={cn(
              "rounded-full bg-surface/95 p-2 shadow-card ring-1 ring-border transition-colors",
              "text-muted hover:text-foreground active:scale-95"
            )}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {subtitlesOn && (!subtitleText || captionVisible) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background from-40% via-background/80 to-transparent px-4 pb-3 pt-6">
            <div className="pointer-events-auto mx-auto max-w-3xl text-center">
              {subtitleText ? (
                <SlideCaptionLine text={subtitleText} />
              ) : (
                <p className="text-sm text-muted">No subtitles yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {fullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <SlideFullscreenView
            slideSrc={current}
            subtitles={displaySubtitles}
            onClose={closeFullscreen}
          />,
          document.body
        )}
    </>
  );
}

"use client";

import { SlideCaptionLine } from "@/components/slides/SlideCaptionLine";
import { LanguagePicker } from "@/components/live/LanguagePicker";
import { useSlideCaptionDismiss } from "@/hooks/useSlideCaptionDismiss";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { useLocale } from "@/hooks/useMineNotes";
import { isIOS, supportsElementFullscreen } from "@/lib/device/ios";
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
  const viewport = useVisualViewport();
  const { locale, setLocale } = useLocale();
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [nativeFs, setNativeFs] = useState(false);

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

  const captionKey =
    currentLine && subtitleText ? `${currentLine.id}:${subtitleText}` : null;
  const captionVisible = useSlideCaptionDismiss(captionKey, subtitlesOn);

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
          setNativeFs(nativeFsActiveRef.current);
        })
        .catch(() => {
          nativeFsActiveRef.current = false;
        });
    }

    const onFullscreenChange = () => {
      setNativeFs(!!getFullscreenElement());

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

  /** Tap slide area to tuck Safari UI (scroll window slightly). */
  const nudgeSafariChrome = useCallback(() => {
    if (!isIOS()) return;
    window.scrollTo(0, 1);
    setTimeout(() => window.scrollTo(0, 0), 50);
    setChromeHidden(true);
  }, []);

  const viewHeight = nativeFs
    ? typeof window !== "undefined"
      ? window.innerHeight
      : viewport.height
    : viewport.height;
  const showCaptionBar = subtitlesOn && !!subtitleText && captionVisible;
  const controlsHeight = showCaptionBar ? 88 : 48;
  const slideHeight = Math.max(viewHeight - controlsHeight, 120);

  const slideWidth = nativeFs
    ? typeof window !== "undefined"
      ? window.innerWidth
      : viewport.width
    : viewport.width;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-[9999] flex flex-col overflow-hidden bg-[#F7F5F2]",
        nativeFs && "inset-0 h-full w-full"
      )}
      style={
        nativeFs
          ? undefined
          : {
              top: viewport.offsetTop,
              left: viewport.offsetLeft,
              width: viewport.width,
              height: viewport.height,
            }
      }
      role="dialog"
      aria-modal="true"
      aria-label="Slide fullscreen view"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <button
          type="button"
          className="relative flex min-h-0 w-full flex-1 border-0 bg-transparent p-0"
          onClick={nudgeSafariChrome}
          aria-label="Show slide"
        >
          <div className="flex min-h-0 flex-1 items-center justify-center px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slideSrc}
              alt="Current slide"
              className="h-full w-full object-contain"
              style={{
                maxHeight: slideHeight,
                maxWidth: slideWidth,
              }}
            />
          </div>
        </button>

        {showCaptionBar && (
          <div className="shrink-0 w-full px-3 pb-2 pt-1 text-center">
            <SlideCaptionLine text={subtitleText!} />
          </div>
        )}
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-2",
          "bg-gradient-to-b from-[#F7F5F2] via-[#F7F5F2]/95 to-transparent",
          "pb-2 pt-[max(0.25rem,env(safe-area-inset-top))]"
        )}
      >
        {isIOS() && !chromeHidden && (
          <p className="max-w-[55%] text-[10px] leading-tight text-muted">
            Tap slide to hide Safari bars · exit with{" "}
            <span className="whitespace-nowrap">↙ button</span>
          </p>
        )}
        <div className="ml-auto flex items-center gap-1">
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
            className="rounded-md bg-surface p-2.5 text-foreground shadow-card ring-1 ring-border"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

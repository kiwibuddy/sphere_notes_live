"use client";

import { SubtitleBubble } from "@/components/live/SubtitleBubble";
import { cn } from "@/lib/utils";
import type { SubtitleLine } from "@/types/session";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

interface SubtitleFeedProps {
  lines: SubtitleLine[];
  locale: string;
  fontSize: number;
  onSendToMine?: (text: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function SubtitleFeed({
  lines,
  locale,
  fontSize,
  onSendToMine,
  readOnly,
  className,
}: SubtitleFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el || !stickToBottomRef.current) return;

    const run = () => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    };

    run();
    requestAnimationFrame(run);
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  const linesKey = lines
    .map((l) => `${l.id}|${l.textEn}|${l.isCurrent ? 1 : 0}`)
    .join("§");

  useLayoutEffect(() => {
    scrollToBottom(lines.length <= 1 ? "auto" : "smooth");
  }, [linesKey, scrollToBottom, lines.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distanceFromBottom < 80;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (lines.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center px-4 py-12",
          className
        )}
      >
        <div className="max-w-xs rounded-2xl bg-surface px-5 py-4 text-center shadow-card ring-1 ring-border">
          <p className="text-sm text-muted">
            Waiting for live speech…
          </p>
          <p className="mt-2 text-xs text-muted/80">
            Captions appear here as the presenter speaks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
        "overscroll-y-contain [-webkit-overflow-scrolling:touch]",
        "scroll-pb-[max(5rem,env(safe-area-inset-bottom,0px)+4rem)] max-md:scroll-pb-40",
        className
      )}
    >
      <div
        className={cn(
          "flex min-h-full flex-col justify-end gap-3 px-1 pt-4",
          "pb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] max-md:pb-40"
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {lines.map((line) => {
            const text =
              locale === "en"
                ? line.textEn
                : line.translations[locale] ?? line.textEn;

            return (
              <SubtitleBubble
                key={line.id}
                line={line}
                text={text}
                fontSize={line.isCurrent ? fontSize : Math.max(13, fontSize - 2)}
                readOnly={readOnly}
                onSendToMine={onSendToMine}
              />
            );
          })}
        </AnimatePresence>
        {/* Keeps the latest bubble off the bottom edge when scrolled to end */}
        <div
          aria-hidden
          className="min-h-[3rem] shrink-0 sm:min-h-[2rem]"
        />
      </div>
    </div>
  );
}

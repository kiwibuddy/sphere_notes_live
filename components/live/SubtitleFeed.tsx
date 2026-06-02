"use client";

import { motion } from "framer-motion";
import type { SubtitleLine } from "@/types/session";
import { SendToMineButton } from "@/components/cards/SendToMineButton";
import { isIOS } from "@/lib/device/ios";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SubtitleFeedProps {
  lines: SubtitleLine[];
  locale: string;
  fontSize: number;
  onSendToMine?: (text: string) => void;
  readOnly?: boolean;
}

export function SubtitleFeed({
  lines,
  locale,
  fontSize,
  onSendToMine,
  readOnly,
}: SubtitleFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const reduceMotion = isIOS();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines]);

  if (lines.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Waiting for live speech…
      </p>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {lines.map((line) => {
        const text =
          locale === "en"
            ? line.textEn
            : line.translations[locale] ?? line.textEn;

        const inner = (
          <>
            <p
              className={cn(
                "leading-relaxed text-foreground",
                line.isCurrent ? "font-medium" : "text-muted"
              )}
              style={{ fontSize: `${fontSize}px` }}
            >
              {text}
            </p>
            {line.isCurrent && !readOnly && onSendToMine && (
              <div className="mt-2">
                <SendToMineButton onSend={() => onSendToMine(text)} />
              </div>
            )}
          </>
        );

        if (reduceMotion) {
          return (
            <div
              key={line.id}
              className={cn(
                "relative rounded-lg px-1 py-1",
                line.isCurrent && "border-l-2 border-tab-live pl-3"
              )}
            >
              {inner}
            </div>
          );
        }

        return (
          <motion.div
            key={line.id}
            layout
            className={cn(
              "relative rounded-lg px-1 py-1 transition-colors",
              line.isCurrent && "border-l-2 border-tab-live pl-3"
            )}
          >
            {inner}
          </motion.div>
        );
      })}
      <div ref={bottomRef} aria-hidden className="h-px shrink-0" />
    </div>
  );
}

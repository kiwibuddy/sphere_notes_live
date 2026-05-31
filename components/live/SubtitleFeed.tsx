"use client";

import { motion } from "framer-motion";
import type { SubtitleLine } from "@/types/session";
import { SendToMineButton } from "@/components/cards/SendToMineButton";
import { cn } from "@/lib/utils";

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
  return (
    <div className="space-y-4">
      {lines.map((line) => {
        const text =
          locale === "en"
            ? line.textEn
            : line.translations[locale] ?? line.textEn;

        return (
          <motion.div
            key={line.id}
            layout
            className={cn(
              "relative rounded-lg px-1 py-1 transition-colors",
              line.isCurrent && "border-l-2 border-tab-live pl-3"
            )}
          >
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
          </motion.div>
        );
      })}
    </div>
  );
}

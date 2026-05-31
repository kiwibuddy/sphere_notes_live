"use client";

import type { WordCloudWord } from "@/types/session";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const CATEGORY_COLORS: Record<WordCloudWord["category"], string> = {
  theology: "text-amber-700",
  names: "text-tab-live",
  concepts: "text-tab-cloud",
  general: "text-muted",
};

interface WordCloudCanvasProps {
  words: WordCloudWord[];
  onSendToMine?: (text: string) => void;
}

export function WordCloudCanvas({ words, onSendToMine }: WordCloudCanvasProps) {
  const maxCount = useMemo(
    () => Math.max(...words.map((w) => w.count), 1),
    [words]
  );

  const topWords = words
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((w) => w.word)
    .join(" · ");

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-3 p-4">
        {words.map((word) => {
          const scale = 0.75 + (word.count / maxCount) * 0.75;
          return (
            <span
              key={word.word}
              className={cn(
                "inline-block cursor-default font-medium transition-transform hover:scale-105",
                CATEGORY_COLORS[word.category]
              )}
              style={{ fontSize: `${scale}rem` }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
      {onSendToMine && (
        <div className="border-t border-border p-3 text-right">
          <button
            type="button"
            onClick={() => onSendToMine(`Top words: ${topWords}`)}
            className="text-xs font-medium text-tab-cloud"
          >
            + My Notes
          </button>
        </div>
      )}
    </div>
  );
}

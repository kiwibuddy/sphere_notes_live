"use client";

import { SendToMineButton } from "@/components/cards/SendToMineButton";
import { captureWordCloudSnapshot } from "@/lib/wordcloud/capture";
import { categoryColor } from "@/lib/wordcloud/layout";
import { sizeWordCloud } from "@/lib/wordcloud/sizes";
import type { WordCloudMode, WordCloudWord } from "@/types/session";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export interface WordCloudSendPayload {
  text: string;
  imageData?: string;
}

interface WordCloudCanvasProps {
  words: WordCloudWord[];
  mode?: WordCloudMode;
  onSendToMine?: (payload: WordCloudSendPayload) => void;
}

export function WordCloudCanvas({
  words,
  onSendToMine,
}: WordCloudCanvasProps) {
  const [pulseWord, setPulseWord] = useState<string | null>(null);
  const prevCountsRef = useRef<Map<string, number>>(new Map());

  const sizedWords = useMemo(() => sizeWordCloud(words, 50), [words]);

  const topWords = sizedWords
    .slice(0, 12)
    .map((w) => w.word)
    .join(" · ");

  const handleSend = () => {
    if (!onSendToMine) return;
    const imageData = captureWordCloudSnapshot(words);
    onSendToMine({
      text: `Word cloud · ${topWords}`,
      imageData: imageData ?? undefined,
    });
  };

  useEffect(() => {
    const prev = prevCountsRef.current;
    let bumped: string | null = null;

    for (const w of words) {
      const before = prev.get(w.word) ?? 0;
      if (w.count > before) bumped = w.word;
      prev.set(w.word, w.count);
    }

    if (bumped) {
      setPulseWord(bumped);
      const t = window.setTimeout(() => setPulseWord(null), 600);
      return () => window.clearTimeout(t);
    }
  }, [words]);

  return (
    <div className="flex h-full min-h-[280px] flex-col md:min-h-[360px]">
      <div
        className="relative min-h-0 flex-1 overflow-y-auto rounded-xl bg-gradient-to-br from-background via-surface/30 to-background p-4 md:p-6"
        aria-label="Word cloud visualization"
      >
        {sizedWords.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center px-6 text-center text-sm text-muted">
            No words in this window yet. Keep speaking — the cloud builds from
            live speech.
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
            {sizedWords.map((w) => (
              <span
                key={w.word}
                className={cn(
                  "inline-block font-semibold leading-tight transition-transform duration-300",
                  pulseWord === w.word && "scale-110"
                )}
                style={{
                  fontSize: `${w.fontSizePx}px`,
                  color: categoryColor(w.category),
                }}
                title={`${w.word} · said ${w.count} time${w.count === 1 ? "" : "s"}`}
              >
                {w.word}
              </span>
            ))}
          </div>
        )}
      </div>
      {onSendToMine && words.length > 0 && (
        <div className="shrink-0 p-2 text-right">
          <SendToMineButton onSend={handleSend} />
        </div>
      )}
    </div>
  );
}

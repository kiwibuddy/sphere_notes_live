"use client";

import { SendToMineButton } from "@/components/cards/SendToMineButton";
import type { WordCloudWord } from "@/types/session";
import type { WordCloudMode } from "@/types/session";
import { captureWordCloudSnapshot } from "@/lib/wordcloud/capture";
import {
  drawWordCloud,
  layoutWordCloud,
} from "@/lib/wordcloud/layout";
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pulseWord, setPulseWord] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const prevCountsRef = useRef<Map<string, number>>(new Map());

  const topWords = words
    .slice()
    .sort((a, b) => b.count - a.count)
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
      const start = performance.now();
      const animate = (now: number) => {
        const t = (now - start) / 600;
        if (t >= 1) {
          setPulseWord(null);
          return;
        }
        setPulsePhase(t);
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [words]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w <= 0 || h <= 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const placed = layoutWordCloud(words, w, h, ctx);
      drawWordCloud(ctx, placed, pulseWord, pulsePhase, w, h);
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(container);
    return () => ro.disconnect();
  }, [words, pulseWord, pulsePhase]);

  return (
    <div className="flex h-full min-h-[280px] flex-col md:min-h-[360px]">
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 rounded-xl bg-gradient-to-br from-background via-surface/30 to-background"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Word cloud visualization"
        />
        {words.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
            No words in this window yet. Keep speaking — the cloud builds from
            live speech.
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

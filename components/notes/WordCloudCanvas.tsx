"use client";

import { SendToMineButton } from "@/components/cards/SendToMineButton";
import { captureWordCloudSnapshot } from "@/lib/wordcloud/capture";
import { drawWordCloud, layoutWordCloud } from "@/lib/wordcloud/layout";
import {
  sizeWordCloud,
  wordCloudLimitForMode,
} from "@/lib/wordcloud/sizes";
import type { WordCloudMode, WordCloudWord } from "@/types/session";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface WordCloudSendPayload {
  text: string;
  imageData?: string;
}

interface WordCloudCanvasProps {
  words: WordCloudWord[];
  mode?: WordCloudMode;
  maxWords?: number;
  onSendToMine?: (payload: WordCloudSendPayload) => void;
}

export function WordCloudCanvas({
  words,
  mode = "session",
  maxWords,
  onSendToMine,
}: WordCloudCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pulseWord, setPulseWord] = useState<string | null>(null);
  const prevCountsRef = useRef<Map<string, number>>(new Map());
  const pulsePhaseRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const limit = maxWords ?? wordCloudLimitForMode(mode);

  const sizedWords = useMemo(
    () => sizeWordCloud(words, limit),
    [words, limit]
  );

  const topWords = sizedWords
    .slice(0, 12)
    .map((w) => w.word)
    .join(" · ");

  const handleSend = () => {
    if (!onSendToMine) return;
    const imageData = captureWordCloudSnapshot(words, limit);
    onSendToMine({
      text: `Word cloud · ${topWords}`,
      imageData: imageData ?? undefined,
    });
  };

  const paint = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const w = Math.floor(wrap.clientWidth);
    const h = Math.floor(wrap.clientHeight);
    if (w < 48 || h < 48) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (sizedWords.length === 0) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    const placed = layoutWordCloud(words, w, h, ctx, limit);
    drawWordCloud(ctx, placed, pulseWord, pulsePhaseRef.current, w, h);
  }, [words, limit, sizedWords.length, pulseWord]);

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
      const t = window.setTimeout(() => setPulseWord(null), 700);
      return () => window.clearTimeout(t);
    }
  }, [words]);

  useEffect(() => {
    paint();
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => paint());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [paint]);

  useEffect(() => {
    if (!pulseWord) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      pulsePhaseRef.current = (pulsePhaseRef.current + 0.08) % 1;
      paint();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [pulseWord, paint]);

  return (
    <div className="flex h-full min-h-[280px] flex-col md:min-h-[360px]">
      <div
        ref={wrapRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-gradient-to-br from-background via-surface/30 to-background"
        aria-label="Word cloud visualization"
      >
        {sizedWords.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
            No words in this window yet. Keep speaking — the cloud builds from
            live speech.
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`Word cloud with ${sizedWords.length} words`}
          />
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

import type { WordCloudWord } from "@/types/session";
import { sizeWordCloud } from "@/lib/wordcloud/sizes";
import {
  layoutCloudSpiral,
  type PlacedWord,
  type MeasureWordFn,
} from "@/lib/wordcloud/spiral-layout";

export type { PlacedWord };

const CATEGORY_COLORS: Record<WordCloudWord["category"], string> = {
  theology: "#B45309",
  names: "#2563EB",
  concepts: "#0D9488",
  general: "#6B6860",
};

export function categoryColor(category: WordCloudWord["category"]): string {
  return CATEGORY_COLORS[category];
}

export function createWordMeasurer(
  ctx: CanvasRenderingContext2D
): MeasureWordFn {
  return (word: string, fontSize: number) => {
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    const metrics = ctx.measureText(word);
    return {
      width: metrics.width,
      height: fontSize * 1.15,
    };
  };
}

/** Spiral cloud layout for canvas snapshot export. */
export function layoutWordCloud(
  words: WordCloudWord[],
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  maxWords = 50
): PlacedWord[] {
  const sized = sizeWordCloud(words, maxWords);
  return layoutCloudSpiral(sized, width, height, createWordMeasurer(ctx));
}

export function drawWordCloud(
  ctx: CanvasRenderingContext2D,
  placed: PlacedWord[],
  pulseWord: string | null,
  pulsePhase: number,
  width: number,
  height: number,
  options?: { background?: string }
) {
  if (options?.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  for (const item of placed) {
    const pulsing =
      pulseWord === item.word
        ? 1 + 0.12 * Math.sin(pulsePhase * Math.PI * 2)
        : 1;
    const size = Math.round(item.fontSize * pulsing);
    const ox = pulsing > 1 ? -((size - item.fontSize) * 0.15) : 0;
    const oy = pulsing > 1 ? -((size - item.fontSize) * 0.35) : 0;

    ctx.save();
    ctx.font = `600 ${size}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = categoryColor(item.category);
    ctx.textBaseline = "top";
    ctx.globalAlpha = pulseWord === item.word ? 1 : 0.9;
    ctx.fillText(item.word, item.x + ox, item.y + oy);
    ctx.restore();
  }
}

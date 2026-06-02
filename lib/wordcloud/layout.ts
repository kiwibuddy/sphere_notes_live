import type { WordCloudWord } from "@/types/session";
import { sizeWordCloud } from "@/lib/wordcloud/sizes";

export interface PlacedWord {
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  count: number;
  category: WordCloudWord["category"];
}

const CATEGORY_COLORS: Record<WordCloudWord["category"], string> = {
  theology: "#B45309",
  names: "#2563EB",
  concepts: "#0D9488",
  general: "#6B6860",
};

export function categoryColor(category: WordCloudWord["category"]): string {
  return CATEGORY_COLORS[category];
}

function measureWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  fontSize: number
): { width: number; height: number } {
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
  const metrics = ctx.measureText(word);
  return {
    width: metrics.width,
    height: fontSize * 1.15,
  };
}

/** Simple wrap layout for PNG snapshots — sizes come from `sizeWordCloud`. */
export function layoutWordCloud(
  words: WordCloudWord[],
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  maxWords = 50
): PlacedWord[] {
  if (width <= 0 || height <= 0 || words.length === 0) return [];

  const sized = sizeWordCloud(words, maxWords);
  const placed: PlacedWord[] = [];
  const margin = 10;
  let x = margin;
  let y = margin;
  let lineHeight = 0;

  for (const item of sized) {
    const fontSize = item.fontSizePx;
    const { width: w, height: h } = measureWord(ctx, item.word, fontSize);

    if (x + w > width - margin && x > margin) {
      x = margin;
      y += lineHeight + 10;
      lineHeight = 0;
    }

    if (y + h > height - margin) break;

    placed.push({
      word: item.word,
      x,
      y,
      width: w,
      height: h,
      fontSize,
      count: item.count,
      category: item.category,
    });

    x += w + 12;
    lineHeight = Math.max(lineHeight, h);
  }

  return placed;
}

export function drawWordCloud(
  ctx: CanvasRenderingContext2D,
  placed: PlacedWord[],
  _pulseWord: string | null,
  _pulsePhase: number,
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
    ctx.save();
    ctx.font = `600 ${item.fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = categoryColor(item.category);
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.92;
    ctx.fillText(item.word, item.x, item.y);
    ctx.restore();
  }
}

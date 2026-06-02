import type { WordCloudWord } from "@/types/session";

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
  ctx.font = `600 ${fontSize}px var(--font-geist-sans), system-ui, sans-serif`;
  const metrics = ctx.measureText(word);
  return {
    width: metrics.width,
    height: fontSize * 1.15,
  };
}

function collides(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  pad: number
): boolean {
  return !(
    a.x + a.width + pad < b.x ||
    b.x + b.width + pad < a.x ||
    a.y + a.height + pad < b.y ||
    b.y + b.height + pad < a.y
  );
}

/** Size from repetition count — keeps a visible gap between rare and common words. */
function fontSizeForCount(
  count: number,
  maxCount: number,
  minFont: number,
  maxFont: number
): number {
  if (maxCount <= 1) return maxFont;
  const ratio = count / maxCount;
  const floor = 0.32;
  const emphasis = floor + (1 - floor) * Math.pow(ratio, 0.35);
  return minFont + emphasis * (maxFont - minFont);
}

/** Rank-based tier so the top words stay huge even when the canvas is crowded. */
function fontSizeForRank(
  rank: number,
  minFont: number,
  maxFont: number
): number {
  if (rank === 0) return maxFont;
  if (rank === 1) return maxFont * 0.78;
  if (rank === 2) return maxFont * 0.65;
  if (rank <= 5) return maxFont * 0.5;
  if (rank <= 10) return maxFont * 0.38;
  if (rank <= 18) return maxFont * 0.28;
  return minFont;
}

function targetFontSize(
  item: WordCloudWord,
  rank: number,
  maxCount: number,
  minFont: number,
  maxFont: number
): number {
  const byCount = fontSizeForCount(item.count, maxCount, minFont, maxFont);
  const byRank = fontSizeForRank(rank, minFont, maxFont);
  return Math.max(byCount, byRank);
}

function tryPlaceWord(
  ctx: CanvasRenderingContext2D,
  item: WordCloudWord,
  fontSize: number,
  placed: PlacedWord[],
  cx: number,
  cy: number,
  width: number,
  height: number,
  margin: number,
  maxSteps: number
): PlacedWord | null {
  const { width: w, height: h } = measureWord(ctx, item.word, fontSize);

  let angle = 0;
  let radius = 0;

  for (let step = 0; step < maxSteps; step++) {
    const x = cx + radius * Math.cos(angle) - w / 2;
    const y = cy + radius * Math.sin(angle) - h / 2;

    const candidate = { x, y, width: w, height: h };
    const inBounds =
      x >= margin &&
      y >= margin &&
      x + w <= width - margin &&
      y + h <= height - margin;

    if (
      inBounds &&
      !placed.some((p) => collides(candidate, p, 4))
    ) {
      return {
        word: item.word,
        x,
        y,
        width: w,
        height: h,
        fontSize,
        count: item.count,
        category: item.category,
      };
    }

    angle += 0.32;
    radius += 0.38;
  }

  return null;
}

export function layoutWordCloud(
  words: WordCloudWord[],
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
): PlacedWord[] {
  if (width <= 0 || height <= 0 || words.length === 0) return [];

  const sorted = [...words]
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);

  const maxCount = Math.max(...sorted.map((w) => w.count), 1);
  const minDim = Math.min(width, height);
  const minFont = Math.max(12, minDim * 0.034);
  const maxFont = Math.max(minFont + 20, minDim * 0.26);
  const placed: PlacedWord[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const margin = 6;

  sorted.forEach((item, rank) => {
    const target = targetFontSize(item, rank, maxCount, minFont, maxFont);
    const minAllowed = Math.max(minFont, target * 0.82);

    let placedWord: PlacedWord | null = null;
    const steps = rank < 3 ? 1200 : 700;

    for (let fontSize = target; fontSize >= minAllowed; fontSize -= 1) {
      placedWord = tryPlaceWord(
        ctx,
        item,
        fontSize,
        placed,
        cx,
        cy,
        width,
        height,
        margin,
        steps
      );
      if (placedWord) break;
    }

    if (placedWord) {
      placed.push(placedWord);
    }
  });

  return placed;
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
    const isPulsing = pulseWord === item.word;
    const scale = isPulsing ? 1 + 0.08 * Math.sin(pulsePhase * Math.PI * 2) : 1;
    const fontSize = item.fontSize * scale;

    ctx.save();
    ctx.font = `600 ${fontSize}px var(--font-geist-sans), system-ui, sans-serif`;
    ctx.fillStyle = categoryColor(item.category);
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.92;

    const offsetX = (item.width * (scale - 1)) / 2;
    const offsetY = (item.height * (scale - 1)) / 2;
    ctx.fillText(item.word, item.x - offsetX, item.y - offsetY);
    ctx.restore();
  }
}

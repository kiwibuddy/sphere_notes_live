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

/**
 * Font size from repetition (log scale) + list rank when counts are tied.
 * Avoids the old bug where maxCount===1 made every word target max size.
 */
export function computeWordFontSize(
  count: number,
  maxCount: number,
  rank: number,
  total: number,
  minFont: number,
  maxFont: number
): number {
  const rankPart =
    total <= 1 ? 1 : 1 - rank / Math.max(total - 1, 1);

  if (maxCount <= 1) {
    const blend = Math.pow(Math.max(0, rankPart), 0.75);
    return minFont + blend * (maxFont - minFont);
  }

  const countPart = Math.log(count + 1) / Math.log(maxCount + 1);
  const blend = 0.85 * countPart + 0.15 * rankPart;
  return minFont + Math.pow(Math.max(0, Math.min(1, blend)), 0.7) * (maxFont - minFont);
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
  maxSteps: number,
  allowOverlap: boolean
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

    const pad = allowOverlap ? 1 : 5;
    if (
      inBounds &&
      (allowOverlap ||
        !placed.some((p) => collides(candidate, p, pad)))
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

    angle += 0.28;
    radius += 0.35;
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
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 32);

  const total = sorted.length;
  const maxCount = Math.max(...sorted.map((w) => w.count), 1);
  const minDim = Math.min(width, height);
  const minFont = Math.max(11, minDim * 0.028);
  const maxFont = Math.max(minFont + 22, minDim * 0.34);
  const placed: PlacedWord[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const margin = 4;

  sorted.forEach((item, rank) => {
    const fontSize = computeWordFontSize(
      item.count,
      maxCount,
      rank,
      total,
      minFont,
      maxFont
    );

    const isHero = rank === 0;
    const allowOverlap = rank <= 2;

    let placedWord = tryPlaceWord(
      ctx,
      item,
      fontSize,
      placed,
      cx,
      cy,
      width,
      height,
      margin,
      isHero ? 1 : 900,
      allowOverlap
    );

    if (!placedWord && isHero) {
      const { width: w, height: h } = measureWord(ctx, item.word, fontSize);
      placedWord = {
        word: item.word,
        x: cx - w / 2,
        y: cy - h / 2,
        width: w,
        height: h,
        fontSize,
        count: item.count,
        category: item.category,
      };
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

  const drawOrder = [...placed].sort((a, b) => a.fontSize - b.fontSize);

  for (const item of drawOrder) {
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

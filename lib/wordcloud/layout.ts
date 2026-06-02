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

function fontSizeForCount(
  count: number,
  maxCount: number,
  minFont: number,
  maxFont: number
): number {
  if (maxCount <= 1) return maxFont;
  const ratio = count / maxCount;
  // Sqrt curve: repeated words read clearly larger than one-off terms
  const emphasis = Math.pow(ratio, 0.45);
  return minFont + emphasis * (maxFont - minFont);
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
    .slice(0, 48);

  const maxCount = Math.max(...sorted.map((w) => w.count), 1);
  const minDim = Math.min(width, height);
  const minFont = Math.max(11, minDim * 0.032);
  const maxFont = Math.max(minFont + 14, minDim * 0.2);
  const placed: PlacedWord[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const margin = 8;

  for (const item of sorted) {
    const targetSize = fontSizeForCount(
      item.count,
      maxCount,
      minFont,
      maxFont
    );
    let found = false;

    for (
      let fontSize = targetSize;
      fontSize >= minFont && !found;
      fontSize -= 2
    ) {
      const { width: w, height: h } = measureWord(ctx, item.word, fontSize);

      let angle = 0;
      let radius = 0;

      for (let step = 0; step < 900; step++) {
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
          !placed.some((p) => collides(candidate, p, 6))
        ) {
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
          found = true;
          break;
        }

        angle += 0.35;
        radius += 0.42;
      }
    }

    if (!found && placed.length === 0) {
      const fontSize = targetSize;
      const { width: w, height: h } = measureWord(ctx, item.word, fontSize);
      placed.push({
        word: item.word,
        x: cx - w / 2,
        y: cy - h / 2,
        width: w,
        height: h,
        fontSize,
        count: item.count,
        category: item.category,
      });
    }
  }

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

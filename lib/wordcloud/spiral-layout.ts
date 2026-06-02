import type { SizedWord } from "@/lib/wordcloud/sizes";
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

export type MeasureWordFn = (
  word: string,
  fontSize: number
) => { width: number; height: number };

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

function placeSpiralOnce(
  sized: SizedWord[],
  width: number,
  height: number,
  measure: MeasureWordFn,
  pad: number
): PlacedWord[] {
  const placed: PlacedWord[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const margin = 6;

  const sorted = [...sized].sort(
    (a, b) => b.fontSizePx - a.fontSizePx || b.count - a.count
  );

  for (const item of sorted) {
    const fontSize = item.fontSizePx;
    const { width: w, height: h } = measure(item.word, fontSize);

    let angle = 0;
    let radius = 0;
    let found = false;

    for (let step = 0; step < 2000; step++) {
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
        !placed.some((p) => collides(candidate, p, pad))
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

      angle += 0.22;
      radius += 0.38;
    }

    if (!found) {
      for (let step = 0; step < 1200; step++) {
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
          !placed.some((p) => collides(candidate, p, 2))
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
        angle += 0.18;
        radius += 0.42;
      }
    }
  }

  return placed;
}

/** Archimedean spiral — scales down until every word fits (no per-word shrink). */
export function layoutCloudSpiral(
  sized: SizedWord[],
  width: number,
  height: number,
  measure: MeasureWordFn
): PlacedWord[] {
  if (width <= 0 || height <= 0 || sized.length === 0) return [];

  let best: PlacedWord[] = [];
  for (let scale = 1; scale >= 0.42; scale *= 0.88) {
    const scaled = sized.map((s) => ({
      ...s,
      fontSizePx: Math.max(9, Math.round(s.fontSizePx * scale)),
    }));
    const attempt = placeSpiralOnce(scaled, width, height, measure, 4);
    if (attempt.length > best.length) best = attempt;
    if (attempt.length === sized.length) return attempt;
  }

  return best;
}

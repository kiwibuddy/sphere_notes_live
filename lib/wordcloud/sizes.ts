import type { WordCloudWord } from "@/types/session";

export interface SizedWord extends WordCloudWord {
  fontSizePx: number;
}

/** Map count → pixel font size (larger spread when fewer words). */
export function sizeWordCloud(
  words: WordCloudWord[],
  maxWords = 50
): SizedWord[] {
  const sorted = [...words]
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, maxWords);

  const n = sorted.length;
  if (n === 0) return [];

  const maxCount = Math.max(...sorted.map((w) => w.count), 1);
  const minPx = 12;
  const maxPx = n > 45 ? 38 : n > 25 ? 48 : n > 12 ? 56 : 72;

  return sorted.map((w, rank) => {
    const countPart =
      maxCount > 1
        ? Math.log(w.count + 1) / Math.log(maxCount + 1)
        : 0;
    const rankPart = n <= 1 ? 1 : 1 - rank / Math.max(n - 1, 1);
    const blend =
      maxCount > 1 ? 0.9 * countPart + 0.1 * rankPart : rankPart;
    const fontSizePx = Math.round(
      minPx + Math.pow(Math.max(0, Math.min(1, blend)), 0.55) * (maxPx - minPx)
    );

    return { ...w, fontSizePx };
  });
}

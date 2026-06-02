import type { WordCloudWord } from "@/types/session";
import type { WordCloudMode } from "@/types/session";

export const WORD_CLOUD_LIMIT_LIVE = 50;
export const WORD_CLOUD_LIMIT_SESSION = 100;

export function wordCloudLimitForMode(mode: WordCloudMode): number {
  return mode === "live" ? WORD_CLOUD_LIMIT_LIVE : WORD_CLOUD_LIMIT_SESSION;
}

export interface SizedWord extends WordCloudWord {
  fontSizePx: number;
}

/** Map count + rank → pixel font size (fixed per word; layout may scale the set). */
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
  const minPx = 11;
  const maxPx =
    n > 70 ? 36 : n > 45 ? 42 : n > 25 ? 50 : n > 12 ? 58 : 72;

  return sorted.map((w, rank) => {
    const countPart =
      maxCount > 1
        ? Math.log(w.count + 1) / Math.log(maxCount + 1)
        : 0;
    const rankNorm = n <= 1 ? 1 : 1 - rank / Math.max(n - 1, 1);
    const rankPart = Math.pow(rankNorm, 0.55);
    const blend =
      maxCount > 1 ? 0.85 * countPart + 0.15 * rankPart : rankPart;
    const fontSizePx = Math.round(
      minPx + Math.pow(Math.max(0, Math.min(1, blend)), 0.4) * (maxPx - minPx)
    );

    return { ...w, fontSizePx };
  });
}

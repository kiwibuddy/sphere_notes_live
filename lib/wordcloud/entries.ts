import type { WordCloudEntry, WordCloudWord } from "@/types/session";

export type { WordCloudEntry };

export type WordCloudMode = "session" | "5min";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function filterWordcloud(
  entries: WordCloudEntry[],
  mode: WordCloudMode,
  now = Date.now()
): WordCloudWord[] {
  const cutoff = now - FIVE_MIN_MS;

  return entries
    .map((entry) => {
      const timestamps =
        mode === "session"
          ? entry.occurrences
          : entry.occurrences.filter((t) => t >= cutoff);
      return {
        word: entry.word,
        category: entry.category,
        count: timestamps.length,
        occurrences: timestamps,
      };
    })
    .filter((w) => w.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function entryCount(entries: WordCloudEntry[], mode: WordCloudMode): number {
  return filterWordcloud(entries, mode).length;
}

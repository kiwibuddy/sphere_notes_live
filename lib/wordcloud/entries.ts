import type { WordCloudEntry, WordCloudWord } from "@/types/session";
import type { WordCloudMode } from "@/types/session";

export type { WordCloudEntry };

export type { WordCloudMode };

export interface FilterWordcloudOptions {
  now?: number;
  /** Only for `live` mode — occurrences at or after this timestamp (ms). */
  liveSince?: number;
}

export function filterWordcloud(
  entries: WordCloudEntry[],
  mode: WordCloudMode,
  options: FilterWordcloudOptions = {}
): WordCloudWord[] {
  const { now = Date.now(), liveSince } = options;

  return entries
    .map((entry) => {
      let timestamps = entry.occurrences;
      if (mode === "live" && liveSince != null) {
        timestamps = entry.occurrences.filter((t) => t >= liveSince);
      }
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

export function entryCount(
  entries: WordCloudEntry[],
  mode: WordCloudMode,
  options: FilterWordcloudOptions = {}
): number {
  return filterWordcloud(entries, mode, options).length;
}

export function liveResetStorageKey(eventId: string): string {
  return `spherenotes-wordcloud-live-${eventId}`;
}

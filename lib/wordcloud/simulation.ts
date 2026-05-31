import type { SubtitleLine } from "@/types/session";
import type { WordCloudEntry } from "@/types/session";
import { mockWordcloud } from "@/lib/mock/wordcloud";

const FILLERS = new Set([
  "the", "a", "an", "and", "is", "was", "that", "this", "it", "of", "to",
  "in", "for", "on", "with", "as", "at", "by", "from", "or", "be", "are",
  "not", "our", "we", "you", "your", "they", "their", "when", "what", "how",
  "who", "which", "can", "will", "has", "have", "had", "but", "if", "so",
  "all", "every", "each", "into", "through", "about", "than", "then", "them",
  "he", "she", "his", "her", "its", "do", "does", "did", "been", "being",
]);

const THEOLOGY_HINTS = new Set([
  "god", "christ", "jesus", "scripture", "kingdom", "covenant", "mission",
  "revelation", "discipleship", "worldview", "biblical", "theology",
  "creation", "gospel", "faith", "church", "holy", "spirit", "lord",
]);

const NAME_HINTS = new Set([
  "ywam", "nathaniel", "paul", "colossians", "paulus", "jesus", "christ",
]);

const CONCEPT_HINTS = new Set([
  "worldview", "ethics", "human", "truth", "culture", "reality", "authority",
  "cosmos", "discipleship", "creation", "mission",
]);

function categorize(word: string): WordCloudEntry["category"] {
  const lower = word.toLowerCase();
  if (NAME_HINTS.has(lower)) return "names";
  if (THEOLOGY_HINTS.has(lower)) return "theology";
  if (CONCEPT_HINTS.has(lower)) return "concepts";
  return "general";
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !FILLERS.has(w));
}

export function buildSpeechPool(subtitles: SubtitleLine[]): WordCloudEntry[] {
  const map = new Map<string, WordCloudEntry>();

  const add = (raw: string, category?: WordCloudEntry["category"]) => {
    const word =
      raw.charAt(0).toUpperCase() + raw.slice(1).replace(/['-]/g, "");
    if (word.length < 3) return;
    const existing = map.get(word);
    if (existing) return;
    map.set(word, {
      word,
      category: category ?? categorize(raw),
      occurrences: [],
    });
  };

  mockWordcloud.forEach((w) => add(w.word, w.category));
  subtitles.forEach((line) => {
    tokenize(line.textEn).forEach((token) => add(token));
  });

  return Array.from(map.values());
}

/** Seed cloud at go-live with a few words + some older-than-5min hits for demo toggle */
export function seedWordcloud(pool: WordCloudEntry[]): WordCloudEntry[] {
  const now = Date.now();
  const seeds = pool.slice(0, 8);

  return seeds.map((entry, i) => {
    const occurrences: number[] = [];
    const base = 2 + (i % 4);

    for (let n = 0; n < base; n++) {
      occurrences.push(now - n * 45_000);
    }

    // First two words get stale occurrences so "5 min" view drops them partly
    if (i < 2) {
      occurrences.push(now - 6 * 60_000, now - 7 * 60_000);
    }

    return { ...entry, occurrences };
  });
}

export function tickWordcloud(
  entries: WordCloudEntry[],
  pool: WordCloudEntry[]
): WordCloudEntry[] {
  const now = Date.now();
  const pick =
    pool[Math.floor(Math.random() * pool.length)] ??
    pool[0];
  if (!pick) return entries;

  const idx = entries.findIndex(
    (e) => e.word.toLowerCase() === pick.word.toLowerCase()
  );

  if (idx === -1) {
    return [...entries, { ...pick, occurrences: [now] }];
  }

  const next = [...entries];
  next[idx] = {
    ...next[idx],
    occurrences: [...next[idx].occurrences, now],
  };
  return next;
}

/** Occasionally inject a batch of words from current subtitle vocabulary */
export function tickWordcloudFromSpeech(
  entries: WordCloudEntry[],
  pool: WordCloudEntry[],
  burst = 2
): WordCloudEntry[] {
  let next = entries;
  for (let i = 0; i < burst; i++) {
    next = tickWordcloud(next, pool);
  }
  return next;
}

export function resetWordcloudForDay(day: number): WordCloudEntry[] {
  return mockWordcloud.map((w) => ({
    word: w.word,
    category: w.category,
    occurrences: Array.from({ length: Math.max(1, w.count % 6) }, (_, i) =>
      Date.now() - (day * 3600_000 + i * 120_000)
    ),
  }));
}

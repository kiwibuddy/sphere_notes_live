import type { SubtitleLine, WordCloudEntry } from "@/types/session";

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

  subtitles.forEach((line) => {
    tokenize(line.textEn).forEach((token) => add(token));
  });

  return Array.from(map.values());
}

/** Seed cloud at go-live from transcript vocabulary (empty until speech runs). */
export function seedWordcloud(pool: WordCloudEntry[]): WordCloudEntry[] {
  if (pool.length === 0) return [];
  const now = Date.now();
  return pool.slice(0, 12).map((entry) => ({
    ...entry,
    occurrences: [now],
  }));
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

export function resetWordcloudForDay(_day: number): WordCloudEntry[] {
  return [];
}

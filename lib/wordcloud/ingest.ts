import { categorizeWord, tokenizeSpeech } from "@/lib/wordcloud/simulation";

const MAX_TIMESTAMPS_PER_WORD = 200;

export type WordcloudWordMeta = {
  count: number;
  category: string;
  lastAt: string;
  /** Each time the word was heard (ms). Drives size + Live reset filter. */
  at?: number[];
};

export type WordcloudWordsRecord = Record<string, WordcloudWordMeta>;

function displayWord(token: string): string {
  return token.charAt(0).toUpperCase() + token.slice(1).replace(/['-]/g, "");
}

function findWordKey(words: WordcloudWordsRecord, token: string): string | null {
  const lower = token.toLowerCase();
  for (const key of Object.keys(words)) {
    if (key.toLowerCase() === lower) return key;
  }
  return null;
}

function appendTimestamp(existing: WordcloudWordMeta | undefined, ms: number) {
  const prev = existing?.at?.length
    ? existing.at
    : existing?.count
      ? Array.from(
          { length: existing.count },
          (_, i) => ms - i * 1000
        )
      : [];
  const at = [...prev, ms].slice(-MAX_TIMESTAMPS_PER_WORD);
  return at;
}

/** Merge tokens from one finalized speech chunk into the Supabase JSON shape. */
export function ingestSpeechIntoWordcloud(
  words: WordcloudWordsRecord,
  text: string,
  at = new Date()
): WordcloudWordsRecord {
  const trimmed = text.trim();
  if (!trimmed) return words;

  const iso = at.toISOString();
  const ms = at.getTime();
  const next: WordcloudWordsRecord = { ...words };

  for (const token of tokenizeSpeech(trimmed)) {
    const word = displayWord(token);
    if (word.length < 3) continue;

    const key = findWordKey(next, token) ?? word;
    const existing = next[key];
    const atList = appendTimestamp(existing, ms);

    next[key] = {
      count: atList.length,
      category: existing?.category ?? categorizeWord(token),
      lastAt: iso,
      at: atList,
    };
  }

  return next;
}

export function emptyWordcloudRecord(): WordcloudWordsRecord {
  return {};
}

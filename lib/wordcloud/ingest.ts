import { categorizeWord, tokenizeSpeech } from "@/lib/wordcloud/simulation";

export type WordcloudWordsRecord = Record<
  string,
  { count: number; category: string; lastAt: string }
>;

function displayWord(token: string): string {
  return token.charAt(0).toUpperCase() + token.slice(1).replace(/['-]/g, "");
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
  const next: WordcloudWordsRecord = { ...words };

  for (const token of tokenizeSpeech(trimmed)) {
    const word = displayWord(token);
    if (word.length < 3) continue;

    const existing = next[word];
    if (existing) {
      next[word] = {
        ...existing,
        count: existing.count + 1,
        lastAt: iso,
      };
    } else {
      next[word] = {
        count: 1,
        category: categorizeWord(token),
        lastAt: iso,
      };
    }
  }

  return next;
}

export function emptyWordcloudRecord(): WordcloudWordsRecord {
  return {};
}

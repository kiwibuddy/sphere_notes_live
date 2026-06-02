/**
 * Classroom-safe filter for live subtitles (and future translate/correct APIs).
 * Blocks strong profanity only — does not censor legitimate theology (e.g. "hell").
 */

/** Whole-word patterns — case insensitive. */
const BLOCK_PATTERNS: RegExp[] = [
  /\bf+u+c*k+(?:ing|ed|er|s)?\b/gi,
  /\bs+h+i+t+(?:ty|s)?\b/gi,
  /\bb+i+t+c+h+(?:es|ing)?\b/gi,
  /\ba+s+s+h+o+l+e+s?\b/gi,
  /\bb+a+s+t+a+r+d+s?\b/gi,
  /\bc+u+n+t+s?\b/gi,
  /\bc+o+c+k+s?\b/gi,
  /\bp+u+s+s+y\b/gi,
  /\bw+h+o+r+e+s?\b/gi,
  /\bs+l+u+t+s?\b/gi,
  /\bd+i+c+k+(?:head|s)?\b/gi,
  /\bp+i+s+s+(?:ing|ed|es)?\b/gi,
  /\bc+r+a+p+(?:py|s)?\b/gi,
  /\bn+i+g+g+(?:er|a|as)?\b/gi,
  /\bf+a+g+(?:got|s)?\b/gi,
  /\bw+t+f\b/gi,
  /\bstfu\b/gi,
  /\baf\b/gi,
];

const MASK = "•••";

function maskMatch(match: string): string {
  if (match.length <= 3) return MASK;
  return `${match[0]}${MASK}`;
}

/** Remove/replace strong profanity before subtitles or translation. */
export function sanitizeSpeechText(text: string): string {
  if (!text.trim()) return text;

  let out = text;
  for (const pattern of BLOCK_PATTERNS) {
    out = out.replace(pattern, maskMatch);
  }
  return out;
}

export function speechTextIsClean(text: string): boolean {
  return sanitizeSpeechText(text) === text;
}

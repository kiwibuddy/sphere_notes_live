import { sanitizeSpeechText } from "@/lib/speech/sanitize";
import type { SubtitleLine } from "@/types/session";

export interface SubtitleWriterState {
  lines: SubtitleLine[];
  fullTranscript: string;
  currentLineId: string | null;
}

function normalizePhrase(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function cloneLines(lines: SubtitleLine[]): SubtitleLine[] {
  return lines.map((l) => ({ ...l, translations: { ...l.translations } }));
}

function lastClosedLine(lines: SubtitleLine[]): SubtitleLine | undefined {
  return lines.filter((l) => !l.isCurrent).at(-1);
}

function lastClosedIndex(lines: SubtitleLine[]): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].isCurrent) return i;
  }
  return -1;
}

function isExtensionOf(previous: string, incoming: string): boolean {
  const prev = normalizePhrase(previous);
  const next = normalizePhrase(incoming);
  if (!prev || !next) return false;
  return next.startsWith(prev) && next.length > prev.length;
}

function isSamePhrase(previous: string, incoming: string): boolean {
  return normalizePhrase(previous) === normalizePhrase(incoming);
}

/** Collapse archived/live rows where each line repeats the previous phrase with a few more words. */
export function coalesceSubtitleLines(lines: SubtitleLine[]): SubtitleLine[] {
  const out: SubtitleLine[] = [];

  for (const line of lines) {
    const text = line.textEn.trim();
    if (!text) continue;

    if (line.isCurrent) {
      out.push({ ...line, translations: { ...line.translations } });
      continue;
    }

    const prev = out.filter((l) => !l.isCurrent).at(-1);
    if (!prev) {
      out.push({ ...line, translations: { ...line.translations } });
      continue;
    }

    const prevNorm = normalizePhrase(prev.textEn);
    const nextNorm = normalizePhrase(text);

    if (nextNorm.startsWith(prevNorm) || prevNorm.startsWith(nextNorm)) {
      if (nextNorm.length >= prevNorm.length) {
        prev.textEn = text;
        prev.rawTextEn = line.rawTextEn ?? text;
      }
      continue;
    }

    out.push({ ...line, translations: { ...line.translations } });
  }

  return out;
}

export function createSubtitleWriterState(
  lines: SubtitleLine[] = [],
  fullTranscript = ""
): SubtitleWriterState {
  const coalesced = coalesceSubtitleLines(lines);
  const current = coalesced.find((l) => l.isCurrent);
  return {
    lines: coalesced.map((l) => ({ ...l, translations: { ...l.translations } })),
    fullTranscript,
    currentLineId: current?.id ?? null,
  };
}

/** Readable bubble size when the API does not emit a final segment. */
export const MAX_SUBTITLE_BUBBLE_CHARS = 200;

function appendToFullTranscript(fullTranscript: string, previous: string, next: string): string {
  const prevNorm = normalizePhrase(previous);
  const nextNorm = normalizePhrase(next);
  if (!nextNorm) return fullTranscript;
  if (!prevNorm) return `${fullTranscript}${next.trim()} `;
  if (nextNorm === prevNorm) return fullTranscript;
  if (nextNorm.startsWith(prevNorm)) {
    const suffix = next.trim().slice(previous.trim().length).trim();
    if (!suffix) return fullTranscript;
    return `${fullTranscript}${suffix} `;
  }
  return `${fullTranscript}${next.trim()} `;
}

/** Finalize the current bubble (or `transcript`) without duplicating prefix lines. */
export function finalizeSubtitleSegment(
  state: SubtitleWriterState,
  transcript?: string
): SubtitleWriterState {
  let { lines, fullTranscript, currentLineId } = state;
  lines = cloneLines(lines);

  const current = currentLineId
    ? lines.find((l) => l.id === currentLineId)
    : undefined;
  const text = sanitizeSpeechText(
    (transcript ?? current?.textEn ?? "").trim()
  );
  if (!text) return state;

  const closedIdx = lastClosedIndex(lines);
  if (closedIdx >= 0) {
    const closed = lines[closedIdx];
    if (isSamePhrase(closed.textEn, text)) {
      if (currentLineId) {
        lines = lines.filter((l) => l.id !== currentLineId);
      }
      return { lines, fullTranscript, currentLineId: null };
    }
    if (isExtensionOf(closed.textEn, text)) {
      fullTranscript = appendToFullTranscript(
        fullTranscript,
        closed.textEn,
        text
      );
      lines[closedIdx] = {
        ...closed,
        textEn: text,
        rawTextEn: text,
        isCurrent: false,
      };
      if (currentLineId && currentLineId !== closed.id) {
        lines = lines.filter((l) => l.id !== currentLineId);
      }
      return { lines, fullTranscript, currentLineId: null };
    }
  }

  if (!currentLineId) {
    currentLineId = crypto.randomUUID();
    lines.push({
      id: currentLineId,
      textEn: text,
      rawTextEn: text,
      translations: {},
      isCurrent: false,
    });
    fullTranscript = appendToFullTranscript(fullTranscript, "", text);
    return { lines, fullTranscript, currentLineId: null };
  }

  const idx = lines.findIndex((l) => l.id === currentLineId);
  if (idx < 0) return state;

  const previous = closedIdx >= 0 ? lines[closedIdx].textEn : "";
  lines[idx] = {
    ...lines[idx],
    textEn: text,
    rawTextEn: text,
    isCurrent: false,
  };
  fullTranscript = appendToFullTranscript(fullTranscript, previous, text);
  return { lines, fullTranscript, currentLineId: null };
}

/**
 * Apply one Web Speech segment. Interim results are cumulative for the active
 * utterance; finals (or pause-finalize) should use {@link finalizeSubtitleSegment}.
 */
export function applySpeechResult(
  state: SubtitleWriterState,
  transcript: string,
  isFinal: boolean
): SubtitleWriterState {
  const trimmed = sanitizeSpeechText(transcript.trim());
  if (!trimmed) return state;

  if (isFinal) {
    return finalizeSubtitleSegment(state, trimmed);
  }

  let { lines, fullTranscript, currentLineId } = state;
  lines = cloneLines(lines);

  if (currentLineId) {
    const idx = lines.findIndex((l) => l.id === currentLineId);
    if (idx >= 0) {
      lines[idx] = { ...lines[idx], textEn: trimmed, isCurrent: true };
      return { lines, fullTranscript, currentLineId };
    }
    currentLineId = null;
  }

  const closed = lastClosedLine(lines);
  if (closed && (isExtensionOf(closed.textEn, trimmed) || isSamePhrase(closed.textEn, trimmed))) {
    const idx = lines.findIndex((l) => l.id === closed.id);
    lines[idx] = { ...lines[idx], textEn: trimmed, isCurrent: true };
    return { lines, fullTranscript, currentLineId: closed.id };
  }

  currentLineId = crypto.randomUUID();
  lines.push({
    id: currentLineId,
    textEn: trimmed,
    translations: {},
    isCurrent: true,
  });
  return { lines, fullTranscript, currentLineId };
}

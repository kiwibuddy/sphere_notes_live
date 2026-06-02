import { sanitizeSpeechText } from "@/lib/speech/sanitize";
import type { SubtitleLine } from "@/types/session";

export interface SubtitleWriterState {
  lines: SubtitleLine[];
  fullTranscript: string;
  currentLineId: string | null;
}

export function createSubtitleWriterState(
  lines: SubtitleLine[] = [],
  fullTranscript = ""
): SubtitleWriterState {
  const current = lines.find((l) => l.isCurrent);
  return {
    lines: lines.map((l) => ({ ...l, translations: { ...l.translations } })),
    fullTranscript,
    currentLineId: current?.id ?? null,
  };
}

/** Readable bubble size when the API does not emit a final segment. */
export const MAX_SUBTITLE_BUBBLE_CHARS = 200;

/** Apply one Web Speech phrase segment (not a running session transcript). */
export function applySpeechResult(
  state: SubtitleWriterState,
  transcript: string,
  isFinal: boolean
): SubtitleWriterState {
  const trimmed = sanitizeSpeechText(transcript.trim());
  if (!trimmed) return state;

  let { lines, fullTranscript, currentLineId } = state;
  lines = lines.map((l) => ({ ...l, translations: { ...l.translations } }));

  if (!currentLineId) {
    lines = lines.map((l) =>
      l.isCurrent ? { ...l, isCurrent: false } : l
    );
    currentLineId = crypto.randomUUID();
    lines.push({
      id: currentLineId,
      textEn: trimmed,
      translations: {},
      isCurrent: true,
    });
  } else {
    const idx = lines.findIndex((l) => l.id === currentLineId);
    if (idx < 0) {
      lines = lines.map((l) =>
        l.isCurrent ? { ...l, isCurrent: false } : l
      );
      currentLineId = crypto.randomUUID();
      lines.push({
        id: currentLineId,
        textEn: trimmed,
        translations: {},
        ...(isFinal
          ? { rawTextEn: trimmed, isCurrent: false }
          : { isCurrent: true }),
      });
    } else {
      lines[idx] = {
        ...lines[idx],
        textEn: trimmed,
        ...(isFinal ? { rawTextEn: trimmed, isCurrent: false } : { isCurrent: true }),
      };
    }
  }

  if (isFinal) {
    fullTranscript = `${fullTranscript}${trimmed} `;
    currentLineId = null;
  }

  return { lines, fullTranscript, currentLineId };
}

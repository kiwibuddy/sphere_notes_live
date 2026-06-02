import type { SubtitleWriterState } from "@/lib/speech/subtitle-writer";

/** Append a presenter-typed link or message as the live bubble. */
export function appendManualSubtitle(
  state: SubtitleWriterState,
  text: string
): SubtitleWriterState {
  const trimmed = text.trim();
  if (!trimmed) return state;

  const lines = state.lines.map((l) => ({
    ...l,
    translations: { ...l.translations },
    ...(l.isCurrent ? { isCurrent: false as const } : {}),
  }));

  lines.push({
    id: crypto.randomUUID(),
    textEn: trimmed,
    rawTextEn: trimmed,
    translations: {},
    isManual: true,
    isCurrent: true,
  });

  return {
    lines,
    fullTranscript: `${state.fullTranscript}${trimmed} `,
    currentLineId: null,
  };
}

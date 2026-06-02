import type { SubtitleLine } from "@/types/session";
import type { SubtitleWriterState } from "@/lib/speech/subtitle-writer";

export function patchSubtitleLine(
  state: SubtitleWriterState,
  lineId: string,
  patch: Partial<Pick<SubtitleLine, "textEn" | "rawTextEn" | "translations">>
): SubtitleWriterState {
  return {
    ...state,
    lines: state.lines.map((line) =>
      line.id === lineId
        ? {
            ...line,
            ...patch,
            translations: patch.translations
              ? { ...line.translations, ...patch.translations }
              : line.translations,
          }
        : line
    ),
  };
}

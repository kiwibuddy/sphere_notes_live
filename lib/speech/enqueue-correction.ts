import { patchSubtitleLine } from "@/lib/speech/patch-subtitle-line";
import type { SubtitlePusher } from "@/lib/speech/push-subtitles";
import type { SubtitleWriterState } from "@/lib/speech/subtitle-writer";

const pending = new Set<string>();

/** Async Claude correction — updates English text in Supabase when ready. */
export function enqueueSubtitleCorrection(
  getState: () => SubtitleWriterState,
  setState: (state: SubtitleWriterState) => void,
  pusher: SubtitlePusher | null,
  lineId: string,
  rawText: string,
  onError?: (message: string) => void
) {
  const trimmed = rawText.trim();
  if (trimmed.length < 4 || pending.has(lineId)) return;

  pending.add(lineId);

  void fetch("/api/claude/correct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        const message =
          err.error ??
          (res.status === 503
            ? "ANTHROPIC_API_KEY not configured on the server"
            : `Subtitle correction failed (${res.status})`);
        onError?.(message);
        return;
      }
      const data = (await res.json()) as { corrected?: string };
      const corrected = data.corrected?.trim();
      if (!corrected || corrected === trimmed) return;

      const next = patchSubtitleLine(getState(), lineId, { textEn: corrected });
      setState(next);
      pusher?.push(next, true);
      void pusher?.flush();
    })
    .catch(() => {
      /* correction is best-effort */
    })
    .finally(() => {
      pending.delete(lineId);
    });
}

import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import { parseSubtitleLines } from "@/lib/session/supabase-mappers";
import { coalesceSubtitleLines } from "@/lib/speech/subtitle-writer";
import type { Json } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { SubtitleLine } from "@/types/session";

function linesFingerprint(lines: SubtitleLine[]): string {
  return lines
    .map(
      (l) =>
        `${l.id}|${l.isCurrent ? 1 : 0}|${l.isManual ? 1 : 0}|${l.textEn.trim()}`
    )
    .join("\n");
}

export interface SubtitleLinesRepair {
  changed: boolean;
  before: number;
  after: number;
  lines: SubtitleLine[];
}

export type SubtitleRepairResult =
  | ({ ok: true } & SubtitleLinesRepair)
  | { ok: false; error: string };

/** Collapse duplicate prefix bubbles in stored subtitle JSON. */
export function repairSubtitleLines(raw: unknown): SubtitleLinesRepair {
  const parsed = parseSubtitleLines(raw);
  const coalesced = coalesceSubtitleLines(parsed);
  const changed = linesFingerprint(coalesced) !== linesFingerprint(parsed);

  return {
    changed,
    before: parsed.length,
    after: coalesced.length,
    lines: coalesced,
  };
}

export async function repairSubtitlesInDb(
  supabase: SupabaseClient<Database>,
  eventId: string,
  day: number = LIVE_SYNC_DAY
): Promise<SubtitleRepairResult> {
  const { data, error } = await supabase
    .from("day_subtitles")
    .select("lines, full_transcript")
    .eq("event_id", eventId)
    .eq("day", day)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  const { changed, before, after, lines } = repairSubtitleLines(data?.lines ?? []);

  if (!changed) {
    return { ok: true, changed: false, before, after, lines };
  }

  const { error: updateError } = await supabase
    .from("day_subtitles")
    .update({
      lines: lines as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("event_id", eventId)
    .eq("day", day);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true, changed: true, before, after, lines };
}

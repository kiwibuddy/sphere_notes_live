import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import { mapSubtitleLines } from "@/lib/session/supabase-mappers";
import { appendManualSubtitle } from "@/lib/speech/append-manual-subtitle";
import { createSubtitleWriterState } from "@/lib/speech/subtitle-writer";
import type { Json } from "@/lib/supabase/database.types";
import type { SubtitleLine } from "@/types/session";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type SubtitlesClient = SupabaseClient<Database>;

export async function pushLiveMessageToSubtitles(
  supabase: SubtitlesClient,
  eventId: string,
  text: string
): Promise<{ ok: true; lines: SubtitleLine[] } | { ok: false; error: string }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Message is empty" };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Message is too long" };
  }

  const { data, error } = await supabase
    .from("day_subtitles")
    .select("lines, full_transcript")
    .eq("event_id", eventId)
    .eq("day", LIVE_SYNC_DAY)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  const state = createSubtitleWriterState(
    mapSubtitleLines(data?.lines ?? []),
    data?.full_transcript ?? ""
  );
  const next = appendManualSubtitle(state, trimmed);

  const { data: saved, error: saveError } = await supabase
    .from("day_subtitles")
    .upsert(
      {
        event_id: eventId,
        day: LIVE_SYNC_DAY,
        lines: next.lines as unknown as Json,
        full_transcript: next.fullTranscript,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,day" }
    )
    .select("lines")
    .maybeSingle();

  if (saveError) {
    return { ok: false, error: saveError.message };
  }
  if (!saved?.lines) {
    return { ok: false, error: "Could not save live message" };
  }

  return { ok: true, lines: mapSubtitleLines(saved.lines) };
}

import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import { SLIDE_SYNC_DAY } from "@/lib/slides/constants";
import { clearQuestionsForDay } from "@/lib/session/questions-sync";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

/** Clears shared live content in Supabase (subtitles, AI notes, word cloud, Q&A, session map). */
export async function clearLiveBucketInDb(
  supabase: Client,
  eventId: string,
  day: number = LIVE_SYNC_DAY
): Promise<void> {
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("day_subtitles")
      .update({
        lines: [],
        full_transcript: "",
        updated_at: now,
      })
      .eq("event_id", eventId)
      .eq("day", day),
    supabase
      .from("day_wordcloud")
      .update({ words: {}, updated_at: now })
      .eq("event_id", eventId)
      .eq("day", day),
    supabase
      .from("note_cards")
      .delete()
      .eq("event_id", eventId)
      .eq("day", day),
    supabase
      .from("session_segments")
      .delete()
      .eq("event_id", eventId)
      .eq("day", day),
    clearQuestionsForDay(supabase, eventId, day),
  ]);
}

/** Resets projector display, reactions, and slide index for a new session. */
export async function resetLiveSessionChrome(
  supabase: Client,
  eventId: string,
  day: number = LIVE_SYNC_DAY
): Promise<void> {
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("day_display")
      .update({
        mode: "idle",
        quote_text: "",
        question_id: null,
        question_text: null,
        question_votes: 0,
        updated_at: now,
      })
      .eq("event_id", eventId)
      .eq("day", day),
    supabase
      .from("day_reactions")
      .update({
        fire: 0,
        clap: 0,
        think: 0,
        question: 0,
      })
      .eq("event_id", eventId)
      .eq("day", day),
    supabase
      .from("day_slides")
      .update({ current: 1, updated_at: now })
      .eq("event_id", eventId)
      .eq("day", SLIDE_SYNC_DAY),
  ]);
}

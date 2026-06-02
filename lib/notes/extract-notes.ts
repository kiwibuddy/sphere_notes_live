import {
  summarizeNoteCard,
  type ProposedNoteCard,
} from "@/lib/claude/notes-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import type { NoteCard } from "@/types/session";

export const NOTES_EXTRACT_INTERVAL_MS = 600_000;
const MIN_TRANSCRIPT_CHARS = 120;
const MIN_NEW_CHARS = 40;

function mapRowToSummary(row: {
  type: string;
  content: unknown;
}): Pick<NoteCard, "type" | "content"> {
  return {
    type: row.type as NoteCard["type"],
    content: (row.content ?? {}) as Record<string, unknown>,
  };
}

async function fetchExistingSummaries(
  eventId: string,
  day: number
): Promise<Pick<NoteCard, "type" | "content">[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("note_cards")
    .select("type, content")
    .eq("event_id", eventId)
    .eq("day", day)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return [];
  return data.map(mapRowToSummary);
}

async function insertNoteCards(
  eventId: string,
  day: number,
  cards: ProposedNoteCard[]
): Promise<void> {
  if (!cards.length) return;
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("note_cards").insert(
    cards.map((c) => ({
      event_id: eventId,
      day,
      type: c.type,
      content: c.content as unknown as Json,
    }))
  );
  if (error) throw new Error(error.message);
}

/** Poll while live; extract AI note cards every ~10 min from new transcript. */
export function startNoteExtraction(params: {
  eventId: string;
  day: number;
  getStatus: () => "waiting" | "live" | "paused" | "ended";
  getTranscript: () => string;
  onError?: (message: string) => void;
}): () => void {
  let lastExtractedLength = 0;
  let inFlight = false;

  const tick = async () => {
    if (params.getStatus() !== "live") return;

    const transcript = params.getTranscript().trim();
    if (transcript.length < MIN_TRANSCRIPT_CHARS) return;

    const newChars = transcript.length - lastExtractedLength;
    if (newChars < MIN_NEW_CHARS && lastExtractedLength > 0) return;
    if (inFlight) return;

    inFlight = true;
    const snapshotLength = transcript.length;

    try {
      const existing = await fetchExistingSummaries(params.eventId, params.day);
      const existingSummaries = existing.map(summarizeNoteCard);

      const newTranscript = transcript.slice(lastExtractedLength).trim();
      if (newTranscript.length < MIN_NEW_CHARS && lastExtractedLength > 0) return;

      const res = await fetch("/api/claude/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTranscript:
            lastExtractedLength > 0 ? newTranscript : transcript,
          existingSummaries,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        const message =
          err.error ??
          (res.status === 503
            ? "ANTHROPIC_API_KEY not configured on the server"
            : `Notes extraction failed (${res.status})`);
        params.onError?.(message);
        return;
      }

      const data = (await res.json()) as { cards?: ProposedNoteCard[] };
      const proposed = data.cards ?? [];
      if (proposed.length) {
        await insertNoteCards(params.eventId, params.day, proposed);
      }

      lastExtractedLength = snapshotLength;
    } catch (e) {
      params.onError?.(e instanceof Error ? e.message : "Notes extraction failed");
    } finally {
      inFlight = false;
    }
  };

  const id = window.setInterval(() => {
    void tick();
  }, NOTES_EXTRACT_INTERVAL_MS);

  void tick();

  return () => window.clearInterval(id);
}

import { getConfigEventId } from "@/lib/session/join-url";
import { repairSubtitlesInDb } from "@/lib/speech/repair-subtitles";
import {
  getSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Collapse duplicate cumulative subtitle bubbles in Supabase.
 * POST { eventId?: string }
 */
export async function POST(request: Request) {
  let body: { eventId?: string };
  try {
    body = (await request.json().catch(() => ({}))) as { eventId?: string };
  } catch {
    body = {};
  }

  const eventId =
    typeof body.eventId === "string" && body.eventId.trim()
      ? body.eventId.trim()
      : getConfigEventId();

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();
    const result = await repairSubtitlesInDb(supabase, eventId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Repair failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

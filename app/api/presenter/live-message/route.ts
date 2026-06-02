import { getConfigEventId } from "@/lib/session/join-url";
import { pushLiveMessageToSubtitles } from "@/lib/speech/push-live-message";
import {
  getSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Presenter: push a typed link or note to the student Live tab.
 * POST { text: string, eventId?: string }
 */
export async function POST(request: Request) {
  let body: { text?: string; eventId?: string };
  try {
    body = (await request.json()) as { text?: string; eventId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
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
    const result = await pushLiveMessageToSubtitles(supabase, eventId, text);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, lines: result.lines });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

/** When implemented: sanitizeSpeechText + Claude prompt to never add profanity. */

/**
 * LIVE: Claude Haiku subtitle correction.
 * POST { text: string, dictionary?: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { text } = body as { text: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // Not implemented yet — do not echo input as a fake correction
  return NextResponse.json(
    { error: "Subtitle correction API not implemented yet" },
    { status: 501 }
  );
}

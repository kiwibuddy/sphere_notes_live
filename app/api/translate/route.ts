import { NextResponse } from "next/server";

/** When implemented: sanitizeSpeechText(text) before Google Translate. */

/**
 * LIVE: Google Cloud Translation NMT for Live tab subtitles only.
 * POST { text: string, targetLocale: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_TRANSLATE_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { text, targetLocale } = body as {
    text: string;
    targetLocale: string;
  };

  if (!text?.trim() || !targetLocale) {
    return NextResponse.json(
      { error: "text and targetLocale are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Translation API not implemented yet" },
    { status: 501 }
  );
}

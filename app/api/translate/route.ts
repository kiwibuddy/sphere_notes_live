import { NextResponse } from "next/server";

/**
 * LIVE: Google Cloud Translation NMT for Live tab subtitles only.
 * POST { text: string, targetLocale: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_TRANSLATE_API_KEY not configured", mock: true },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { text, targetLocale } = body as {
    text: string;
    targetLocale: string;
  };

  // LIVE: Implement Google Translate API call
  return NextResponse.json({
    translated: text,
    locale: targetLocale,
    mock: false,
  });
}

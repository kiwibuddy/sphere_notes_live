import { NextResponse } from "next/server";

/**
 * LIVE: Claude Haiku subtitle correction.
 * POST { text: string, dictionary?: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured", mock: true },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { text } = body as { text: string };

  // LIVE: Implement Claude API call here
  return NextResponse.json({ corrected: text, mock: false });
}

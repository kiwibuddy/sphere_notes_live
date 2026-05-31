import { NextResponse } from "next/server";

/**
 * LIVE: Claude Sonnet structured notes extraction.
 * POST { transcript: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured", cards: [], mock: true },
      { status: 503 }
    );
  }

  await request.json();

  // LIVE: Implement Claude structured JSON extraction
  return NextResponse.json({ cards: [], mock: false });
}

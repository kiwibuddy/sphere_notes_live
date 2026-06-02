import { NextResponse } from "next/server";

/**
 * LIVE: Claude Sonnet structured notes extraction.
 * POST { transcript: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  await request.json();

  return NextResponse.json(
    { error: "AI notes API not implemented yet" },
    { status: 501 }
  );
}

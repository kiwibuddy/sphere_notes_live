import { sanitizeSpeechText } from "@/lib/speech/sanitize";
import { NextResponse } from "next/server";

const DEFAULT_MODEL = "claude-3-5-haiku-20241022";

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
  const { text, dictionary } = body as { text: string; dictionary?: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const safeText = sanitizeSpeechText(text);

  const dictionaryHint = dictionary?.trim()
    ? `\nPrefer these spellings when relevant:\n${dictionary.trim()}\n`
    : "";

  const prompt = `You correct live classroom transcription for students. Fix grammar, punctuation, and obvious speech-to-text errors only. Do not add new ideas. Do not remove or censor legitimate theology (including words like hell, Satan, sin). Keep the same tone and length.${dictionaryHint}

Return ONLY the corrected English sentence — no quotes, labels, or explanation.

Text:
${safeText}`;

  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[claude/correct]", response.status, errText);
    return NextResponse.json(
      { error: "Claude correction failed" },
      { status: 502 }
    );
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  const corrected =
    data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";

  if (!corrected) {
    return NextResponse.json(
      { error: "Empty correction response" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    corrected: sanitizeSpeechText(corrected),
    raw: safeText,
  });
}

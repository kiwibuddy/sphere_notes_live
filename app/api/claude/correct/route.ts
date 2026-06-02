import { anthropicMessageText } from "@/lib/claude/client";
import { sanitizeSpeechText } from "@/lib/speech/sanitize";
import { NextResponse } from "next/server";

const DEFAULT_MODEL = "claude-haiku-4-5";

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

  let corrected: string;
  try {
    corrected = await anthropicMessageText({
      apiKey,
      model,
      maxTokens: 512,
      userPrompt: prompt,
    });
  } catch (e) {
    console.error("[claude/correct]", e);
    return NextResponse.json(
      { error: "Claude correction failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    corrected: sanitizeSpeechText(corrected),
    raw: safeText,
  });
}

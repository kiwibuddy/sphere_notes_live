import { anthropicMessageText } from "@/lib/claude/client";
import { buildNotesPrompt } from "@/lib/claude/notes-prompt";
import { parseProposedNoteCards } from "@/lib/claude/notes-schema";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const DEFAULT_NOTES_MODEL = "claude-sonnet-4-20250514";

let scriptureCache: Record<string, Record<string, string>> | null = null;

async function loadScriptureLookup(): Promise<
  Record<string, Record<string, string>>
> {
  if (scriptureCache) return scriptureCache;
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "bible",
      "sample-verses.json"
    );
    const raw = await readFile(filePath, "utf8");
    scriptureCache = JSON.parse(raw) as Record<string, Record<string, string>>;
    return scriptureCache;
  } catch {
    return {};
  }
}

/**
 * LIVE: Claude Sonnet structured notes extraction.
 * POST { transcript: string, newSinceChars?: number, existingSummaries?: string[] }
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
  const { transcript, newSinceChars, existingSummaries } = body as {
    transcript?: string;
    newSinceChars?: number;
    existingSummaries?: string[];
  };

  const trimmed = transcript?.trim() ?? "";
  if (trimmed.length < 40) {
    return NextResponse.json(
      { error: "transcript is required (min ~40 chars)" },
      { status: 400 }
    );
  }

  const scriptureJson = await loadScriptureLookup();
  const prompt = buildNotesPrompt({
    transcript: trimmed,
    newSinceChars:
      typeof newSinceChars === "number" && newSinceChars > 0
        ? newSinceChars
        : 0,
    existingSummaries: existingSummaries ?? [],
    scriptureJson,
  });

  const model =
    process.env.ANTHROPIC_NOTES_MODEL ??
    process.env.ANTHROPIC_MODEL ??
    DEFAULT_NOTES_MODEL;

  try {
    const raw = await anthropicMessageText({
      apiKey,
      model,
      maxTokens: 2048,
      userPrompt: prompt,
    });

    const cards = parseProposedNoteCards(raw);
    return NextResponse.json({ cards });
  } catch (e) {
    console.error("[claude/notes]", e);
    return NextResponse.json(
      { error: "Claude notes extraction failed" },
      { status: 502 }
    );
  }
}

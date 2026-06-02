import { sanitizeSpeechText } from "@/lib/speech/sanitize";
import { toGoogleTranslateCode } from "@/lib/translate/locale-codes";
import type { SupportedLocale } from "@/types/session";
import { NextResponse } from "next/server";

const cache = new Map<string, string>();
const CACHE_MAX = 500;

function cacheKey(text: string, target: string) {
  return `${target}::${text}`;
}

function remember(key: string, value: string) {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, value);
}

/**
 * LIVE: Google Cloud Translation NMT for Live tab subtitles only.
 * POST { text?: string, texts?: string[], targetLocale: string }
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
  const { text, texts, targetLocale } = body as {
    text?: string;
    texts?: string[];
    targetLocale: SupportedLocale;
  };

  const target = toGoogleTranslateCode(targetLocale);
  if (!target) {
    return NextResponse.json({ error: "English does not require translation" }, {
      status: 400,
    });
  }

  const inputs = (
    texts?.length ? texts : text ? [text] : []
  )
    .map((t) => sanitizeSpeechText(t.trim()))
    .filter(Boolean);

  if (inputs.length === 0) {
    return NextResponse.json(
      { error: "text or texts is required" },
      { status: 400 }
    );
  }

  const outputs: string[] = new Array(inputs.length);
  const toFetch: string[] = [];
  const fetchIndexes: number[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const key = cacheKey(inputs[i], target);
    const hit = cache.get(key);
    if (hit) {
      outputs[i] = hit;
    } else {
      toFetch.push(inputs[i]);
      fetchIndexes.push(i);
    }
  }

  if (toFetch.length > 0) {
    const url = new URL("https://translation.googleapis.com/language/translate/v2");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: toFetch,
        target,
        source: "en",
        format: "text",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[translate]", response.status, errText);
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      data?: { translations?: { translatedText: string }[] };
    };

    const translated = data.data?.translations ?? [];
    for (let j = 0; j < fetchIndexes.length; j++) {
      const i = fetchIndexes[j];
      const out = sanitizeSpeechText(translated[j]?.translatedText ?? inputs[i]);
      outputs[i] = out;
      remember(cacheKey(inputs[i], target), out);
    }
  }

  if (text && !texts) {
    return NextResponse.json({ translated: outputs[0], targetLocale });
  }

  return NextResponse.json({ translations: outputs, targetLocale });
}

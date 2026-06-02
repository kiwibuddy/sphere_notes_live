import type { NoteCard } from "@/types/session";
import { summarizeNoteCard } from "@/lib/claude/notes-schema";

export function buildNotesPrompt(params: {
  newTranscript: string;
  existingCards?: Pick<NoteCard, "type" | "content">[];
  existingSummaries?: string[];
  scriptureJson: Record<string, Record<string, string>>;
}): string {
  const fromCards =
    params.existingCards?.map(summarizeNoteCard).filter(Boolean) ?? [];
  const fromSummaries = params.existingSummaries?.filter(Boolean) ?? [];
  const merged = [...fromCards, ...fromSummaries];
  const existing = merged.length > 0 ? merged.join("\n") : "(none yet)";

  const scriptureBlock = JSON.stringify(params.scriptureJson, null, 2);

  return `You extract structured study notes from live classroom teaching (Biblical Worldview / theology). Return ONLY valid JSON — no markdown fences, no commentary.

Output shape: a JSON array of 0–3 NEW cards. Each card:
{ "type": "<one of section|bullets|quote|scripture|concept|diagram|story>", "content": { ... } }

Content shapes (required fields only):
- section: { "title": string }
- bullets: { "items": string[] }  (2–5 concise points)
- quote: { "quote": string }  (memorable line from the teacher, verbatim when possible)
- scripture: { "reference": string, "translation": "BSB"|"KJV", "text": string }
- concept: { "term": string, "definition": string }
- diagram: { "title": string, "nodes": string[] }  (simple ordered list, 3–6 nodes)
- story: { "title": string }  (illustration or narrative segment title only)

Rules:
- Do NOT duplicate cards already listed below.
- Prefer substance over filler; skip if nothing new worth a card.
- Do not invent scripture references. If a passage is cited and appears in the scripture lookup below, copy text from there (match translation).
- Keep quotes and bullets faithful to the transcript; light cleanup only.
- Theology terms (hell, Satan, sin, etc.) are legitimate — do not censor.
- Extract only from the new transcript segment below — not from cards already listed.

Already extracted (do not repeat):
${existing}

Scripture lookup (use when reference matches):
${scriptureBlock}

New transcript since last extraction:
${params.newTranscript.trim()}`;
}

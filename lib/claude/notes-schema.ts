import type { NoteCard, NoteCardType } from "@/types/session";

const NOTE_TYPES: NoteCardType[] = [
  "section",
  "bullets",
  "quote",
  "scripture",
  "concept",
  "diagram",
  "story",
];

export interface ProposedNoteCard {
  type: NoteCardType;
  content: Record<string, unknown>;
}

function isNoteType(v: unknown): v is NoteCardType {
  return typeof v === "string" && NOTE_TYPES.includes(v as NoteCardType);
}

function hasString(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === "string" && (obj[key] as string).trim().length > 0;
}

function hasStringArray(obj: Record<string, unknown>, key: string): boolean {
  const v = obj[key];
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function validateContent(
  type: NoteCardType,
  content: Record<string, unknown>
): boolean {
  switch (type) {
    case "section":
      return hasString(content, "title");
    case "bullets":
      return hasStringArray(content, "items");
    case "quote":
      return hasString(content, "quote");
    case "scripture":
      return (
        hasString(content, "reference") &&
        hasString(content, "translation") &&
        hasString(content, "text")
      );
    case "concept":
      return hasString(content, "term") && hasString(content, "definition");
    case "diagram":
      return hasString(content, "title") && hasStringArray(content, "nodes");
    case "story":
      return hasString(content, "title");
    default:
      return false;
  }
}

export function summarizeNoteCard(card: Pick<NoteCard, "type" | "content">): string {
  const c = card.content;
  switch (card.type) {
    case "section":
      return `Section: ${c.title}`;
    case "bullets":
      return `Bullets: ${(c.items as string[] | undefined)?.slice(0, 3).join("; ")}`;
    case "quote":
      return `Quote: ${(c.quote as string | undefined)?.slice(0, 120)}`;
    case "scripture":
      return `Scripture: ${c.reference} (${c.translation})`;
    case "concept":
      return `Concept: ${c.term}`;
    case "diagram":
      return `Diagram: ${c.title}`;
    case "story":
      return `Story: ${c.title}`;
    default:
      return card.type;
  }
}

export function parseProposedNoteCards(raw: string): ProposedNoteCard[] {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = (fenced?.[1] ?? trimmed).trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return [];
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { cards?: unknown }).cards)
      ? (parsed as { cards: unknown[] }).cards
      : [];

  const out: ProposedNoteCard[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as { type?: unknown; content?: unknown };
    if (!isNoteType(row.type) || !row.content || typeof row.content !== "object") {
      continue;
    }
    const content = row.content as Record<string, unknown>;
    if (!validateContent(row.type, content)) continue;
    out.push({ type: row.type, content });
  }

  return out;
}

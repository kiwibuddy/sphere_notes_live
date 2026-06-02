import { WORD_CLOUD_UI_ENABLED } from "@/lib/features";
import type { WordCloudEntry } from "@/lib/wordcloud/entries";
import type {
  DayInfo,
  DisplayMode,
  NoteCard,
  Question,
  Reactions,
  SessionMeta,
  SessionStatus,
  SubtitleLine,
} from "@/types/session";

export function mapEventRow(row: {
  id: string;
  title: string;
  presenter: string;
  total_days: number;
  current_day: number;
  status: string;
}): SessionMeta {
  return {
    eventId: row.id,
    title: row.title,
    presenter: row.presenter,
    totalDays: row.total_days,
    currentDay: row.current_day,
    status: row.status as SessionStatus,
  };
}

export function mapDayMetaRows(
  rows: { day: number; topic: string; date: string }[]
): Record<number, DayInfo> {
  const out: Record<number, DayInfo> = {};
  for (const r of rows) {
    out[r.day] = { topic: r.topic, date: r.date };
  }
  return out;
}

export function mapQuestionRow(
  row: {
    id: string;
    text: string;
    votes: number;
    status: string;
    created_at: string;
  },
  votedIds: Set<string>
): Question {
  return {
    id: row.id,
    text: row.text,
    votes: row.votes,
    createdAt: formatQuestionTime(row.created_at),
    status: row.status as Question["status"],
    hasVoted: votedIds.has(row.id),
  };
}

function formatQuestionTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "just now";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function mapReactionsRow(row: {
  fire: number;
  clap: number;
  think: number;
  question: number;
}): Reactions {
  return {
    fire: row.fire,
    clap: row.clap,
    think: row.think,
    question: row.question,
  };
}

export function mapSubtitleLines(lines: unknown): SubtitleLine[] {
  if (!Array.isArray(lines)) return [];
  return lines.filter(isSubtitleLine);
}

function isSubtitleLine(v: unknown): v is SubtitleLine {
  if (!v || typeof v !== "object") return false;
  const o = v as SubtitleLine;
  return typeof o.id === "string" && typeof o.textEn === "string";
}

export function mapNoteCards(
  rows: {
    id: string;
    type: string;
    content: unknown;
    created_at: string;
  }[]
): NoteCard[] {
  return rows.map((r) => ({
    id: r.id,
    type: r.type as NoteCard["type"],
    createdAt: r.created_at,
    content: (r.content ?? {}) as Record<string, unknown>,
  }));
}

export function mapWordcloudJson(
  words: Record<
    string,
    { count: number; category: string; lastAt: string; at?: number[] }
  >
): WordCloudEntry[] {
  const entries: WordCloudEntry[] = [];
  for (const [word, meta] of Object.entries(words)) {
    const last = new Date(meta.lastAt).getTime();
    const base = Number.isNaN(last) ? Date.now() : last;
    const occurrences =
      meta.at?.length && meta.at.every((t) => typeof t === "number")
        ? meta.at
        : Array.from(
            { length: Math.max(1, meta.count ?? 1) },
            (_, i) => base - i * 1000
          );

    entries.push({
      word,
      category: (meta.category || "general") as WordCloudEntry["category"],
      occurrences,
    });
  }
  return entries.sort(
    (a, b) => b.occurrences.length - a.occurrences.length
  );
}

export function displayModeFromRow(row: {
  mode: string;
  quote_text: string;
  question_id: string | null;
  question_text: string | null;
  question_votes: number;
}): {
  mode: DisplayMode;
  quote: string;
  question: { id: string; text: string; votes: number } | null;
} {
  let mode = row.mode as DisplayMode;
  if (!WORD_CLOUD_UI_ENABLED && mode === "wordcloud") {
    mode = "idle";
  }
  return {
    mode,
    quote: row.quote_text ?? "",
    question:
      row.question_id && row.question_text
        ? {
            id: row.question_id,
            text: row.question_text,
            votes: row.question_votes,
          }
        : null,
  };
}

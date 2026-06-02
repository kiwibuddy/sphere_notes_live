import { getDayStatus } from "@/lib/session/defaults";
import type {
  DayArchive,
  DayInfo,
  SessionMeta,
  SessionSegment,
  SlideInfo,
  SubtitleLine,
  Question,
  NoteCard,
  WordCloudWord,
} from "@/types/session";
import type { WordCloudEntry } from "@/lib/wordcloud/entries";
import { coalesceSubtitleLines } from "@/lib/speech/subtitle-writer";

export function getWeekDayList(
  meta: SessionMeta,
  dayInfoMap: Record<number, DayInfo>
): Pick<DayArchive, "day" | "label" | "date" | "status">[] {
  return Array.from({ length: meta.totalDays }, (_, i) => {
    const day = i + 1;
    const info = dayInfoMap[day];
    return {
      day,
      label: info?.topic ?? `Day ${day}`,
      date: info?.date ?? "",
      status: getDayStatus(day, meta.currentDay),
    };
  });
}

export function buildLiveDayArchive(
  day: number,
  meta: SessionMeta,
  dayInfoMap: Record<number, DayInfo>,
  live: {
    subtitles: SubtitleLine[];
    questions: Question[];
    notes: NoteCard[];
    slides: SlideInfo;
    wordcloudEntries: WordCloudEntry[];
    sessionMap: SessionSegment[];
  }
): DayArchive {
  const info = dayInfoMap[day];
  return {
    day,
    label: info?.topic ?? `Day ${day}`,
    date: info?.date ?? "",
    status: getDayStatus(day, meta.currentDay),
    subtitles: coalesceSubtitleLines(live.subtitles),
    questions: live.questions,
    notes: live.notes,
    slides: live.slides,
    wordcloud: wordcloudEntriesToWords(live.wordcloudEntries),
    sessionMap: live.sessionMap,
  };
}

export function wordcloudEntriesToWords(
  entries: WordCloudEntry[]
): WordCloudWord[] {
  return entries.map((e) => ({
    word: e.word,
    count: e.occurrences.length,
    category: e.category,
    occurrences: e.occurrences,
  }));
}

export function parseArchiveSnapshot(
  day: number,
  meta: SessionMeta,
  dayInfoMap: Record<number, DayInfo>,
  snapshot: unknown
): DayArchive | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const s = snapshot as Record<string, unknown>;
  const info = dayInfoMap[day];
  return {
    day,
    label: (s.label as string) ?? info?.topic ?? `Day ${day}`,
    date: (s.date as string) ?? info?.date ?? "",
    status: getDayStatus(day, meta.currentDay),
    subtitles: Array.isArray(s.subtitles)
      ? coalesceSubtitleLines(s.subtitles as SubtitleLine[])
      : [],
    questions: Array.isArray(s.questions) ? (s.questions as Question[]) : [],
    notes: Array.isArray(s.notes) ? (s.notes as NoteCard[]) : [],
    slides: (s.slides as SlideInfo) ?? {
      current: 1,
      total: 0,
      images: [],
    },
    wordcloud: Array.isArray(s.wordcloud)
      ? (s.wordcloud as WordCloudWord[])
      : [],
    sessionMap: Array.isArray(s.sessionMap)
      ? (s.sessionMap as SessionSegment[])
      : [],
  };
}

export function emptyDayArchive(
  day: number,
  meta: SessionMeta,
  dayInfoMap: Record<number, DayInfo>
): DayArchive {
  const info = dayInfoMap[day];
  return {
    day,
    label: info?.topic ?? `Day ${day}`,
    date: info?.date ?? "",
    status: getDayStatus(day, meta.currentDay),
    subtitles: [],
    questions: [],
    notes: [],
    slides: { current: 1, total: 0, images: [] },
    wordcloud: [],
    sessionMap: [],
  };
}

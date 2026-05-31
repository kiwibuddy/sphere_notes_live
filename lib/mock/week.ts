import type { DayArchive } from "@/types/session";
import { dayLabels, getDayStatus } from "./session";
import { getSubtitlesForDay } from "./subtitles";
import { getQuestionsForDay } from "./questions";
import { getNotesForDay } from "./notes";
import { getWordcloudForDay } from "./wordcloud";
import { getSlidesForDay } from "./slides";
import { getSessionMapForDay } from "./sessionMap";

export function buildDayArchive(
  day: number,
  currentDay: number
): DayArchive {
  const info = dayLabels[day];
  return {
    day,
    label: info.label,
    date: info.date,
    status: getDayStatus(day, currentDay),
    subtitles: getSubtitlesForDay(day),
    questions: getQuestionsForDay(day),
    notes: getNotesForDay(day),
    slides: getSlidesForDay(day),
    wordcloud: getWordcloudForDay(day),
    sessionMap: getSessionMapForDay(day),
  };
}

export function getWeekDays(currentDay: number): DayArchive[] {
  return [1, 2, 3, 4].map((day) => buildDayArchive(day, currentDay));
}

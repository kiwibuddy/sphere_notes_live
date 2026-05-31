import type { DayArchive } from "@/types/session";
import { defaultDayInfo, getDayStatus } from "./session";
import type { DayInfo, SlideInfo } from "@/types/session";
import { getSubtitlesForDay } from "./subtitles";
import { getQuestionsForDay } from "./questions";
import { getNotesForDay } from "./notes";
import { getWordcloudForDay } from "./wordcloud";
import { getSlidesForDay } from "./slides";
import { getSessionMapForDay } from "./sessionMap";

export function buildDayArchive(
  day: number,
  currentDay: number,
  dayInfoMap: Record<number, DayInfo> = defaultDayInfo,
  slidesOverride?: SlideInfo
): DayArchive {
  const info = dayInfoMap[day] ?? defaultDayInfo[day];
  return {
    day,
    label: info.topic,
    date: info.date,
    status: getDayStatus(day, currentDay),
    subtitles: getSubtitlesForDay(day),
    questions: getQuestionsForDay(day),
    notes: getNotesForDay(day),
    slides: slidesOverride ?? getSlidesForDay(day),
    wordcloud: getWordcloudForDay(day),
    sessionMap: getSessionMapForDay(day),
  };
}

export function getWeekDays(
  currentDay: number,
  dayInfoMap: Record<number, DayInfo> = defaultDayInfo
): DayArchive[] {
  return [1, 2, 3, 4].map((day) => buildDayArchive(day, currentDay, dayInfoMap));
}

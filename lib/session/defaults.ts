import type { DayArchive, DayInfo, SessionMeta } from "@/types/session";

export const EVENT_ID = "biblical-worldview-2026";

export const defaultMeta: SessionMeta = {
  eventId: EVENT_ID,
  title: "Biblical Worldview",
  presenter: "Nathaniel Baldock",
  currentDay: 1,
  totalDays: 4,
  status: "waiting",
};

export const defaultDayInfo: Record<number, DayInfo> = {
  1: { topic: "The Kingdom Blueprint", date: "" },
  2: { topic: "Day 2", date: "" },
  3: { topic: "Day 3", date: "" },
  4: { topic: "Day 4", date: "" },
};

export function getDayStatus(
  day: number,
  currentDay: number
): DayArchive["status"] {
  if (day < currentDay) return "archived";
  if (day === currentDay) return "today";
  return "upcoming";
}

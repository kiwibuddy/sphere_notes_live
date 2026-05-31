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
  1: { topic: "Day 1", date: "Monday 2 June" },
  2: { topic: "Day 2", date: "Tuesday 3 June" },
  3: { topic: "Day 3", date: "Wednesday 4 June" },
  4: { topic: "Day 4", date: "Thursday 5 June" },
};

/** @deprecated Use defaultDayInfo or session context getDayInfo */
export const dayLabels: Record<number, { label: string; date: string }> =
  Object.fromEntries(
    Object.entries(defaultDayInfo).map(([day, info]) => [
      day,
      { label: info.topic, date: info.date },
    ])
  );

export function getDayStatus(
  day: number,
  currentDay: number
): DayArchive["status"] {
  if (day < currentDay) return "archived";
  if (day === currentDay) return "today";
  return "upcoming";
}

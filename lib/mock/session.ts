import type { DayArchive, SessionMeta } from "@/types/session";

export const EVENT_ID = "biblical-worldview-2026";

export const defaultMeta: SessionMeta = {
  eventId: EVENT_ID,
  title: "Biblical Worldview",
  presenter: "Nathaniel Baldock",
  currentDay: 3,
  totalDays: 4,
  status: "waiting",
};

export const dayLabels: Record<number, { label: string; date: string }> = {
  1: { label: "Day 1", date: "Monday 2 June" },
  2: { label: "Day 2", date: "Tuesday 3 June" },
  3: { label: "Day 3", date: "Wednesday 4 June" },
  4: { label: "Day 4", date: "Thursday 5 June" },
};

export function getDayStatus(
  day: number,
  currentDay: number
): DayArchive["status"] {
  if (day < currentDay) return "archived";
  if (day === currentDay) return "today";
  return "upcoming";
}

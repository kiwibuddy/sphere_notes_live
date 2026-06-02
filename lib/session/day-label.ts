import type { DayInfo } from "@/types/session";

/** Human session name from day topic (what you teach today). */
export function sessionTopicTitle(info: DayInfo, day: number): string {
  const topic = info.topic.trim();
  if (topic && topic !== `Day ${day}`) return topic;
  return `Day ${day}`;
}

/** Primary header: "Introduction · Tuesday 2 June" — no "Day 4" prefix. */
export function formatSessionHeader(
  info: DayInfo,
  day: number,
  includeDate = true
): string {
  const title = sessionTopicTitle(info, day);
  if (includeDate && info.date.trim()) {
    return `${title} · ${info.date}`;
  }
  return title;
}

/** Speech / student hero: topic only. */
export function formatSessionTitle(info: DayInfo, day: number): string {
  return sessionTopicTitle(info, day);
}

/** Secondary line under title: date only. */
export function formatSessionDateLine(info: DayInfo): string | null {
  const date = info.date.trim();
  return date || null;
}

/** Settings / join fine print — internal day slot for URL + Supabase. */
export function formatInternalDaySlot(day: number, totalDays: number): string {
  return `Event day ${day} of ${totalDays} (used in join URL as day=${day})`;
}

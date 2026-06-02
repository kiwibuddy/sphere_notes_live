import type { DayInfo } from "@/types/session";

/** e.g. "Day 4 · The Kingdom Blueprint · 2 Jun 2026" */
export function formatTeachingDayLine(
  day: number,
  info: DayInfo,
  includeDate = true
): string {
  const parts: string[] = [`Day ${day}`];
  const topic = info.topic.trim();
  if (topic) parts.push(topic);
  if (includeDate && info.date.trim()) parts.push(info.date);
  return parts.join(" · ");
}

/** Short label for join/speech: teaching day number vs topic title. */
export function formatTeachingDayCaption(
  day: number,
  info: DayInfo,
  totalDays = 4
): string {
  const topic = info.topic.trim();
  if (!topic || topic === `Day ${day}`) {
    return `Teaching day ${day} of ${totalDays}`;
  }
  return `Teaching day ${day} — ${topic}`;
}

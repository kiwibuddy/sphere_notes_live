import type { DayInfo } from "@/types/session";

/** Human session name from presenter settings (e.g. Introduction). */
export function sessionTopicTitle(info: DayInfo): string {
  const topic = info.topic.trim();
  return topic || "Session";
}

/** Primary header: "Introduction · Tuesday 2 June". */
export function formatSessionHeader(info: DayInfo, includeDate = true): string {
  const title = sessionTopicTitle(info);
  if (includeDate && info.date.trim()) {
    return `${title} · ${info.date}`;
  }
  return title;
}

export function formatSessionTitle(info: DayInfo): string {
  return sessionTopicTitle(info);
}

export function formatSessionDateLine(info: DayInfo): string | null {
  const date = info.date.trim();
  return date || null;
}

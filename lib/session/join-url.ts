import { EVENT_ID } from "@/lib/session/defaults";

export function getConfigEventId(): string {
  return process.env.NEXT_PUBLIC_EVENT_ID ?? EVENT_ID;
}

/** Origin for join links — NEXT_PUBLIC_APP_URL when set, else current browser URL. */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function buildStudentJoinUrl(
  eventId: string,
  day: number,
  origin?: string
): string {
  const base = (origin ?? getAppOrigin()).replace(/\/$/, "");
  const params = new URLSearchParams({
    event: eventId,
    day: String(day),
  });
  return `${base}/student?${params.toString()}`;
}

export function buildStudentJoinQuery(eventId: string, day: number): string {
  const params = new URLSearchParams({
    event: eventId,
    day: String(day),
  });
  return `?${params.toString()}`;
}

export function parseJoinDay(
  raw: string | null,
  totalDays: number,
  fallback: number
): number {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, totalDays);
}

export function isStudentRoute(pathname: string): boolean {
  return pathname.startsWith("/student");
}

export function isPresenterRoute(pathname: string): boolean {
  return pathname.startsWith("/presenter");
}

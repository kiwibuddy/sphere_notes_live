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

/** Student join — event only; live data is not split by day number. */
export function buildStudentJoinUrl(eventId: string, origin?: string): string {
  const base = (origin ?? getAppOrigin()).replace(/\/$/, "");
  const params = new URLSearchParams({ event: eventId });
  return `${base}/student?${params.toString()}`;
}

export function buildStudentJoinQuery(eventId: string): string {
  const params = new URLSearchParams({ event: eventId });
  return `?${params.toString()}`;
}

/** @deprecated Legacy URLs may include day= — ignored for sync. */
export function parseJoinDay(
  raw: string | null,
  _totalDays: number,
  fallback: number
): number {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return n;
}

export function isStudentRoute(pathname: string): boolean {
  return pathname.startsWith("/student");
}

export function isPresenterRoute(pathname: string): boolean {
  return pathname.startsWith("/presenter");
}

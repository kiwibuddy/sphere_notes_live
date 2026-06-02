/** Display format used in headers and week archive, e.g. "Monday 2 June". */
export function formatSessionDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDateString(new Date());
}

export function todaySessionDate(): string {
  return formatSessionDate(new Date());
}

/** Parse stored display text or ISO into YYYY-MM-DD for `<input type="date">`. */
export function parseSessionDateToIso(display: string): string | null {
  const trimmed = display.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const year = new Date().getFullYear();
  const parsed = Date.parse(`${trimmed} ${year}`);
  if (!Number.isNaN(parsed)) {
    return toIsoDateString(new Date(parsed));
  }

  return null;
}

export function isoToSessionDateDisplay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return formatSessionDate(new Date(y, m - 1, d));
}

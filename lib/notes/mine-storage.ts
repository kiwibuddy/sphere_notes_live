import type { Clipping } from "@/types/session";

export interface MineDraft {
  content: string;
  clippings: Clipping[];
}

const EMPTY_DRAFT: MineDraft = { content: "", clippings: [] };

export function liveMineStorageKey(eventId: string): string {
  return `spherenotes-mine-live-${eventId}`;
}

export function archiveMineStorageKey(eventId: string, archiveDay: number): string {
  return `spherenotes-mine-archive-${eventId}-${archiveDay}`;
}

export function readMineDraft(storageKey: string): MineDraft {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<MineDraft>;
    return {
      content: typeof parsed.content === "string" ? parsed.content : "",
      clippings: Array.isArray(parsed.clippings)
        ? (parsed.clippings as Clipping[])
        : [],
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function saveMineDraft(storageKey: string, draft: MineDraft): void {
  localStorage.setItem(storageKey, JSON.stringify(draft));
}

export function clearMineDraft(storageKey: string): void {
  localStorage.removeItem(storageKey);
}

export function moveLiveMineToArchive(eventId: string, archiveDay: number): void {
  const liveKey = liveMineStorageKey(eventId);
  const archiveKey = archiveMineStorageKey(eventId, archiveDay);
  const draft = readMineDraft(liveKey);
  saveMineDraft(archiveKey, draft);
  clearMineDraft(liveKey);
}

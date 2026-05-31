/**
 * Supabase Realtime paths and payloads — see docs/pre-backend-design.md §3
 */

import type { DisplayState, NoteCard, Question, Reactions, SessionMeta, SessionSegment, SessionStatus } from "./session";

/** Top-level event metadata (presenter-controlled) */
export interface EventMeta extends SessionMeta {
  status: SessionStatus;
  startedAt: string | null;
  studentCount: number;
}

export interface SlideState {
  current: number;
  total: number;
  updatedAt: string;
}

export interface SpeechState {
  isRecording: boolean;
  rawBuffer: string;
  correctedBuffer: string;
  fullTranscript: string;
}

export interface WordcloudState {
  words: Record<
    string,
    { count: number; category: string; lastAt: string }
  >;
}

/** Snapshot written on End Day */
export interface DayArchiveSnapshot {
  day: number;
  archivedAt: string;
  subtitles: unknown[];
  questions: Question[];
  notes: NoteCard[];
  wordcloud: WordcloudState;
  sessionMap: SessionSegment[];
  slides: SlideState;
}

/** Realtime channel prefix: events/{eventId}/days/{day}/… */
export function eventDayPath(eventId: string, day: number): string {
  return `events/${eventId}/days/${day}`;
}

export type { DisplayState };

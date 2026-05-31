export type SessionStatus = "waiting" | "live" | "paused" | "ended";

export type NoteCardType =
  | "section"
  | "bullets"
  | "quote"
  | "scripture"
  | "concept"
  | "diagram"
  | "story";

export type QuestionStatus = "open" | "pinned" | "answered" | "archived";

export type DisplayMode = "wordcloud" | "quote" | "stats" | "idle";

export type ClippingSource =
  | "live"
  | "qa"
  | "auto"
  | "slides"
  | "cloud"
  | "overview";

export interface SessionMeta {
  eventId: string;
  title: string;
  presenter: string;
  currentDay: number;
  totalDays: number;
  status: SessionStatus;
}

export interface SubtitleLine {
  id: string;
  textEn: string;
  translations: Record<string, string>;
  isCurrent?: boolean;
}

export interface Question {
  id: string;
  text: string;
  votes: number;
  createdAt: string;
  status: QuestionStatus;
  hasVoted?: boolean;
}

export interface NoteCard {
  id: string;
  type: NoteCardType;
  createdAt: string;
  content: Record<string, unknown>;
}

export interface WordCloudWord {
  word: string;
  count: number;
  category: "theology" | "names" | "concepts" | "general";
}

export interface SlideInfo {
  current: number;
  total: number;
  images: string[];
}

export interface SessionSegment {
  id: string;
  title: string;
  startTime: string;
  noteIds: string[];
}

export interface DayArchive {
  day: number;
  label: string;
  date: string;
  status: "archived" | "today" | "upcoming";
  subtitles: SubtitleLine[];
  questions: Question[];
  notes: NoteCard[];
  slides: SlideInfo;
  wordcloud: WordCloudWord[];
  sessionMap: SessionSegment[];
}

export interface Clipping {
  id: string;
  source: ClippingSource;
  sourceLabel: string;
  text: string;
  createdAt: string;
}

export interface Reactions {
  fire: number;
  clap: number;
  think: number;
  question: number;
}

export interface SessionContextValue {
  meta: SessionMeta;
  subtitles: SubtitleLine[];
  questions: Question[];
  notes: NoteCard[];
  wordcloud: WordCloudWord[];
  slides: SlideInfo;
  sessionMap: SessionSegment[];
  reactions: Reactions;
  displayMode: DisplayMode;
  displayQuote: string;
  goLive: () => void;
  pause: () => void;
  resume: () => void;
  endDay: () => void;
  setDay: (day: number) => void;
  isTabLiveActive: (tab: "live" | "slides" | "notes" | "qa") => boolean;
  voteQuestion: (id: string) => void;
  submitQuestion: (text: string) => void;
  addReaction: (key: keyof Reactions) => void;
  setDisplayMode: (mode: DisplayMode, quote?: string) => void;
  addClipping: (clipping: Omit<Clipping, "id" | "createdAt">) => void;
  clippings: Clipping[];
}

export type SupportedLocale =
  | "en"
  | "nb"
  | "nn"
  | "sv"
  | "da"
  | "fi"
  | "fr"
  | "de"
  | "es";

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  nb: "Norsk (Bokmål)",
  nn: "Norsk (Nynorsk)",
  sv: "Svenska",
  da: "Dansk",
  fi: "Suomi",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

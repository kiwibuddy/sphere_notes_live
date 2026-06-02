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

/** Big-screen / OBS display modes — see docs/pre-backend-design.md §4 */
export type DisplayMode =
  | "idle"
  | "join"
  | "wordcloud"
  | "quote"
  | "question"
  | "slide"
  | "stats"
  | "ask-room";

export interface DisplayPayload {
  quoteText?: string;
  questionId?: string;
  questionText?: string;
  questionVotes?: number;
  slideNumber?: number;
  askRoomSummary?: string;
}

export interface DisplayState {
  mode: DisplayMode;
  payload?: DisplayPayload;
  updatedAt?: string;
}

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

/** Per-day topic shown under the week title (e.g. "Creation & Fall"). */
export interface DayInfo {
  topic: string;
  date: string;
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
  /** Timestamps of each occurrence — used for session vs 5 min filter */
  occurrences?: number[];
}

export interface WordCloudEntry {
  word: string;
  category: WordCloudWord["category"];
  occurrences: number[];
}

export type WordCloudMode = "session" | "5min";

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
  /** JPEG snapshot for word cloud clippings */
  imageData?: string;
}

export interface Reactions {
  fire: number;
  clap: number;
  think: number;
  question: number;
}

export interface SessionContextValue {
  meta: SessionMeta;
  dayInfo: Record<number, DayInfo>;
  getDayInfo: (day: number) => DayInfo;
  /** Current live session title + date (presenter settings). */
  getSessionInfo: () => DayInfo;
  setEventTitle: (title: string) => void;
  setSessionTopic: (topic: string) => void;
  setSessionDate: (date: string) => void;
  subtitles: SubtitleLine[];
  questions: Question[];
  notes: NoteCard[];
  wordcloudEntries: WordCloudEntry[];
  slides: SlideInfo;
  slidesLoading: boolean;
  refreshSlides: () => Promise<void>;
  setSlideCurrent: (current: number) => void;
  sessionMap: SessionSegment[];
  reactions: Reactions;
  displayMode: DisplayMode;
  displayQuote: string;
  displayQuestion: { id: string; text: string; votes: number } | null;
  goLive: () => void;
  pause: () => void;
  resume: () => void;
  endDay: () => void;
  isTabLiveActive: (tab: "live" | "slides" | "notes" | "qa") => boolean;
  voteQuestion: (id: string) => void;
  submitQuestion: (text: string) => void;
  addReaction: (key: keyof Reactions) => void;
  setDisplay: (mode: DisplayMode, payload?: DisplayPayload) => void;
  addClipping: (clipping: Omit<Clipping, "id" | "createdAt">) => void;
  clippings: Clipping[];
  /** Internal live bucket (always 1) — use getSessionInfo() for labels. */
  activeDay: number;
  /** Event id from join URL or config. */
  joinEventId: string;
  /** Full student join URL for QR / copy (presenter). */
  studentJoinUrl: string;
  sessionReady: boolean;
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

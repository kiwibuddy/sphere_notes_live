import {
  CalendarDays,
  FileText,
  MessageCircleQuestion,
  Monitor,
  Radio,
  type LucideIcon,
} from "lucide-react";

export type StudentTabKey = "live" | "qa" | "slides" | "notes" | "week";

export interface StudentTab {
  href: string;
  label: string;
  icon: LucideIcon;
  key: StudentTabKey;
}

export const STUDENT_TABS: StudentTab[] = [
  { href: "/student", label: "Slides", icon: Monitor, key: "slides" },
  { href: "/student/live", label: "Live", icon: Radio, key: "live" },
  {
    href: "/student/qa",
    label: "Q&A",
    icon: MessageCircleQuestion,
    key: "qa",
  },
  {
    href: "/student/notes/auto",
    label: "Notes",
    icon: FileText,
    key: "notes",
  },
  {
    href: "/student/week",
    label: "Week",
    icon: CalendarDays,
    key: "week",
  },
];

export const TAB_ACCENT: Record<StudentTabKey, string> = {
  live: "text-tab-live",
  qa: "text-tab-qa",
  slides: "text-tab-slides",
  notes: "text-tab-notes",
  week: "text-tab-week",
};

export function isTabActive(pathname: string, tab: StudentTab): boolean {
  if (tab.key === "notes") return pathname.startsWith("/student/notes");
  if (tab.key === "slides") {
    return pathname === "/student" || pathname === "/student/slides";
  }
  if (tab.key === "live") return pathname === "/student/live";
  return pathname.startsWith(tab.href);
}

export function isTabLiveEnabled(
  key: StudentTabKey,
  status: string,
  isTabLiveActive: (tab: "live" | "slides" | "notes" | "qa") => boolean
): boolean {
  if (key === "week") return true;
  if (key === "qa") return status === "live";
  if (key === "live" || key === "slides" || key === "notes") {
    return isTabLiveActive(key);
  }
  return false;
}

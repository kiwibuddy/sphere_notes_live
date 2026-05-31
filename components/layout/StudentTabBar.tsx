"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  FileText,
  MessageCircleQuestion,
  Monitor,
  Radio,
} from "lucide-react";

const tabs = [
  { href: "/student", label: "Live", icon: Radio, key: "live" as const },
  {
    href: "/student/qa",
    label: "Q&A",
    icon: MessageCircleQuestion,
    key: "qa" as const,
  },
  {
    href: "/student/slides",
    label: "Slides",
    icon: Monitor,
    key: "slides" as const,
  },
  {
    href: "/student/notes/auto",
    label: "Notes",
    icon: FileText,
    key: "notes" as const,
  },
  {
    href: "/student/week",
    label: "Week",
    icon: CalendarDays,
    key: "week" as const,
  },
];

export function StudentTabBar() {
  const pathname = usePathname();
  const { meta, isTabLiveActive } = useSession();

  return (
    <nav className="shrink-0 border-t border-border bg-surface px-1 pb-[env(safe-area-inset-bottom)] pt-1">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon, key }) => {
          const isActive =
            key === "notes"
              ? pathname.startsWith("/student/notes")
              : key === "live"
                ? pathname === "/student"
                : pathname.startsWith(href);

          const isLive = (() => {
            if (key === "week") return true;
            if (key === "qa") return meta.status === "live";
            return isTabLiveActive(key);
          })();

          const accentColors: Record<string, string> = {
            live: "text-tab-live",
            qa: "text-tab-qa",
            slides: "text-tab-slides",
            notes: "text-tab-notes",
            week: "text-tab-week",
          };

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
                isActive ? accentColors[key] : "text-muted",
                !isLive && key !== "week" && "opacity-60"
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    "absolute -top-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full",
                    isLive ? "bg-live-active" : "bg-live-waiting"
                  )}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5",
                  isLive && key !== "week" && isActive && "text-live-active"
                )}
                strokeWidth={1.6}
              />
              <span className="text-[9px] font-medium uppercase tracking-[0.06em]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

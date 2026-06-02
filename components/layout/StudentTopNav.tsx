"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session/context";
import { useStudentPathBuilder } from "@/hooks/useStudentHref";
import { cn } from "@/lib/utils";
import {
  isTabActive,
  isTabLiveEnabled,
  STUDENT_TABS,
  TAB_ACCENT,
} from "./studentTabs";

export function StudentTopNav() {
  const pathname = usePathname();
  const { meta, isTabLiveActive } = useSession();
  const studentPath = useStudentPathBuilder();

  return (
    <nav className="hidden shrink-0 border-b border-border bg-surface md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 lg:px-8">
        {STUDENT_TABS.map((tab) => {
          const active = isTabActive(pathname, tab);
          const live = isTabLiveEnabled(tab.key, meta.status, isTabLiveActive);
          const href = studentPath(tab.href);

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                active ? TAB_ACCENT[tab.key] : "text-muted hover:text-foreground",
                !live && tab.key !== "week" && "opacity-60"
              )}
            >
              {active && (
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 rounded-full",
                    live ? "bg-live-active" : "bg-live-waiting"
                  )}
                />
              )}
              <tab.icon
                className={cn(
                  "h-4 w-4",
                  active && live && tab.key !== "week" && "text-live-active"
                )}
                strokeWidth={1.6}
              />
              <span className="uppercase tracking-[0.04em]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

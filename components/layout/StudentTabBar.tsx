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

export function StudentTabBar() {
  const pathname = usePathname();
  const { meta, isTabLiveActive } = useSession();
  const studentPath = useStudentPathBuilder();

  return (
    <nav className="shrink-0 border-t border-border bg-surface px-1 pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
      <div className="flex">
        {STUDENT_TABS.map((tab) => {
          const active = isTabActive(pathname, tab);
          const live = isTabLiveEnabled(tab.key, meta.status, isTabLiveActive);
          const href = studentPath(tab.href);

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
                active ? TAB_ACCENT[tab.key] : "text-muted",
                !live && tab.key !== "week" && "opacity-60"
              )}
            >
              {active && (
                <span
                  className={cn(
                    "absolute -top-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full",
                    live ? "bg-live-active" : "bg-live-waiting"
                  )}
                />
              )}
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  live && tab.key !== "week" && active && "text-live-active"
                )}
                strokeWidth={1.6}
              />
              <span className="text-[9px] font-medium uppercase tracking-[0.06em]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

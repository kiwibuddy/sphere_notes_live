"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const subTabs = [
  { href: "/student/notes/auto", label: "Auto" },
  { href: "/student/notes/mine", label: "Mine" },
  { href: "/student/notes/cloud", label: "Cloud" },
  { href: "/student/notes/overview", label: "Overview" },
];

export function NotesSubNav() {
  const pathname = usePathname();

  return (
    <div className="shrink-0 border-b border-border px-4 py-2">
      <div className="flex rounded-lg bg-background p-1">
        {subTabs.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 rounded-md py-1.5 text-center text-xs font-medium transition-all",
                isActive
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

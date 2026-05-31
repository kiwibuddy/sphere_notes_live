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
    <>
      {/* Mobile + tablet portrait: horizontal segmented control */}
      <div className="shrink-0 border-b border-border px-4 py-2 lg:hidden">
        <div className="mx-auto flex max-w-5xl rounded-lg bg-background p-1">
          {subTabs.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 rounded-md py-2 text-center text-xs font-medium transition-all md:text-sm",
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

      {/* Desktop / iPad landscape: vertical sidebar */}
      <nav className="hidden w-44 shrink-0 border-r border-border bg-surface/50 p-3 lg:block">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Notes
        </p>
        <div className="space-y-0.5">
          {subTabs.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted hover:bg-background hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

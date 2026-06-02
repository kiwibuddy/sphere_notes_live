"use client";

import { LOCALE_LABELS, type SupportedLocale } from "@/types/session";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const LOCALES = Object.keys(LOCALE_LABELS) as SupportedLocale[];

interface LanguagePickerProps {
  locale: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
  variant?: "default" | "dark";
}

export function LanguagePicker({
  locale,
  onChange,
  variant = "default",
}: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const isDark = variant === "dark";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
          isDark
            ? "border-white/20 bg-white/10 text-white"
            : "border-border bg-surface text-foreground"
        )}
      >
        {LOCALE_LABELS[locale as SupportedLocale] ?? locale}
        <ChevronDown
          className={cn("h-3 w-3", isDark ? "text-white/70" : "text-muted")}
        />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-[110]"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute right-0 top-full z-[120] mt-1 max-h-48 w-44 overflow-y-auto rounded-lg border py-1 shadow-card",
              isDark
                ? "border-white/20 bg-neutral-900"
                : "border-border bg-surface"
            )}
          >
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-xs",
                  isDark
                    ? "text-white hover:bg-white/10"
                    : "hover:bg-background",
                  locale === code &&
                    (isDark
                      ? "font-medium text-white"
                      : "font-medium text-tab-live")
                )}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

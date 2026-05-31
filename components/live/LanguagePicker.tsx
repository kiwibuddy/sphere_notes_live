"use client";

import { LOCALE_LABELS, type SupportedLocale } from "@/types/session";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const LOCALES = Object.keys(LOCALE_LABELS) as SupportedLocale[];

interface LanguagePickerProps {
  locale: string;
  onChange: (locale: string) => void;
}

export function LanguagePicker({ locale, onChange }: LanguagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
      >
        {LOCALE_LABELS[locale as SupportedLocale] ?? locale}
        <ChevronDown className="h-3 w-3 text-muted" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-30 mt-1 max-h-48 w-44 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-card">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-xs hover:bg-background",
                  locale === code && "font-medium text-tab-live"
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

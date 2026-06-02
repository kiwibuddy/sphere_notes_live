"use client";

import { LOCALE_LABELS, type SupportedLocale } from "@/types/session";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const LOCALES = Object.keys(LOCALE_LABELS) as SupportedLocale[];
const MENU_WIDTH = 176;

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
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isDark = variant === "dark";

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8
    );
    setMenuPos({ top: rect.bottom + 4, left });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();

    const onScrollOrResize = () => setOpen(false);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const selectLocale = (code: SupportedLocale) => {
    onChange(code);
    setOpen(false);
  };

  const menu =
    open &&
    menuPos &&
    mounted &&
    createPortal(
      <>
        <button
          type="button"
          aria-label="Close language menu"
          className="fixed inset-0 z-[200] cursor-default border-0 bg-transparent"
          onClick={() => setOpen(false)}
        />
        <div
          role="listbox"
          aria-label="Choose language"
          className={cn(
            "fixed z-[201] max-h-48 overflow-y-auto rounded-lg border py-1 shadow-card",
            isDark
              ? "border-white/20 bg-neutral-900"
              : "border-border bg-surface"
          )}
          style={{
            top: menuPos.top,
            left: menuPos.left,
            width: MENU_WIDTH,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              onClick={() => selectLocale(code)}
              className={cn(
                "block w-full px-3 py-2.5 text-left text-xs touch-manipulation",
                isDark
                  ? "text-white active:bg-white/10"
                  : "active:bg-background",
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
      </>,
      document.body
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            updateMenuPosition();
            setOpen(true);
          }
        }}
        className={cn(
          "flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium touch-manipulation",
          isDark
            ? "border-white/20 bg-white/10 text-white"
            : "border-border bg-surface text-foreground"
        )}
      >
        {LOCALE_LABELS[locale] ?? locale}
        <ChevronDown
          className={cn("h-3 w-3", isDark ? "text-white/70" : "text-muted")}
        />
      </button>
      {menu}
    </>
  );
}

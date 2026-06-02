"use client";

import { cn } from "@/lib/utils";

/** One-line TV-style caption for the slides tab (no paragraph wrap). */
export function slideCaptionText(text: string, maxChars = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  const tail = normalized.slice(-maxChars);
  const wordStart = tail.indexOf(" ");
  return wordStart > 0 ? `…${tail.slice(wordStart + 1)}` : `…${tail}`;
}

interface SlideCaptionLineProps {
  text: string;
  className?: string;
}

export function SlideCaptionLine({ text, className }: SlideCaptionLineProps) {
  return (
    <p
      className={cn(
        "w-full truncate whitespace-nowrap text-center text-sm leading-none text-foreground sm:text-base",
        className
      )}
      title={text}
    >
      {slideCaptionText(text)}
    </p>
  );
}

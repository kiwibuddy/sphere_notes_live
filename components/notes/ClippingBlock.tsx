"use client";

import type { Clipping } from "@/types/session";
import { cn } from "@/lib/utils";

const SOURCE_COLORS: Record<Clipping["source"], string> = {
  live: "border-l-tab-live",
  qa: "border-l-tab-qa",
  auto: "border-l-tab-notes",
  slides: "border-l-tab-slides",
  cloud: "border-l-tab-cloud",
  overview: "border-l-tab-overview",
};

interface ClippingBlockProps {
  clip: Clipping;
  onRemove: (id: string) => void;
}

export function ClippingBlock({ clip, onRemove }: ClippingBlockProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border-l-2 bg-surface shadow-sm",
        SOURCE_COLORS[clip.source]
      )}
    >
      <button
        type="button"
        onClick={() => onRemove(clip.id)}
        className="absolute right-2 top-2 z-10 rounded-full bg-surface/90 px-1.5 text-muted shadow-sm hover:text-foreground"
      >
        ×
      </button>
      <div className="p-3 pl-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          {clip.sourceLabel}
        </p>
        {clip.imageData ? (
          <div className="mt-2 overflow-hidden rounded-md bg-background ring-1 ring-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={clip.imageData}
              alt={clip.text}
              className="h-auto w-full object-contain"
            />
          </div>
        ) : (
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {clip.text}
          </p>
        )}
      </div>
    </div>
  );
}

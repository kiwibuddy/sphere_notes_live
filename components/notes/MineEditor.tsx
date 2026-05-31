"use client";

import { useSession } from "@/lib/session/context";
import { useMineNotes } from "@/hooks/useMineNotes";
import type { ClippingSource } from "@/types/session";
import { cn } from "@/lib/utils";

const SOURCE_COLORS: Record<ClippingSource, string> = {
  live: "border-l-tab-live",
  qa: "border-l-tab-qa",
  auto: "border-l-tab-notes",
  slides: "border-l-tab-slides",
  cloud: "border-l-tab-cloud",
  overview: "border-l-tab-overview",
};

export function MineEditor() {
  const { meta } = useSession();
  const { content, clippings, lastSaved, updateContent, removeClipping } =
    useMineNotes(meta.currentDay);

  return (
    <div className="flex h-full flex-col bg-[#F5F0E8]">
      <div className="flex-1 overflow-y-auto p-4">
        <textarea
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Your notes for this session…"
          className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted focus:outline-none"
        />
        <div className="mt-4 space-y-3">
          {clippings.map((clip) => (
            <div
              key={clip.id}
              className={cn(
                "relative rounded-md border-l-2 bg-surface/80 p-3 pl-4 shadow-sm",
                SOURCE_COLORS[clip.source]
              )}
            >
              <button
                type="button"
                onClick={() => removeClipping(clip.id)}
                className="absolute right-2 top-2 text-muted hover:text-foreground"
              >
                ×
              </button>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                {clip.sourceLabel}
              </p>
              <p className="mt-1 text-sm text-foreground">{clip.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/50 p-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-md border border-border bg-surface py-2 text-xs text-muted"
          >
            Copy
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-tab-mine py-2 text-xs font-medium text-white"
          >
            Export PDF
          </button>
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-muted">
          {lastSaved
            ? `Saved ${formatRelative(lastSaved)}`
            : "Auto-save enabled"}
        </p>
      </div>
    </div>
  );
}

function formatRelative(date: Date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.floor(sec / 60)}m ago`;
}

"use client";

import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { key: "fire" as const, emoji: "🔥" },
  { key: "clap" as const, emoji: "👏" },
  { key: "think" as const, emoji: "🤔" },
  { key: "question" as const, emoji: "❓" },
];

export function ReactionsStrip() {
  const { meta, reactions, addReaction } = useSession();

  if (meta.status !== "live") return null;

  return (
    <div className="shrink-0 border-t border-border bg-surface/80 px-4 py-2 md:hidden">
      <div className="flex justify-center gap-2">
        {REACTIONS.map(({ key, emoji }) => (
          <button
            key={key}
            type="button"
            onClick={() => addReaction(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5",
              "text-sm transition-transform active:scale-95"
            )}
          >
            <span>{emoji}</span>
            <span className="text-xs tabular-nums text-muted">
              {reactions[key]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

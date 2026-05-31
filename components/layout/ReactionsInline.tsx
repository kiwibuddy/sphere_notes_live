"use client";

import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { key: "fire" as const, emoji: "🔥" },
  { key: "clap" as const, emoji: "👏" },
  { key: "think" as const, emoji: "🤔" },
  { key: "question" as const, emoji: "❓" },
];

export function ReactionsInline({ className }: { className?: string }) {
  const { meta, reactions, addReaction } = useSession();

  if (meta.status !== "live") return null;

  return (
    <div className={cn("hidden items-center gap-1.5 md:flex", className)}>
      {REACTIONS.map(({ key, emoji }) => (
        <button
          key={key}
          type="button"
          onClick={() => addReaction(key)}
          className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-sm transition-transform hover:bg-border/50 active:scale-95"
        >
          <span>{emoji}</span>
          <span className="text-xs tabular-nums text-muted">{reactions[key]}</span>
        </button>
      ))}
    </div>
  );
}

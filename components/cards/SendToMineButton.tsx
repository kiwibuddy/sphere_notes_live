"use client";

import { StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

export function SendToMineButton({
  onSend,
  className,
}: {
  onSend: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSend}
      aria-label="Add to My Notes"
      title="Add to My Notes"
      className={cn(
        "rounded-md p-1 text-muted/60 transition-colors hover:bg-tab-mine/10 hover:text-tab-mine",
        className
      )}
    >
      <StickyNote className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

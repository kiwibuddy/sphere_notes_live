"use client";

import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SlideViewerProps {
  readOnly?: boolean;
}

export function SlideViewer({ readOnly }: SlideViewerProps) {
  const { slides, isTabLiveActive } = useSession();
  const [index, setIndex] = useState(slides.current - 1);

  const current = slides.images[index] ?? slides.images[0];
  const isLive = isTabLiveActive("slides");

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center bg-background p-4",
          !isLive && !readOnly && "opacity-60"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`Slide ${index + 1}`}
          className="max-h-full w-full rounded-lg object-contain shadow-card"
        />
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <button
          type="button"
          disabled={index <= 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="rounded-md p-2 text-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm tabular-nums text-muted">
          {index + 1} / {slides.total}
        </span>
        <button
          type="button"
          disabled={index >= slides.total - 1}
          onClick={() => setIndex((i) => Math.min(slides.total - 1, i + 1))}
          className="rounded-md p-2 text-muted disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

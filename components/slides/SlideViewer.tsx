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
  const thumbStart = Math.max(0, index - 2);
  const thumbnails = slides.images.slice(thumbStart, thumbStart + 7);

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          className={cn(
            "relative flex flex-1 items-center justify-center bg-background p-4 md:p-8",
            !isLive && !readOnly && "opacity-60"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={`Slide ${index + 1}`}
            className="max-h-[min(55vh,480px)] w-full rounded-lg object-contain shadow-card md:max-h-[min(65vh,600px)]"
          />
        </div>

        <div className="hidden shrink-0 overflow-y-auto border-border bg-surface p-2 md:flex md:w-28 md:flex-col md:border-l lg:w-36">
          {thumbnails.map((src, i) => {
            const slideIndex = thumbStart + i;
            return (
              <button
                key={slideIndex}
                type="button"
                onClick={() => setIndex(slideIndex)}
                className={cn(
                  "mb-2 block w-full overflow-hidden rounded-md border-2 transition-colors last:mb-0",
                  slideIndex === index
                    ? "border-tab-slides"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Slide ${slideIndex + 1}`}
                  className="aspect-video w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3 md:px-6">
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

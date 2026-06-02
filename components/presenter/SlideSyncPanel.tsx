"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/context";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export function SlideSyncPanel({ embedded = false }: { embedded?: boolean }) {
  const {
    slides,
    slidesLoading,
    refreshSlides,
    setSlideCurrent,
  } = useSession();

  const folder = "public/slides/";
  const hasPngs = slides.total > 0 && !slides.images[0]?.startsWith("data:");

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={slides.current <= 1}
            onClick={() => setSlideCurrent(slides.current - 1)}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[7rem] text-center text-sm tabular-nums text-foreground">
            Slide {slides.current} of {Math.max(slides.total, 1)}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={slides.current >= slides.total}
            onClick={() => setSlideCurrent(slides.current + 1)}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted">
          {hasPngs
            ? `${slides.total} PNG${slides.total === 1 ? "" : "s"} loaded (full deck)`
            : "No PNGs yet — export your Keynote deck into public/slides/"}
        </p>
      </div>

      {slides.images[0] && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slides.images[Math.max(0, slides.current - 1)]}
            alt={`Slide ${slides.current}`}
            className="mx-auto max-h-40 w-full object-contain"
          />
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Slides</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Export your full Keynote deck as PNG into{" "}
              <code className="rounded bg-background px-1 py-0.5 text-[11px]">
                {folder}
              </code>{" "}
              (any .png names — slide number follows Keynote order). Tap refresh
              after adding files. Jump around in Keynote freely; phones follow
              slide number, not teaching day.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refreshSlides()}
            disabled={slidesLoading}
            className="shrink-0 gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${slidesLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <div className="mt-4">{body}</div>
      </div>
    );
  }

  return (
    <section className="mb-6 rounded-xl bg-surface p-4 shadow-card md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Slides</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Export your full Keynote deck as PNG into{" "}
            <code className="rounded bg-background px-1 py-0.5 text-[11px]">
              {folder}
            </code>{" "}
            (any .png names — slide number follows Keynote order). Tap refresh
            after adding files. Jump around in Keynote freely; phones follow
            slide number, not teaching day.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void refreshSlides()}
          disabled={slidesLoading}
          className="shrink-0 gap-1.5"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${slidesLoading ? "animate-spin" : ""}`}
          />
          Refresh slides
        </Button>
      </div>
      {body}
    </section>
  );
}

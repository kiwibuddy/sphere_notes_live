"use client";

import type { DayArchive } from "@/types/session";
import { SubtitleFeed } from "@/components/live/SubtitleFeed";
import { QuestionList } from "@/components/qa/QuestionList";
import { NoteCardRenderer } from "@/components/cards/NoteCardRenderer";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ARCHIVE_TABS = ["Live", "Q&A", "Slides", "Notes"] as const;

interface WeekArchivePanelProps {
  archive: DayArchive;
}

export function WeekArchivePanel({ archive }: WeekArchivePanelProps) {
  const [tab, setTab] = useState<(typeof ARCHIVE_TABS)[number]>("Live");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 gap-1 border-b border-border px-4 py-2 md:px-0">
        {ARCHIVE_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium md:text-sm",
              tab === t
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-0 md:pt-4">
        {tab === "Live" && (
          <SubtitleFeed
            lines={archive.subtitles}
            locale="en"
            fontSize={16}
            readOnly
          />
        )}
        {tab === "Q&A" && (
          <QuestionList
            questions={archive.questions}
            onVote={() => {}}
            readOnly
          />
        )}
        {tab === "Slides" && (
          <div className="mx-auto max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={archive.slides.images[archive.slides.current - 1]}
              alt={`Slide ${archive.slides.current}`}
              className="w-full rounded-lg object-contain shadow-card"
            />
            <p className="mt-3 text-center text-sm text-muted">
              Slide {archive.slides.current} of {archive.slides.total}
            </p>
          </div>
        )}
        {tab === "Notes" && (
          <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
            {archive.notes.map((card, i) => (
              <NoteCardRenderer
                key={card.id}
                card={card}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

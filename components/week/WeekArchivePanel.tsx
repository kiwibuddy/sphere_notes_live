"use client";

import type { DayArchive } from "@/types/session";
import { SubtitleFeed } from "@/components/live/SubtitleFeed";
import { QuestionList } from "@/components/qa/QuestionList";
import { NoteCardRenderer } from "@/components/cards/NoteCardRenderer";
import { MineEditor } from "@/components/notes/MineEditor";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ARCHIVE_TABS = ["Live", "Q&A", "Slides", "Auto", "Mine"] as const;

interface WeekArchivePanelProps {
  archive: DayArchive;
  source: "live" | "stored";
}

export function WeekArchivePanel({ archive, source }: WeekArchivePanelProps) {
  const [tab, setTab] = useState<(typeof ARCHIVE_TABS)[number]>("Live");
  const autoNotes = [...archive.notes].reverse();

  // When the user switches to a different archived day, reset panel tab state.
  useEffect(() => {
    setTab("Live");
  }, [archive.day]);

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
        {tab === "Auto" && (
          <div className="mx-auto max-w-5xl">
            {autoNotes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                No AI notes were saved for this session.
                {source === "live" &&
                  " Keep the Mac speech bridge open while teaching — notes generate every ~10 minutes."}
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {autoNotes.map((card, i) => (
                  <div
                    key={card.id}
                    className={
                      card.type === "quote" || card.type === "section"
                        ? "lg:col-span-2"
                        : undefined
                    }
                  >
                    <NoteCardRenderer card={card} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "Mine" && (
          <MineEditor
            day={archive.day}
            scope={source === "live" ? "live" : "archive"}
          />
        )}
      </div>
    </div>
  );
}

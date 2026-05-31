"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { buildDayArchive } from "@/lib/mock/week";
import { useSession } from "@/lib/session/context";
import { SubtitleFeed } from "@/components/live/SubtitleFeed";
import { QuestionList } from "@/components/qa/QuestionList";
import { NoteCardRenderer } from "@/components/cards/NoteCardRenderer";
import { SlideViewer } from "@/components/slides/SlideViewer";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const ARCHIVE_TABS = ["Live", "Q&A", "Slides", "Notes"] as const;

export default function DayArchivePage() {
  const params = useParams();
  const day = Number(params.day);
  const { meta } = useSession();
  const archive = buildDayArchive(day, meta.currentDay);
  const [tab, setTab] = useState<(typeof ARCHIVE_TABS)[number]>("Live");

  if (Number.isNaN(day) || day < 1 || day > 4) {
    return (
      <div className="p-8 text-center text-muted">
        Day not found.{" "}
        <Link href="/student/week" className="text-tab-live underline">
          Back to Week
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/student/week" className="text-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="font-display text-lg text-foreground">
            {archive.label}
          </p>
          <p className="text-xs text-muted">{archive.date} · Read-only</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 border-b border-border px-4 py-2">
        {ARCHIVE_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium",
              tab === t
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "Live" && (
          <SubtitleFeed
            lines={archive.subtitles}
            locale="en"
            fontSize={15}
            readOnly
          />
        )}
        {tab === "Q&A" && (
          <QuestionList questions={archive.questions} onVote={() => {}} readOnly />
        )}
        {tab === "Slides" && (
          <div className="aspect-video overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={archive.slides.images[archive.slides.current - 1]}
              alt={`Slide ${archive.slides.current}`}
              className="h-full w-full object-contain"
            />
            <p className="mt-2 text-center text-xs text-muted">
              Slide {archive.slides.current} of {archive.slides.total}
            </p>
          </div>
        )}
        {tab === "Notes" && (
          <div className="space-y-4">
            {archive.notes.map((card, i) => (
              <NoteCardRenderer key={card.id} card={card} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

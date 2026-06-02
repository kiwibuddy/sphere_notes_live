"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/session/context";
import { filterWordcloud } from "@/lib/wordcloud/entries";
import { WordCloudCanvas } from "@/components/notes/WordCloudCanvas";

export function DisplayView() {
  const {
    displayMode,
    displayQuote,
    displayQuestion,
    wordcloudEntries,
    meta,
    getSessionInfo,
  } = useSession();

  const session = getSessionInfo();

  const wordcloud = useMemo(
    () => filterWordcloud(wordcloudEntries, "session"),
    [wordcloudEntries]
  );

  if (displayMode === "idle" || meta.status === "waiting") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F2]">
        <div className="text-center">
          <p className="font-display text-4xl text-foreground">{meta.title}</p>
          <p className="mt-3 text-xl text-muted">
            {session.topic} · {session.date}
          </p>
          <p className="mt-4 text-sm text-muted">SphereNotes Live · Display</p>
        </div>
      </div>
    );
  }

  if (displayMode === "wordcloud") {
    return (
      <div className="flex min-h-dvh flex-col bg-[#F7F5F2] p-12">
        <h2 className="mb-8 text-center font-display text-3xl text-foreground">
          {meta.title}
        </h2>
        <div className="min-h-[60vh] flex-1">
          <WordCloudCanvas words={wordcloud} />
        </div>
      </div>
    );
  }

  if (displayMode === "question" && displayQuestion) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F2] p-16">
        <div className="max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-tab-qa">
            The room is asking
          </p>
          <p className="mt-8 font-display text-4xl leading-snug text-foreground md:text-5xl">
            {displayQuestion.text}
          </p>
          {displayQuestion.votes > 0 && (
            <p className="mt-8 text-lg tabular-nums text-muted">
              {displayQuestion.votes} upvotes
            </p>
          )}
        </div>
      </div>
    );
  }

  if (displayMode === "quote" && displayQuote) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F2] p-16">
        <blockquote className="max-w-4xl text-center font-display text-5xl italic leading-tight text-foreground">
          &ldquo;{displayQuote}&rdquo;
        </blockquote>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F2]">
      <p className="text-muted">Nothing on display — clear or choose content from presenter</p>
    </div>
  );
}

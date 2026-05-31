"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/session/context";
import { filterWordcloud } from "@/lib/wordcloud/entries";
import { WordCloudCanvas } from "@/components/notes/WordCloudCanvas";

export function DisplayView() {
  const {
    displayMode,
    displayQuote,
    wordcloudEntries,
    meta,
    reactions,
    questions,
  } = useSession();

  const wordcloud = useMemo(
    () => filterWordcloud(wordcloudEntries, "session"),
    [wordcloudEntries]
  );

  if (displayMode === "idle" || meta.status === "waiting") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0F]">
        <div className="text-center">
          <p className="font-display text-4xl text-[#F5F2EB]">{meta.title}</p>
          <p className="mt-2 text-[#888]">SphereNotes Live · Display</p>
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

  if (displayMode === "quote" && displayQuote) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F2] p-16">
        <blockquote className="max-w-4xl text-center font-display text-5xl italic leading-tight text-foreground">
          &ldquo;{displayQuote}&rdquo;
        </blockquote>
      </div>
    );
  }

  if (displayMode === "stats") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0F] p-16">
        <div className="grid grid-cols-2 gap-12 text-center">
          <DisplayStat emoji="🔥" value={reactions.fire} label="Fire" />
          <DisplayStat emoji="👏" value={reactions.clap} label="Clap" />
          <DisplayStat emoji="🤔" value={reactions.think} label="Think" />
          <DisplayStat emoji="❓" value={questions.length} label="Questions" />
        </div>
      </div>
    );
  }

  return null;
}

function DisplayStat({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <div>
      <p className="text-6xl">{emoji}</p>
      <p className="mt-4 text-5xl font-semibold tabular-nums text-[#F5F2EB]">
        {value}
      </p>
      <p className="mt-2 text-[#888]">{label}</p>
    </div>
  );
}

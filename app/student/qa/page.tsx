"use client";

import { StudentContent } from "@/components/layout/StudentContent";
import { QuestionList } from "@/components/qa/QuestionList";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";
import { useState } from "react";

export default function QAPage() {
  const { questions, meta, voteQuestion, submitQuestion } = useSession();
  const sendToMine = useSendToMine();
  const [input, setInput] = useState("");
  const isLive = meta.status === "live";

  const handleSubmit = () => {
    if (!input.trim()) return;
    submitQuestion(input);
    setInput("");
  };

  const pinned = questions.find((q) => q.status === "pinned");
  const rest = questions.filter((q) => q.status !== "pinned");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {!isLive ? (
        <StudentContent width="default">
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="max-w-md text-center text-sm text-muted md:text-base">
              Q&A opens when the session goes live. Questions cannot be submitted
              before then.
            </p>
          </div>
        </StudentContent>
      ) : (
        <>
          <div className="shrink-0 border-b border-border px-4 py-3 md:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Ask a question…"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-tab-qa/30 md:text-base"
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-tab-qa px-5 py-2.5 text-sm font-medium text-white md:text-base"
              >
                Send
              </button>
            </div>
          </div>

          <StudentContent width="wide">
            <p className="mb-4 text-xs text-muted md:text-sm">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>

            {/* Phone + iPad portrait */}
            <div className="lg:hidden">
              <QuestionList
                questions={questions}
                onVote={voteQuestion}
                onSendToMine={(text) => sendToMine(text, "qa", "Questions")}
              />
            </div>

            {/* Desktop + iPad landscape */}
            <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
              <div className="lg:col-span-3">
                <QuestionList
                  questions={rest}
                  onVote={voteQuestion}
                  onSendToMine={(text) => sendToMine(text, "qa", "Questions")}
                />
              </div>
              {pinned && (
                <aside className="lg:col-span-2">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-tab-qa">
                    Answering now
                  </p>
                  <div className="sticky top-4 rounded-lg bg-surface p-6 shadow-card ring-1 ring-tab-qa/20">
                    <p className="font-display text-xl leading-snug text-foreground">
                      {pinned.text}
                    </p>
                    <p className="mt-4 text-sm font-semibold tabular-nums text-tab-qa">
                      {pinned.votes} votes
                    </p>
                  </div>
                </aside>
              )}
            </div>
          </StudentContent>
        </>
      )}
    </div>
  );
}

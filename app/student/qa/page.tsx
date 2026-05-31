"use client";

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

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-2">
        <p className="text-xs text-muted">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {!isLive ? (
        <div className="flex flex-1 items-center justify-center px-8">
          <p className="text-center text-sm text-muted">
            Q&A opens when the session goes live. Questions cannot be submitted
            before then.
          </p>
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Ask a question…"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-tab-qa/30"
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-tab-qa px-4 py-2 text-sm font-medium text-white"
              >
                Send
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <QuestionList
              questions={questions}
              onVote={voteQuestion}
              onSendToMine={(text) => sendToMine(text, "qa", "Questions")}
            />
          </div>
        </>
      )}
    </div>
  );
}

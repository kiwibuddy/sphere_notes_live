"use client";

import { motion } from "framer-motion";
import type { Question } from "@/types/session";
import { SendToMineButton } from "@/components/cards/SendToMineButton";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  onVote: (id: string) => void;
  onSendToMine?: (text: string) => void;
  readOnly?: boolean;
}

export function QuestionCard({
  question,
  onVote,
  onSendToMine,
  readOnly,
}: QuestionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 rounded-lg bg-surface p-4 shadow-card",
        question.status === "pinned" && "ring-1 ring-tab-qa/30"
      )}
    >
      {!readOnly && (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onVote(question.id)}
            disabled={question.hasVoted}
            className={cn(
              "rounded-md p-1 transition-colors",
              question.hasVoted
                ? "text-tab-qa"
                : "text-muted hover:text-tab-qa"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <motion.span
            key={question.votes}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-sm font-semibold tabular-nums",
              question.votes > 15 ? "text-tab-qa" : "text-foreground"
            )}
          >
            {question.votes}
          </motion.span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        {question.status === "pinned" && (
          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-tab-qa">
            <ArrowUp className="h-3 w-3" />
            Answering now
          </p>
        )}
        <p className="text-sm leading-relaxed text-foreground">
          {question.text}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">{question.createdAt}</span>
          {!readOnly && onSendToMine && (
            <SendToMineButton
              onSend={() =>
                onSendToMine(
                  `${question.text} (${question.votes} votes)`
                )
              }
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface QuestionListProps {
  questions: Question[];
  onVote: (id: string) => void;
  onSendToMine?: (text: string) => void;
  readOnly?: boolean;
}

export function QuestionList({
  questions,
  onVote,
  onSendToMine,
  readOnly,
}: QuestionListProps) {
  const sorted = [...questions].sort((a, b) => {
    if (a.status === "pinned") return -1;
    if (b.status === "pinned") return 1;
    return b.votes - a.votes;
  });

  return (
    <div className="space-y-3">
      {sorted.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          onVote={onVote}
          onSendToMine={onSendToMine}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

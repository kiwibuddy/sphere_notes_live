"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ObsSceneBar } from "@/components/presenter/ObsSceneBar";
import dynamic from "next/dynamic";

const PresenterJoinPanel = dynamic(
  () =>
    import("@/components/presenter/PresenterJoinPanel").then(
      (m) => m.PresenterJoinPanel
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mb-6 h-48 animate-pulse rounded-xl bg-surface" />
    ),
  }
);
import { PresenterSettingsModal } from "@/components/presenter/PresenterSettingsModal";
import { formatSessionHeader } from "@/lib/session/day-label";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Pause,
  Play,
  Radio,
  Square,
  Cloud,
  Monitor,
  MessageCircleQuestion,
  Settings,
} from "lucide-react";

function sortQuestionsByVotes(
  questions: { id: string; text: string; votes: number; status: string }[]
) {
  return [...questions]
    .filter((q) => q.status !== "archived")
    .sort((a, b) => b.votes - a.votes);
}

export function PresenterDashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    meta,
    getSessionInfo,
    goLive,
    pause,
    resume,
    endDay,
    questions,
    slides,
    displayMode,
    displayQuestion,
    setDisplay,
    studentJoinUrl,
  } = useSession();

  const session = getSessionInfo();
  const sortedQuestions = sortQuestionsByVotes(questions);

  const topQuestion = sortedQuestions[0];

  const showQuestionOnProjector = (q: {
    id: string;
    text: string;
    votes: number;
  }) => {
    setDisplay("question", {
      questionId: q.id,
      questionText: q.text,
      questionVotes: q.votes,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-4 pb-6 md:p-6">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl text-foreground md:text-3xl">
                {meta.title}
              </h1>
              <p className="mt-1 text-sm text-muted md:text-base">
                {formatSessionHeader(session)}
              </p>
              <p className="mt-2 text-xs text-muted">
                Slide {slides.current} of {slides.total}
                {questions.length > 0 && ` · ${questions.length} questions`}
                {displayMode !== "idle" && (
                  <span className="text-foreground">
                    {" "}
                    · Projector: {displayMode}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {meta.status === "waiting" && (
                <Button
                  size="sm"
                  onClick={goLive}
                  className="gap-1.5 bg-live-active text-white hover:bg-live-active/90"
                >
                  <Radio className="h-3.5 w-3.5" />
                  Go Live
                </Button>
              )}
              {meta.status === "live" && (
                <>
                  <Button
                    size="sm"
                    disabled
                    className="gap-1.5 bg-live-active text-white opacity-100"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" />
                    Live
                  </Button>
                  <Button
                    size="sm"
                    onClick={pause}
                    className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={endDay}
                    className="gap-1.5"
                  >
                    <Square className="h-3.5 w-3.5" />
                    End Day
                  </Button>
                </>
              )}
              {meta.status === "paused" && (
                <>
                  <Button
                    size="sm"
                    disabled
                    className="gap-1.5 bg-orange-500 text-white opacity-100"
                  >
                    Paused
                  </Button>
                  <Button
                    size="sm"
                    onClick={resume}
                    className="gap-1.5 bg-live-active text-white hover:bg-live-active/90"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={endDay}
                    className="gap-1.5"
                  >
                    <Square className="h-3.5 w-3.5" />
                    End Day
                  </Button>
                </>
              )}

              <Link href="/presenter/speech" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Speech (Mac)
                </Button>
              </Link>
              <Link href={studentJoinUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Student view
                </Button>
              </Link>
              <Link href="/display" target="_blank">
                <Button variant="outline" size="sm">
                  Open display
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="px-2.5"
                aria-label="Session settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <PresenterJoinPanel />

          {/* Projector content — what /display shows before OBS SphereNotes scene */}
          <section className="mb-6 rounded-xl bg-surface p-4 shadow-card md:p-6">
            <div className="mb-4 flex items-start gap-3">
              <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Show on projector
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Step 1: pick content below. Step 2: tap{" "}
                  <strong>SphereNotes</strong> in the OBS bar. Slides and camera
                  use the other OBS buttons — not this section.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <ProjectorButton
                icon={Cloud}
                label="Word cloud"
                description="Live words from your teaching"
                active={displayMode === "wordcloud"}
                onClick={() => setDisplay("wordcloud")}
              />
              <ProjectorButton
                icon={MessageCircleQuestion}
                label="Top question"
                description={
                  topQuestion
                    ? `${topQuestion.votes} votes — highest so far`
                    : "No questions yet"
                }
                active={
                  displayMode === "question" &&
                  displayQuestion?.id === topQuestion?.id
                }
                disabled={!topQuestion}
                onClick={() => topQuestion && showQuestionOnProjector(topQuestion)}
              />
              <ProjectorButton
                icon={Square}
                label="Clear"
                description="Blank SphereNotes display"
                active={displayMode === "idle"}
                onClick={() => setDisplay("idle")}
                variant="muted"
              />
            </div>
          </section>

          {/* Questions — choose which one to show */}
          <section className="rounded-xl bg-surface p-4 shadow-card md:p-6">
            <h2 className="mb-1 text-sm font-semibold text-foreground">
              Questions
            </h2>
            <p className="mb-4 text-xs text-muted">
              Tap <strong>Show</strong> on any question to put it on the
              projector. Use &ldquo;Top question&rdquo; above for the most
              upvoted one.
            </p>

            <div className="space-y-2">
              {sortedQuestions.length === 0 ? (
                <p className="rounded-lg bg-background p-4 text-sm text-muted">
                  No questions yet — students can ask when the session is live.
                </p>
              ) : (
                sortedQuestions.map((q) => {
                  const isOnProjector =
                    displayMode === "question" && displayQuestion?.id === q.id;

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3",
                        isOnProjector
                          ? "border-tab-qa bg-tab-qa/5"
                          : "border-transparent bg-background"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-relaxed text-foreground">
                          {q.text}
                        </p>
                        <p className="mt-1 text-xs tabular-nums text-muted">
                          {q.votes} {q.votes === 1 ? "vote" : "votes"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showQuestionOnProjector(q)}
                        className={cn(
                          "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                          isOnProjector
                            ? "bg-tab-qa text-white"
                            : "bg-surface ring-1 ring-border hover:bg-background"
                        )}
                      >
                        {isOnProjector ? "On screen" : "Show"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      <ObsSceneBar />

      <PresenterSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

function ProjectorButton({
  icon: Icon,
  label,
  description,
  active,
  disabled,
  onClick,
  variant = "default",
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: "default" | "muted";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-[88px] flex-col items-start rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98]",
        "touch-manipulation disabled:opacity-40",
        active
          ? "border-foreground bg-foreground text-background"
          : variant === "muted"
            ? "border-border bg-background text-foreground"
            : "border-border bg-background text-foreground hover:border-foreground/30"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          active ? "text-background" : "text-muted"
        )}
      />
      <span className="mt-2 text-sm font-semibold">{label}</span>
      <span
        className={cn(
          "mt-0.5 text-[11px] leading-snug",
          active ? "text-background/70" : "text-muted"
        )}
      >
        {description}
      </span>
    </button>
  );
}

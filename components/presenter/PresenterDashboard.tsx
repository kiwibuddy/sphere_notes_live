"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/session/context";
import { dayLabels } from "@/lib/mock/session";
import { cn } from "@/lib/utils";
import {
  Pause,
  Play,
  Radio,
  Square,
  Cloud,
  Quote,
  BarChart3,
} from "lucide-react";

export function PresenterDashboard() {
  const {
    meta,
    goLive,
    pause,
    resume,
    endDay,
    setDay,
    questions,
    slides,
    displayMode,
    setDisplayMode,
    notes,
  } = useSession();

  const dayInfo = dayLabels[meta.currentDay];

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground">
              Presenter · {meta.title}
            </h1>
            <p className="mt-1 text-muted">
              {dayInfo.label} · {dayInfo.date} · SphereNotes Live
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/student">
              <Button variant="outline" size="sm">
                Student view
              </Button>
            </Link>
            <Link href="/display" target="_blank">
              <Button variant="outline" size="sm">
                Open display
              </Button>
            </Link>
          </div>
        </div>

        {/* Session controls */}
        <section className="mb-6 rounded-lg bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Session control
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={meta.status} />
            {meta.status === "waiting" && (
              <Button onClick={goLive} className="gap-2">
                <Radio className="h-4 w-4" />
                Go Live
              </Button>
            )}
            {meta.status === "live" && (
              <Button variant="outline" onClick={pause} className="gap-2">
                <Pause className="h-4 w-4" />
                Pause (break)
              </Button>
            )}
            {meta.status === "paused" && (
              <Button onClick={resume} className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}
            {(meta.status === "live" || meta.status === "paused") && (
              <Button variant="outline" onClick={endDay} className="gap-2">
                <Square className="h-4 w-4" />
                End Day
              </Button>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  meta.currentDay === d
                    ? "bg-foreground text-background"
                    : "bg-background text-muted hover:text-foreground"
                )}
              >
                Day {d}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Stats */}
          <section className="rounded-lg bg-surface p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Live stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Slide" value={`${slides.current} / ${slides.total}`} />
              <Stat label="Questions" value={String(questions.length)} />
              <Stat label="AI Notes" value={String(notes.length)} />
              <Stat label="Display" value={displayMode} />
            </div>
          </section>

          {/* Push to screen */}
          <section className="rounded-lg bg-surface p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Push to screen (OBS)
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setDisplayMode("wordcloud")}
              >
                <Cloud className="h-4 w-4" />
                Word Cloud
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  setDisplayMode(
                    "quote",
                    notes.find((n) => n.type === "quote")?.content
                      .quote as string
                  )
                }
              >
                <Quote className="h-4 w-4" />
                Pull Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setDisplayMode("stats")}
              >
                <BarChart3 className="h-4 w-4" />
                Stats
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDisplayMode("idle")}
              >
                Clear display
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Open <code className="rounded bg-background px-1">/display</code>{" "}
              as an OBS Browser Source (1920×1080).
            </p>
          </section>

          {/* Q&A moderation */}
          <section className="rounded-lg bg-surface p-6 shadow-card md:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Questions ({questions.length})
            </h2>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-4 rounded-md bg-background p-3"
                >
                  <p className="text-sm text-foreground">{q.text}</p>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-tab-qa">
                    {q.votes}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* QR placeholder */}
        <section className="mt-6 rounded-lg bg-surface p-6 shadow-card">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
            Student join
          </h2>
          <p className="text-sm text-muted">
            Students scan QR or visit:{" "}
            <strong className="text-foreground">/student</strong>
          </p>
          <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-background text-xs text-muted">
            QR (live wiring)
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "live" | "muted" | "outline"> = {
    live: "live",
    paused: "muted",
    waiting: "outline",
    ended: "outline",
  };
  return (
    <Badge variant={variants[status] ?? "outline"} className="uppercase">
      {status}
    </Badge>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}

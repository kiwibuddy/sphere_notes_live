"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionConnectionScreen } from "@/components/setup/SessionConnectionScreen";
import { ensureSupabaseAuth } from "@/lib/session/ensure-auth";
import {
  formatSessionDateLine,
  formatSessionTitle,
} from "@/lib/session/day-label";
import { WORD_CLOUD_UI_ENABLED } from "@/lib/features";
import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import { useSession } from "@/lib/session/context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapSubtitleLines } from "@/lib/session/supabase-mappers";
import { SpeechRecognizer } from "@/lib/speech";
import { sanitizeSpeechText } from "@/lib/speech/sanitize";
import { startNoteExtraction } from "@/lib/notes/extract-notes";
import { enqueueSubtitleCorrection } from "@/lib/speech/enqueue-correction";
import { SubtitlePusher } from "@/lib/speech/push-subtitles";
import type { WordcloudWordsRecord } from "@/lib/wordcloud/ingest";
import { WordcloudPusher } from "@/lib/wordcloud/wordcloud-pusher";
import {
  applySpeechResult,
  createSubtitleWriterState,
  type SubtitleWriterState,
} from "@/lib/speech/subtitle-writer";
import type { SessionStatus } from "@/types/session";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Radio } from "lucide-react";

function isWebSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

function statusLabel(status: SessionStatus): string {
  switch (status) {
    case "live":
      return "Live";
    case "paused":
      return "Paused";
    default:
      return "Waiting";
  }
}

export function SpeechBridge() {
  const {
    meta,
    joinEventId,
    sessionReady,
    getSessionInfo,
  } = useSession();

  const [authOk, setAuthOk] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [lastPreview, setLastPreview] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [lastPushAt, setLastPushAt] = useState<number | null>(null);

  const writerRef = useRef<SubtitleWriterState>(createSubtitleWriterState());
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const pusherRef = useRef<SubtitlePusher | null>(null);
  const wordcloudPusherRef = useRef<WordcloudPusher | null>(null);
  const statusRef = useRef(meta.status);
  const micEnabledRef = useRef(micEnabled);
  const supported = isWebSpeechSupported();

  statusRef.current = meta.status;
  micEnabledRef.current = micEnabled;

  const loadSubtitlesFromDb = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const subtitleRes = await supabase
      .from("day_subtitles")
      .select("lines, full_transcript")
      .eq("event_id", joinEventId)
      .eq("day", LIVE_SYNC_DAY)
      .maybeSingle();

    const wordRes = WORD_CLOUD_UI_ENABLED
      ? await supabase
          .from("day_wordcloud")
          .select("words")
          .eq("event_id", joinEventId)
          .eq("day", LIVE_SYNC_DAY)
          .maybeSingle()
      : { data: null, error: null };

    const { data, error } = subtitleRes;
    const { data: wordRow, error: wordError } = wordRes;

    if (error) {
      setPushError(error.message);
      return;
    }
    if (wordError) {
      setPushError(wordError.message);
      return;
    }

    const lines = mapSubtitleLines(data?.lines ?? []);
    writerRef.current = createSubtitleWriterState(
      lines,
      data?.full_transcript ?? ""
    );
    setLineCount(lines.length);
    const current = lines.find((l) => l.isCurrent);
    setLastPreview(current?.textEn ?? lines.at(-1)?.textEn ?? "");

    if (WORD_CLOUD_UI_ENABLED) {
      wordcloudPusherRef.current?.load(
        wordRow?.words as WordcloudWordsRecord | undefined
      );
    }
  }, [joinEventId]);

  useEffect(() => {
    let cancelled = false;
    void ensureSupabaseAuth().then((uid) => {
      if (!cancelled) setAuthOk(!!uid);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionReady || !authOk) return;
    void loadSubtitlesFromDb();
  }, [sessionReady, authOk, loadSubtitlesFromDb]);

  /** Re-load after iPad Go Live clears `day_subtitles` in Supabase. */
  useEffect(() => {
    if (!sessionReady || !authOk) return;
    if (meta.status === "live" || meta.status === "waiting") {
      void loadSubtitlesFromDb();
    }
  }, [meta.status, sessionReady, authOk, loadSubtitlesFromDb]);

  useEffect(() => {
    pusherRef.current?.dispose();
    pusherRef.current = new SubtitlePusher(
      joinEventId,
      () => LIVE_SYNC_DAY,
      (msg) => setPushError(msg)
    );
    if (WORD_CLOUD_UI_ENABLED) {
      wordcloudPusherRef.current = new WordcloudPusher(
        joinEventId,
        () => LIVE_SYNC_DAY,
        (msg) => setPushError(msg)
      );
    }
    void loadSubtitlesFromDb();
    return () => {
      pusherRef.current?.dispose();
      wordcloudPusherRef.current?.dispose();
    };
  }, [joinEventId, loadSubtitlesFromDb]);

  useEffect(() => {
    if (!sessionReady || !authOk || meta.status !== "live") return;

    return startNoteExtraction({
      eventId: joinEventId,
      day: LIVE_SYNC_DAY,
      getStatus: () => statusRef.current,
      getTranscript: () => writerRef.current.fullTranscript,
      onError: (msg) => setPushError(msg),
    });
  }, [sessionReady, authOk, meta.status, joinEventId]);

  const stopRecognizer = useCallback(() => {
    recognizerRef.current?.stop();
    recognizerRef.current = null;
    setListening(false);
  }, []);

  const handleSpeechResult = useCallback((transcript: string, isFinal: boolean) => {
    const safe = sanitizeSpeechText(transcript);
    const finalizedLineId = isFinal ? writerRef.current.currentLineId : null;

    writerRef.current = applySpeechResult(
      writerRef.current,
      safe,
      isFinal
    );
    setLastPreview(safe.trim());
    setLineCount(writerRef.current.lines.length);
    pusherRef.current?.push(writerRef.current, isFinal);

    if (isFinal) {
      void pusherRef.current?.flush().then((ok) => {
        if (ok) setLastPushAt(Date.now());

        const line =
          writerRef.current.lines.find((l) => l.id === finalizedLineId) ??
          writerRef.current.lines.filter((l) => !l.isCurrent).at(-1);

        if (WORD_CLOUD_UI_ENABLED) {
          const speechForCloud = line?.rawTextEn ?? safe.trim();
          if (speechForCloud) {
            wordcloudPusherRef.current?.ingestFinal(speechForCloud);
          }
        }

        if (line?.rawTextEn) {
          enqueueSubtitleCorrection(
            () => writerRef.current,
            (state) => {
              writerRef.current = state;
            },
            pusherRef.current,
            line.id,
            line.rawTextEn,
            (msg) => setPushError(msg)
          );
        }
      });
    }
  }, []);

  const startRecognizer = useCallback(() => {
    if (!micEnabled || meta.status !== "live") return;
    setSpeechError(null);

    const recognizer = new SpeechRecognizer();
    const started = recognizer.start(
      {
        onResult: handleSpeechResult,
        onError: (err) => {
          if (err === "no-speech" || err === "aborted") return;
          setSpeechError(err);
        },
      },
      {
        shouldRestart: () =>
          statusRef.current === "live" && micEnabledRef.current,
      }
    );

    if (!started) {
      setSpeechError("Could not start speech recognition.");
      return;
    }

    recognizerRef.current = recognizer;
    setListening(true);
  }, [micEnabled, meta.status, handleSpeechResult]);

  useEffect(() => {
    if (!micEnabled) {
      stopRecognizer();
      return;
    }

    if (meta.status === "live") {
      startRecognizer();
    } else {
      stopRecognizer();
    }

    return () => {
      stopRecognizer();
    };
  }, [meta.status, micEnabled, startRecognizer, stopRecognizer]);

  const enableMic = useCallback(() => {
    setMicEnabled(true);
    setSpeechError(null);
  }, []);

  const session = getSessionInfo();

  if (!sessionReady) {
    return <SessionConnectionScreen message="Connecting to session…" />;
  }

  if (!authOk) {
    return (
      <SessionConnectionScreen
        message="Signing in…"
        error="Could not sign in anonymously. Enable Anonymous auth in Supabase."
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto w-full max-w-2xl flex-1 p-4 md:p-6">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Mac speech bridge
          </p>
          <h1 className="font-display text-2xl text-foreground">{meta.title}</h1>
          <p className="mt-2 font-display text-xl text-foreground">
            {formatSessionTitle(session)}
          </p>
          {formatSessionDateLine(session) && (
            <p className="mt-1 text-sm text-muted">
              {formatSessionDateLine(session)}
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            Keep this tab open in <strong>Chrome</strong> on your MacBook while
            teaching. Use the iPad for Go Live / Pause.
          </p>
        </header>

        {!supported && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">
            Web Speech API is not available. Use Google Chrome on macOS (not
            Safari).
          </div>
        )}

        {(speechError || pushError) && (
          <div className="mb-4 space-y-2">
            {speechError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">
                Mic: {speechError}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-3"
                  onClick={() => {
                    setSpeechError(null);
                    if (meta.status === "live") startRecognizer();
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
            {pushError && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Sync: {pushError}
              </div>
            )}
          </div>
        )}

        <section className="mb-6 rounded-xl bg-surface p-4 shadow-card md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Session status
              </p>
              <p className="mt-1 text-xs text-muted">
                Controlled from iPad{" "}
                <Link href="/presenter" className="underline">
                  /presenter
                </Link>
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                meta.status === "live" &&
                  "bg-live-active/15 text-live-active",
                meta.status === "paused" &&
                  "bg-orange-100 text-orange-800",
                meta.status === "waiting" && "bg-surface text-muted"
              )}
            >
              {meta.status === "live" && (
                <Radio className="h-3.5 w-3.5" aria-hidden />
              )}
              {statusLabel(meta.status)}
            </span>
          </div>

          {meta.status === "waiting" && (
            <p className="mt-4 text-sm text-muted">
              Tap <strong>Go Live</strong> on the iPad to start listening and
              push subtitles to student phones.
            </p>
          )}
          {meta.status === "paused" && (
            <p className="mt-4 text-sm text-muted">
              Session paused — recognition stopped. Tap <strong>Resume</strong>{" "}
              on the iPad to continue.
            </p>
          )}
        </section>

        <section className="mb-6 rounded-xl bg-surface p-4 shadow-card md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            {!micEnabled ? (
              <Button
                type="button"
                onClick={enableMic}
                disabled={!supported}
                className="gap-2 bg-live-active text-white hover:bg-live-active/90"
              >
                <Mic className="h-4 w-4" />
                Enable microphone
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMicEnabled(false);
                  stopRecognizer();
                }}
                className="gap-2"
              >
                <MicOff className="h-4 w-4" />
                Disable microphone
              </Button>
            )}

            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                listening ? "text-live-active" : "text-muted"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  listening ? "animate-pulse-live bg-live-active" : "bg-border"
                )}
              />
              {listening ? "Listening" : micEnabled ? "Mic on (not live)" : "Mic off"}
            </span>
          </div>

          {micEnabled && meta.status === "live" && (
            <p className="mt-3 text-xs text-muted">
              Speak into your lapel mic (same input as Zoom). Students see lines
              on the Live tab within about a second.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-background p-4 md:p-6">
          <h2 className="text-sm font-semibold text-foreground">Last heard</h2>
          <p className="mt-3 min-h-[4rem] text-base leading-relaxed text-foreground">
            {lastPreview || (
              <span className="text-muted">Waiting for speech…</span>
            )}
          </p>
          <p className="mt-4 text-xs text-muted">
            {lineCount} subtitle line{lineCount === 1 ? "" : "s"} in session
            {lastPushAt != null && (
              <> · last sync {new Date(lastPushAt).toLocaleTimeString()}</>
            )}
          </p>
        </section>

        <footer className="mt-8 flex flex-wrap gap-2 text-sm">
          <Link href="/presenter">
            <Button variant="outline" size="sm">
              iPad presenter
            </Button>
          </Link>
          <Link href="/display" target="_blank">
            <Button variant="outline" size="sm">
              Open display
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";
import { Link2, Send } from "lucide-react";

export function LiveMessagePanel() {
  const { meta, sendLiveMessage } = useSession();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend =
    (meta.status === "live" || meta.status === "paused") &&
    text.trim().length > 0 &&
    !sending;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    try {
      const ok = await sendLiveMessage(trimmed);
      if (ok) {
        setText("");
      } else {
        setError("Could not send — try again.");
      }
    } catch {
      setError("Could not send — try again.");
    } finally {
      setSending(false);
    }
  };

  const sessionActive = meta.status === "live" || meta.status === "paused";

  return (
    <section className="mb-6 rounded-xl bg-surface p-4 shadow-card md:p-6">
      <div className="mb-4 flex items-start gap-3">
        <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Share on Live tab
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Send a link or short message to every student&apos;s Live tab. It
            appears in the same bubble as subtitles.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) void handleSend();
            }
          }}
          disabled={!sessionActive || sending}
          placeholder={
            sessionActive
              ? "Paste a URL or type a message…"
              : "Go live to share with students"
          }
          rows={2}
          className={cn(
            "min-h-[4.5rem] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground",
            "placeholder:text-muted focus:border-tab-live/40 focus:outline-none focus:ring-2 focus:ring-tab-live/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        <Button
          type="button"
          onClick={() => void handleSend()}
          disabled={!canSend}
          className="gap-1.5 bg-tab-live text-white hover:bg-tab-live/90 sm:min-w-[6.5rem]"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

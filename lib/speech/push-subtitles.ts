import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import type { SubtitleWriterState } from "@/lib/speech/subtitle-writer";

const INTERIM_THROTTLE_MS = 200;

export class SubtitlePusher {
  private pending: SubtitleWriterState | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastPushAt = 0;
  private lastFlushFinishedAt = 0;
  private flushing = false;

  /** Skip realtime reload when this client just wrote the same row. */
  shouldIgnoreExternalSync(withinMs = 1200): boolean {
    return Date.now() - this.lastFlushFinishedAt < withinMs;
  }

  constructor(
    private eventId: string,
    private getDay: () => number,
    private onError?: (message: string) => void
  ) {}

  push(state: SubtitleWriterState, immediate = false) {
    this.pending = state;
    if (immediate) {
      void this.flush();
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastPushAt;
    if (elapsed >= INTERIM_THROTTLE_MS) {
      void this.flush();
      return;
    }

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        void this.flush();
      }, INTERIM_THROTTLE_MS - elapsed);
    }
  }

  async flush(): Promise<boolean> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.pending || this.flushing) return false;

    const state = this.pending;
    this.flushing = true;
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("day_subtitles")
      .update({
        lines: state.lines as unknown as Json,
        full_transcript: state.fullTranscript,
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", this.eventId)
      .eq("day", this.getDay());

    this.flushing = false;
    this.lastPushAt = Date.now();

    if (error) {
      this.onError?.(error.message);
      return false;
    }
    this.lastFlushFinishedAt = Date.now();
    return true;
  }

  dispose() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.pending = null;
  }
}

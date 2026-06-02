import {
  emptyWordcloudRecord,
  ingestSpeechIntoWordcloud,
  type WordcloudWordsRecord,
} from "@/lib/wordcloud/ingest";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

const FLUSH_DEBOUNCE_MS = 400;

export class WordcloudPusher {
  private words: WordcloudWordsRecord = emptyWordcloudRecord();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;

  constructor(
    private eventId: string,
    private getDay: () => number,
    private onError?: (message: string) => void
  ) {}

  load(words: WordcloudWordsRecord | null | undefined) {
    this.words =
      words && typeof words === "object" ? { ...words } : emptyWordcloudRecord();
  }

  reset() {
    this.words = emptyWordcloudRecord();
    void this.flush();
  }

  /** Call on each finalized speech chunk (raw transcript preferred). */
  ingestFinal(text: string) {
    if (!text.trim()) return;
    this.words = ingestSpeechIntoWordcloud(this.words, text);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, FLUSH_DEBOUNCE_MS);
  }

  async flush(): Promise<boolean> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.flushing) return false;

    this.flushing = true;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("day_wordcloud")
      .update({
        words: this.words as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", this.eventId)
      .eq("day", this.getDay());

    this.flushing = false;

    if (error) {
      this.onError?.(error.message);
      return false;
    }
    return true;
  }

  dispose() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

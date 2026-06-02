/**
 * LIVE: Web Speech API wrapper for presenter browser only.
 * Runs in /presenter when live wiring is enabled.
 */

export type SpeechStatus = "idle" | "listening" | "paused";

export interface SpeechCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export interface SpeechStartOptions {
  /** Return true to restart recognition after Chrome stops (e.g. still live). */
  shouldRestart?: () => boolean;
}

interface SpeechResultEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface RecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export class SpeechRecognizer {
  private recognition: RecognitionInstance | null = null;
  private status: SpeechStatus = "idle";

  start(callbacks: SpeechCallbacks, options?: SpeechStartOptions): boolean {
    if (typeof window === "undefined") return false;

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      callbacks.onError?.("Web Speech API not supported in this browser.");
      return false;
    }

    this.recognition = new SpeechRecognitionCtor() as RecognitionInstance;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: SpeechResultEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const isFinal = event.results[event.results.length - 1]?.isFinal ?? false;
      callbacks.onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: { error: string }) => {
      if (event.error === "aborted") return;
      callbacks.onError?.(event.error);
    };

    this.recognition.onend = () => {
      if (this.status !== "listening") return;
      if (!options?.shouldRestart?.()) return;
      try {
        this.recognition?.start();
      } catch {
        // Chrome may reject if start() races with stop()
      }
    };

    this.recognition.start();
    this.status = "listening";
    return true;
  }

  pause() {
    this.status = "paused";
    this.recognition?.stop();
  }

  stop() {
    this.status = "idle";
    this.recognition?.stop();
  }

  getStatus() {
    return this.status;
  }
}

declare global {
  interface Window {
    SpeechRecognition: new () => RecognitionInstance;
    webkitSpeechRecognition: new () => RecognitionInstance;
  }
}

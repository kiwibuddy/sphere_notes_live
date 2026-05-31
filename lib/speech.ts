/**
 * LIVE: Web Speech API wrapper for presenter browser only.
 * Runs in /presenter when live wiring is enabled.
 */

export type SpeechStatus = "idle" | "listening" | "paused";

export interface SpeechCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
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
  start: () => void;
  stop: () => void;
}

export class SpeechRecognizer {
  private recognition: RecognitionInstance | null = null;
  private status: SpeechStatus = "idle";

  start(callbacks: SpeechCallbacks): boolean {
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
      callbacks.onError?.(event.error);
    };

    this.recognition.start();
    this.status = "listening";
    return true;
  }

  pause() {
    this.recognition?.stop();
    this.status = "paused";
  }

  stop() {
    this.recognition?.stop();
    this.status = "idle";
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

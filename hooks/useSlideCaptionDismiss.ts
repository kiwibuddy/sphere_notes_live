"use client";

import { useEffect, useState } from "react";

/** TV-style slide captions: hide after speech pauses (no caption updates). */
export const SLIDE_CAPTION_DISMISS_MS = 4000;

/**
 * Keeps the slide caption visible while the line updates; hides it
 * {@link SLIDE_CAPTION_DISMISS_MS}ms after the last change.
 */
export function useSlideCaptionDismiss(
  captionKey: string | null,
  enabled: boolean
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !captionKey) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(
      () => setVisible(false),
      SLIDE_CAPTION_DISMISS_MS
    );
    return () => window.clearTimeout(timer);
  }, [captionKey, enabled]);

  return visible;
}

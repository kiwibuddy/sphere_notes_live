"use client";

import { useMineNotes } from "@/hooks/useMineNotes";
import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import type { ClippingSource } from "@/types/session";

export interface SendToMineOptions {
  imageData?: string;
}

export function useSendToMine() {
  const { addClipping } = useMineNotes(LIVE_SYNC_DAY);

  return (
    text: string,
    source: ClippingSource,
    sourceLabel: string,
    options?: SendToMineOptions
  ) => {
    addClipping({
      id: `clip-${Date.now()}`,
      source,
      sourceLabel,
      text,
      createdAt: new Date().toISOString(),
      imageData: options?.imageData,
    });
  };
}

"use client";

import { useSession } from "@/lib/session/context";
import { useMineNotes } from "@/hooks/useMineNotes";
import type { ClippingSource } from "@/types/session";

export function useSendToMine() {
  const { meta } = useSession();
  const { addClipping } = useMineNotes(meta.currentDay);

  return (
    text: string,
    source: ClippingSource,
    sourceLabel: string
  ) => {
    addClipping({
      id: `clip-${Date.now()}`,
      source,
      sourceLabel,
      text,
      createdAt: new Date().toISOString(),
    });
  };
}

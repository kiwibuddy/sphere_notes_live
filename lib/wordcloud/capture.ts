import type { WordCloudWord } from "@/types/session";
import { drawWordCloud, layoutWordCloud } from "./layout";

/** Render an offscreen snapshot for Mine note clippings */
export function captureWordCloudSnapshot(
  words: WordCloudWord[],
  width = 560,
  height = 240
): string | null {
  if (typeof document === "undefined" || words.length === 0) return null;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#F7F5F2";
  ctx.fillRect(0, 0, width, height);

  const placed = layoutWordCloud(words, width, height, ctx);
  drawWordCloud(ctx, placed, null, 0, width, height);

  try {
    return canvas.toDataURL("image/jpeg", 0.88);
  } catch {
    return null;
  }
}

import type { SlideInfo } from "@/types/session";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect fill="#FFFFFF" width="800" height="450"/>
      <text x="400" y="210" text-anchor="middle" fill="#1A1A18" font-family="Georgia,serif" font-size="32">Biblical Worldview</text>
      <text x="400" y="252" text-anchor="middle" fill="#6B6860" font-family="system-ui" font-size="18">Slide PLACEHOLDER</text>
    </svg>`
  );

export function getSlidesForDay(day: number): SlideInfo {
  const total = 24;
  const images = Array.from({ length: total }, (_, i) => {
    const num = i + 1;
    const svg = PLACEHOLDER.replace("PLACEHOLDER", `${num}`);
    return svg.replace(
      "Biblical Worldview",
      `Day ${day} · Slide ${num}`
    );
  });
  return {
    current: day === 3 ? 8 : 5,
    total,
    images,
  };
}

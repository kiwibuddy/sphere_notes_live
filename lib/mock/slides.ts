import type { SlideInfo } from "@/types/session";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect fill="#F7F5F2" width="800" height="450"/>
      <rect fill="#FFFFFF" x="40" y="40" width="720" height="370" rx="12" stroke="#E8E5E0" stroke-width="2"/>
      <text x="400" y="200" text-anchor="middle" fill="#1A1A18" font-family="Georgia,serif" font-size="28">Biblical Worldview</text>
      <text x="400" y="240" text-anchor="middle" fill="#6B6860" font-family="system-ui" font-size="16">Slide PLACEHOLDER</text>
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

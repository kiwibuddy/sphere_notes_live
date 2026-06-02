import type { SlideInfo } from "@/types/session";

function placeholderSvg(day: number, num: number, eventTitle: string): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
        <rect fill="#FFFFFF" width="800" height="450"/>
        <text x="400" y="210" text-anchor="middle" fill="#1A1A18" font-family="Georgia,serif" font-size="32">${eventTitle}</text>
        <text x="400" y="252" text-anchor="middle" fill="#6B6860" font-family="system-ui" font-size="18">Day ${day} · Slide ${num}</text>
        <text x="400" y="290" text-anchor="middle" fill="#9C9890" font-family="system-ui" font-size="14">Add PNGs to public/slides/</text>
      </svg>`
    )
  );
}

/** Fallback when no PNGs exist yet in the slide folder. */
export function placeholderSlides(
  day: number,
  eventTitle: string,
  total = 1
): SlideInfo {
  const images = Array.from({ length: total }, (_, i) =>
    placeholderSvg(day, i + 1, eventTitle)
  );
  return { current: 1, total, images };
}

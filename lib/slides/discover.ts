import fs from "fs";
import path from "path";

function slideSortKey(filename: string): number {
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Server-side: list PNG slides for a teaching day from public/slides/day-{n}/ */
export function discoverSlides(day: number): { total: number; images: string[] } {
  const dir = path.join(process.cwd(), "public", "slides", `day-${day}`);

  if (!fs.existsSync(dir)) {
    return { total: 0, images: [] };
  }

  const files = fs
    .readdirSync(dir)
    .filter((file) => /\.png$/i.test(file))
    .sort((a, b) => slideSortKey(a) - slideSortKey(b));

  const images = files.map((file) => `/slides/day-${day}/${file}`);
  return { total: images.length, images };
}

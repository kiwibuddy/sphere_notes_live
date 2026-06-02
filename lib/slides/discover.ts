import fs from "fs";
import path from "path";

function slideSortKey(filename: string): number {
  const keynote = filename.match(/\.(\d+)\.png$/i);
  if (keynote) return parseInt(keynote[1], 10);
  const fallback = filename.match(/(\d+)/);
  return fallback ? parseInt(fallback[1], 10) : 0;
}

/** Server-side: list PNG slides from public/slides/ (flat folder, full Keynote export). */
export function discoverSlides(): { total: number; images: string[] } {
  const dir = path.join(process.cwd(), "public", "slides");

  if (!fs.existsSync(dir)) {
    return { total: 0, images: [] };
  }

  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.png$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => slideSortKey(a) - slideSortKey(b));

  const images = files.map((file) => `/slides/${file}`);
  return { total: images.length, images };
}

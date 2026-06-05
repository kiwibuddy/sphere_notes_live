import fs from "fs";
import path from "path";

function slideSortKey(filename: string): number {
  const keynote = filename.match(/\.(\d+)\.png$/i);
  if (keynote) return parseInt(keynote[1], 10);
  const fallback = filename.match(/(\d+)/);
  return fallback ? parseInt(fallback[1], 10) : 0;
}

/** Server-side: list PNG slides from public/slides/ (flat or nested folders). */
export function discoverSlides(): { total: number; images: string[] } {
  const dir = path.join(process.cwd(), "public", "slides");

  if (!fs.existsSync(dir)) {
    return { total: 0, images: [] };
  }

  const stack: string[] = [dir];
  const pngRelPaths: string[] = [];

  while (stack.length) {
    const currentDir = stack.pop()!;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && /\.png$/i.test(entry.name)) {
        const rel = path.relative(dir, fullPath).replaceAll("\\", "/");
        pngRelPaths.push(rel);
      }
    }
  }

  pngRelPaths.sort((a, b) => slideSortKey(a) - slideSortKey(b));
  const images = pngRelPaths.map((rel) => `/slides/${rel}`);
  return { total: images.length, images };
}

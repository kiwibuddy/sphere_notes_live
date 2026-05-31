import type { WordCloudWord } from "@/types/session";

export const mockWordcloud: WordCloudWord[] = [
  { word: "Kingdom", count: 42, category: "theology" },
  { word: "Scripture", count: 38, category: "theology" },
  { word: "Worldview", count: 35, category: "concepts" },
  { word: "Christ", count: 31, category: "theology" },
  { word: "YWAM", count: 28, category: "names" },
  { word: "Creation", count: 24, category: "concepts" },
  { word: "Mission", count: 22, category: "theology" },
  { word: "Truth", count: 20, category: "concepts" },
  { word: "Covenant", count: 18, category: "theology" },
  { word: "Discipleship", count: 16, category: "concepts" },
  { word: "Revelation", count: 14, category: "theology" },
  { word: "Culture", count: 12, category: "general" },
  { word: "Ethics", count: 11, category: "concepts" },
  { word: "Jesus", count: 30, category: "names" },
  { word: "Human", count: 9, category: "general" },
];

export function getWordcloudForDay(day: number): WordCloudWord[] {
  return mockWordcloud.map((w) => ({
    ...w,
    count: Math.max(5, w.count - (4 - day) * 3),
  }));
}

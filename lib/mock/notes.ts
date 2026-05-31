import type { NoteCard } from "@/types/session";

export const mockNotes: NoteCard[] = [
  {
    id: "n1",
    type: "section",
    createdAt: "10:15",
    content: {
      title: "Foundations of Biblical Worldview",
    },
  },
  {
    id: "n2",
    type: "bullets",
    createdAt: "10:22",
    content: {
      items: [
        "Worldview = the lens through which we interpret all of life",
        "Everyone has a worldview — the question is which one",
        "Scripture claims authority over history, science, ethics, and mission",
      ],
    },
  },
  {
    id: "n3",
    type: "quote",
    createdAt: "10:35",
    content: {
      quote:
        "We do not read Scripture to escape the world — we read it to see the world truthfully.",
    },
  },
  {
    id: "n4",
    type: "scripture",
    createdAt: "10:41",
    content: {
      reference: "Colossians 1:16–17",
      translation: "BSB",
      text: "For in Him all things were created, things in heaven and on earth, visible and invisible… In Him all things hold together.",
    },
  },
  {
    id: "n5",
    type: "concept",
    createdAt: "10:48",
    content: {
      term: "Imago Dei",
      definition:
        "The doctrine that humans bear the image of God — grounding human dignity, creativity, and moral responsibility.",
    },
  },
  {
    id: "n6",
    type: "diagram",
    createdAt: "10:55",
    content: {
      title: "Worldview Layers",
      nodes: ["Assumptions", "Beliefs", "Values", "Actions"],
    },
  },
  {
    id: "n7",
    type: "story",
    createdAt: "11:02",
    content: {
      title: "The Missionary Who Forgot Why",
    },
  },
];

export function getNotesForDay(day: number): NoteCard[] {
  if (day === 1) return mockNotes.slice(0, 4);
  if (day === 2) return mockNotes.slice(0, 5);
  return mockNotes;
}

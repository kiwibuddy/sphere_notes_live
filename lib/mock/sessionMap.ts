import type { SessionSegment } from "@/types/session";

export const mockSessionMap: SessionSegment[] = [
  {
    id: "seg1",
    title: "Opening & Prayer",
    startTime: "09:00",
    noteIds: [],
  },
  {
    id: "seg2",
    title: "What Is a Worldview?",
    startTime: "09:15",
    noteIds: ["n1", "n2"],
  },
  {
    id: "seg3",
    title: "Scripture as Authority",
    startTime: "09:45",
    noteIds: ["n3", "n4"],
  },
  {
    id: "seg4",
    title: "Imago Dei & Human Dignity",
    startTime: "10:15",
    noteIds: ["n5", "n6"],
  },
  {
    id: "seg5",
    title: "Story: The Missionary Who Forgot Why",
    startTime: "10:45",
    noteIds: ["n7"],
  },
];

export function getSessionMapForDay(day: number): SessionSegment[] {
  return mockSessionMap.slice(0, Math.min(day + 2, mockSessionMap.length));
}

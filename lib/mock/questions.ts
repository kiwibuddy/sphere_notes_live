import type { Question } from "@/types/session";

export const mockQuestions: Question[] = [
  {
    id: "q1",
    text: "How does a biblical worldview change the way we approach missions in secular contexts?",
    votes: 23,
    createdAt: "12 min ago",
    status: "pinned",
    hasVoted: true,
  },
  {
    id: "q2",
    text: "What is the difference between a Christian worldview and a biblical worldview?",
    votes: 17,
    createdAt: "8 min ago",
    status: "open",
  },
  {
    id: "q3",
    text: "How do we teach worldview to students who grew up without church background?",
    votes: 11,
    createdAt: "5 min ago",
    status: "open",
  },
  {
    id: "q4",
    text: "Can science and a biblical worldview genuinely coexist, or is conflict inevitable?",
    votes: 6,
    createdAt: "2 min ago",
    status: "open",
  },
];

export function getQuestionsForDay(day: number): Question[] {
  if (day <= 1) return mockQuestions.slice(0, 2);
  if (day === 2) return mockQuestions.slice(0, 3);
  return mockQuestions;
}

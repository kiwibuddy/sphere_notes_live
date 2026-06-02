import type { Question } from "@/types/session";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { mapQuestionRow } from "@/lib/session/supabase-mappers";

type Client = SupabaseClient<Database>;

export async function fetchQuestionsForDay(
  supabase: Client,
  eventId: string,
  day: number,
  voterId: string | null,
  votedIds: Set<string>
): Promise<Question[]> {
  const { data: questionRows } = await supabase
    .from("questions")
    .select("*")
    .eq("event_id", eventId)
    .eq("day", day)
    .order("votes", { ascending: false });

  if (!questionRows?.length) return [];

  if (voterId) {
    const qIds = questionRows.map((q) => q.id);
    const { data: votes } = await supabase
      .from("question_votes")
      .select("question_id")
      .eq("voter_id", voterId)
      .in("question_id", qIds);
    votedIds.clear();
    for (const v of votes ?? []) {
      votedIds.add(v.question_id);
    }
  }

  return questionRows.map((q) => mapQuestionRow(q, votedIds));
}

export function mergeQuestionRow(
  row: {
    id: string;
    text: string;
    votes: number;
    status: string;
    created_at: string;
  },
  votedIds: Set<string>
): Question {
  return mapQuestionRow(row, votedIds);
}

export function sortQuestions(questions: Question[]): Question[] {
  return [...questions]
    .filter((q) => q.status !== "archived")
    .sort((a, b) => b.votes - a.votes);
}

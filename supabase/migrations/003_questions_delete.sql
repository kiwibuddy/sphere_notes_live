-- Allow presenter (authenticated) to clear all questions for a session day
create policy "questions_delete" on public.questions
  for delete to authenticated using (true);

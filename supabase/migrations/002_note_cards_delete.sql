-- Allow presenter (authenticated) to clear AI notes when starting a new live session
create policy "note_cards_delete" on public.note_cards
  for delete to authenticated using (true);

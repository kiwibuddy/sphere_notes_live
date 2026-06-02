-- Allow upsert when day_subtitles row is missing for an event/day.
create policy "day_subtitles_insert" on public.day_subtitles
  for insert to authenticated with check (true);

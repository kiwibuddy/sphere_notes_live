-- SphereNotes Live — initial schema (source-of-truth §10 Step 1)
-- Run in Supabase SQL Editor or via CLI: supabase db push

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core event + per-day state
-- ---------------------------------------------------------------------------

create table public.events (
  id text primary key,
  title text not null default 'Biblical Worldview',
  presenter text not null default '',
  total_days int not null default 4 check (total_days >= 1),
  current_day int not null default 1 check (current_day >= 1),
  status text not null default 'waiting'
    check (status in ('waiting', 'live', 'paused', 'ended')),
  started_at timestamptz,
  student_count int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.day_meta (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  topic text not null default '',
  date text not null default '',
  primary key (event_id, day)
);

create table public.day_display (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  mode text not null default 'idle',
  payload jsonb not null default '{}'::jsonb,
  quote_text text not null default '',
  question_id text,
  question_text text,
  question_votes int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (event_id, day)
);

create table public.day_slides (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  current int not null default 1,
  total int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (event_id, day)
);

create table public.day_reactions (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  fire int not null default 0,
  clap int not null default 0,
  think int not null default 0,
  question int not null default 0,
  primary key (event_id, day)
);

-- Subtitles stored as ordered JSON array for MVP (Step 6+)
create table public.day_subtitles (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  lines jsonb not null default '[]'::jsonb,
  full_transcript text not null default '',
  updated_at timestamptz not null default now(),
  primary key (event_id, day)
);

create table public.day_wordcloud (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  words jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (event_id, day)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  text text not null,
  votes int not null default 0,
  status text not null default 'open'
    check (status in ('open', 'pinned', 'answered', 'archived')),
  created_at timestamptz not null default now()
);

create table public.question_votes (
  question_id uuid not null references public.questions (id) on delete cascade,
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (question_id, voter_id)
);

create table public.note_cards (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  type text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.session_segments (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  title text not null,
  start_time text not null default '',
  note_ids jsonb not null default '[]'::jsonb,
  sort_order int not null default 0
);

create table public.day_archives (
  event_id text not null references public.events (id) on delete cascade,
  day int not null check (day >= 1),
  archived_at timestamptz not null default now(),
  snapshot jsonb not null,
  primary key (event_id, day)
);

-- ---------------------------------------------------------------------------
-- Seed default event (idempotent)
-- ---------------------------------------------------------------------------

insert into public.events (id, title, presenter, total_days, current_day, status)
values (
  'biblical-worldview-2026',
  'Biblical Worldview',
  'Nathaniel Baldock',
  4,
  1,
  'waiting'
)
on conflict (id) do nothing;

insert into public.day_meta (event_id, day, topic, date)
values
  ('biblical-worldview-2026', 1, 'The Kingdom Blueprint', ''),
  ('biblical-worldview-2026', 2, 'Day 2', ''),
  ('biblical-worldview-2026', 3, 'Day 3', ''),
  ('biblical-worldview-2026', 4, 'Day 4', '')
on conflict (event_id, day) do nothing;

insert into public.day_display (event_id, day)
select id, d from public.events, generate_series(1, 4) as d
where id = 'biblical-worldview-2026'
on conflict do nothing;

insert into public.day_slides (event_id, day)
select id, d from public.events, generate_series(1, 4) as d
where id = 'biblical-worldview-2026'
on conflict do nothing;

insert into public.day_reactions (event_id, day)
select id, d from public.events, generate_series(1, 4) as d
where id = 'biblical-worldview-2026'
on conflict do nothing;

insert into public.day_subtitles (event_id, day)
select id, d from public.events, generate_series(1, 4) as d
where id = 'biblical-worldview-2026'
on conflict do nothing;

insert into public.day_wordcloud (event_id, day)
select id, d from public.events, generate_series(1, 4) as d
where id = 'biblical-worldview-2026'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.day_meta;
alter publication supabase_realtime add table public.day_display;
alter publication supabase_realtime add table public.day_slides;
alter publication supabase_realtime add table public.day_reactions;
alter publication supabase_realtime add table public.day_subtitles;
alter publication supabase_realtime add table public.day_wordcloud;
alter publication supabase_realtime add table public.questions;
alter publication supabase_realtime add table public.note_cards;
alter publication supabase_realtime add table public.session_segments;

-- ---------------------------------------------------------------------------
-- RLS (MVP — tighten with presenter auth before public deploy)
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;
alter table public.day_meta enable row level security;
alter table public.day_display enable row level security;
alter table public.day_slides enable row level security;
alter table public.day_reactions enable row level security;
alter table public.day_subtitles enable row level security;
alter table public.day_wordcloud enable row level security;
alter table public.questions enable row level security;
alter table public.question_votes enable row level security;
alter table public.note_cards enable row level security;
alter table public.session_segments enable row level security;
alter table public.day_archives enable row level security;

-- Read: anyone (students on phones)
create policy "events_select" on public.events for select using (true);
create policy "day_meta_select" on public.day_meta for select using (true);
create policy "day_display_select" on public.day_display for select using (true);
create policy "day_slides_select" on public.day_slides for select using (true);
create policy "day_reactions_select" on public.day_reactions for select using (true);
create policy "day_subtitles_select" on public.day_subtitles for select using (true);
create policy "day_wordcloud_select" on public.day_wordcloud for select using (true);
create policy "questions_select" on public.questions for select using (true);
create policy "question_votes_select" on public.question_votes for select using (true);
create policy "note_cards_select" on public.note_cards for select using (true);
create policy "session_segments_select" on public.session_segments for select using (true);
create policy "day_archives_select" on public.day_archives for select using (true);

-- Presenter/session control: authenticated users (enable Anonymous Auth in dashboard)
-- TODO Step 2+: restrict writes to presenter role / server routes only
create policy "events_update" on public.events
  for update to authenticated using (true) with check (true);

create policy "day_meta_upsert" on public.day_meta
  for all to authenticated using (true) with check (true);

create policy "day_display_update" on public.day_display
  for update to authenticated using (true) with check (true);

create policy "day_slides_update" on public.day_slides
  for update to authenticated using (true) with check (true);

create policy "day_reactions_update" on public.day_reactions
  for update to authenticated using (true) with check (true);

create policy "day_subtitles_update" on public.day_subtitles
  for update to authenticated using (true) with check (true);

create policy "day_wordcloud_update" on public.day_wordcloud
  for update to authenticated using (true) with check (true);

-- Students: questions + votes when authenticated (anonymous)
create policy "questions_insert" on public.questions
  for insert to authenticated with check (true);

create policy "questions_update_votes" on public.questions
  for update to authenticated using (true) with check (true);

create policy "question_votes_insert" on public.question_votes
  for insert to authenticated with check (auth.uid() = voter_id);

create policy "note_cards_insert" on public.note_cards
  for insert to authenticated with check (true);

create policy "session_segments_all" on public.session_segments
  for all to authenticated using (true) with check (true);

create policy "day_archives_insert" on public.day_archives
  for insert to authenticated with check (true);

-- Ensure questions table broadcasts INSERT/UPDATE (run once if realtime Q&A feels stuck)
alter publication supabase_realtime add table public.questions;

# Supabase setup (Step 1)

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers** → enable **Anonymous** sign-ins.
3. **SQL Editor** → run `migrations/001_initial_schema.sql`.
4. Copy **Project URL**, **anon key**, and **service_role key** into `.env.local` (see repo `.env.example`).
5. Restart `npm run dev`. **Without keys, the app shows a setup screen only** — no mock data.

## Step 1 test

1. iPad: `/presenter` → **Go Live**
2. Phone: `/student` (same Wi‑Fi, same env / Vercel deploy)
3. Phone should show **LIVE** within ~1s
4. ⚙ Settings → change week or day topic → phone header updates

## Realtime

If subscriptions are silent, confirm tables are in **Database → Replication** (migration adds them to `supabase_realtime`).

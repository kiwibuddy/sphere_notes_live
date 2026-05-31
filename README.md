# SphereNotes Live

Real-time companion app for live classroom teaching. MVP runs entirely on **mock data** — no API keys required.

## Quick start

```bash
npm install
npm run dev
```

Open:
- **Student (phone):** [http://localhost:3000/student](http://localhost:3000/student)
- **Presenter:** [http://localhost:3000/presenter](http://localhost:3000/presenter)
- **OBS display:** [http://localhost:3000/display](http://localhost:3000/display)

## Current topic

**Biblical Worldview** — 4 teaching days (Day 1–4)

## MVP demo flow

1. Open `/presenter` and click **Go Live**
2. Open `/student` on your phone (or resize browser to 390px)
3. Live, Slides, and Notes tabs turn green; reactions appear
4. Use **Pause** during break — no new content
5. **End Day** archives and advances to next day
6. **Week** tab shows read-only archives for past days
7. **Mine** notes persist in localStorage per day

## Architecture

| Route | Purpose |
|---|---|
| `/student` | Live subtitles (default tab) |
| `/student/qa` | Q&A (gated until live) |
| `/student/slides` | Keynote slide sync |
| `/student/notes/auto` | AI-generated cards |
| `/student/notes/mine` | Personal notes (localStorage) |
| `/student/notes/cloud` | Word cloud |
| `/student/notes/overview` | Session timeline |
| `/student/week` | Day archive |
| `/presenter` | Session controls |
| `/display` | OBS big-screen |

## Design

- **Light theme** — warm whites, editorial feel
- **Display font:** Instrument Serif
- **UI font:** Geist Sans
- Reference mock: `SessionLive-Mock.html` (dark theme, structure only)

## Phase E — Live wiring checklist

When ready to connect live services, add to `.env.local`:

```env
# Anthropic (English correction + AI notes)
ANTHROPIC_API_KEY=

# Google Cloud Translation (Live tab subtitles only)
GOOGLE_TRANSLATE_API_KEY=

# Supabase Realtime
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Event
NEXT_PUBLIC_EVENT_ID=biblical-worldview-2026
```

API routes (stubs ready):
- `POST /api/claude/correct` — subtitle correction
- `POST /api/claude/notes` — AI note cards
- `POST /api/translate` — subtitle translation

Bible text: `public/bible/sample-verses.json` (KJV + BSB). Expand for full offline lookup.

Slides: upload PNGs to `public/slides/day-{n}/slide-001.png` etc.

Deploy to **Vercel** — no secrets needed for mock MVP.

## Stack

Next.js 14 · TypeScript · Tailwind · shadcn-style UI · Framer Motion · MockSessionProvider (→ Supabase Realtime)

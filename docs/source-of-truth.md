# SphereNotes Live — Source of Truth

**Last updated:** 2 June 2026 (flat slide deck + Vercel production URLs)  
**Replaces for day-to-day decisions:** `SphereNotesLive-PRD-v1.0.docx` (historical), scattered chat notes  
**Companion docs:** [Instruction Manual](./instruction-manual.md) · [Design Brief](../SphereNotesLive-DesignBrief.md)

This is the **one place** that tracks (1) what the product is *now*, (2) what is built, and (3) what is left to reach a **fully functioning live presentation**.

When anything conflicts with the old PRD Word doc or `pre-backend-design.md`, **this file wins**.

---

## 1. Product summary (current vision)

SphereNotes Live is a **phone-based second screen** for live teaching. Students scan a link/QR — no app install. The presenter’s voice drives subtitles, word cloud, and AI notes. Keynote slides sync to phones. Q&A and reactions update in real time.

**Separate from Zoom:** Zoom sends video to the projector (via OBS). Students use the web app, not Zoom.

### Your teaching setup (locked)

| Surface | Role |
|---------|------|
| **iPad** | `/presenter` — Go Live / Pause / End Day, **Show on projector**, question picker, **6 OBS scene buttons** (bottom bar) |
| **MacBook** | Zoom (classroom camera) + Keynote **presenter notes** + Chrome **`/presenter/speech`** (mic/transcription — **not built yet**) |
| **External monitor** | Keynote **slideshow** fullscreen — OBS **Keynote** scene captures this |
| **Student phones** | `/student?event=…&day=…` — **day from URL on student** when Supabase is configured; teaching-day topics still per `day` row |
| **Projector** | Zoom ← OBS Virtual Camera |

**Audio:** Lapel mic → Mac input (Zoom + transcription). AirPods → Mac output (hear Zoom). Do not use AirPods as mic while teaching.

### OBS scenes (6 buttons on iPad — built)

| Button | Default OBS scene name | Room sees |
|--------|------------------------|-----------|
| **Desktop** | `Desktop` | MacBook screen (pre-show; hide private windows) |
| **Idle** | `Title / Idle` | Optional idle/title scene in OBS |
| **Keynote** | `Keynote` | External monitor — slides only |
| **Camera** | `Camera` | Logitech webcam |
| **SphereNotes** | `SphereNotes` | Browser Source → `/display` |
| **PiP** | `Keynote + PiP` | Slides + camera corner (optional) |

Scene names must match OBS exactly (overridable in OBS settings panel on iPad).

### Presenter UI model (locked this session)

Two separate controls — do not confuse them:

| Control | What it does |
|---------|----------------|
| **Show on projector** (middle of `/presenter`) | Sets `/display` content: **Word cloud**, **Top question**, or **Clear** |
| **OBS bar** (bottom) | Switches OBS scenes on the Mac (Keynote, Camera, SphereNotes, etc.) |

Typical highlight: pick Word cloud or a Question → tap OBS **SphereNotes**.

**Removed from presenter (by design):** Day 1–4 switcher on main screen, Stats on projector, Pull quote buttons. You teach **one day at a time**; use **End Day** to advance. Day topic/title edited via **⚙ Settings** (gear icon).

### Stack (current — not PRD Firebase)

| Layer | Choice |
|-------|--------|
| App | Next.js 14, TypeScript, Tailwind, Framer Motion |
| Live sync | **Supabase Realtime** (not Firebase) |
| AI | Claude API via `/api/claude/*` |
| Speech | **Web Speech API** default — Chrome on Mac (`/presenter/speech` — planned). **Optional upgrade:** Deepgram streaming ASR (see §10 Step 13). **Not using:** Otter / Granola (personal meeting tools — no live broadcast to student phones). |
| Slides | Keynote → PNG in **`public/slides/`** (flat full deck) + **`npm run slide-bridge`** on Mac during slideshow |
| OBS remote | WebSocket v5 from iPad browser → Mac OBS (LAN only) |
| Auth | **Supabase Anonymous Auth** on student join (for vote dedup) — planned |
| Bible text | **Bundled JSON** (KJV + BSB) |
| Hosting | Vercel — **https://sphere-notes-live.vercel.app** |

### Production URLs (Vercel)

| Role | URL |
|------|-----|
| **iPad presenter** | https://sphere-notes-live.vercel.app/presenter |
| **Student join (day 1)** | https://sphere-notes-live.vercel.app/student?event=biblical-worldview-2026&day=1 |
| **OBS `/display`** | https://sphere-notes-live.vercel.app/display |

Set **`NEXT_PUBLIC_APP_URL=https://sphere-notes-live.vercel.app`** on Vercel (and `.env.local` when testing QR from localhost) so join links/QR never point at `localhost`.

There is **no separate iPad route** — iPad uses `/presenter` (add to Home Screen in Safari).

### Event model

- **Event:** `biblical-worldview-2026`
- **Days in app:** **4** (`totalDays: 4` in code)
- **URLs (target):** `/student?event=biblical-worldview-2026&day=1` — day from URL when live, not presenter localStorage

---

## 2. Completion tracker

Legend: ✅ Done · 🟡 Partial · ❌ Not started

### A. Student app (UI)

| Item | Status | Notes |
|------|--------|-------|
| Light theme, **5 main tabs** | ✅ | Live · Q&A · Slides · Notes · Week — Notes has 4 sub-routes (auto / mine / cloud / overview) |
| Responsive shell | ✅ | Bottom tab bar (phone) · top nav (md+) · full width · `h-dvh` no page scroll on Slides |
| Live subtitles tab | 🟡 | UI works; mock/static lines only |
| Q&A submit + upvote | 🟡 | Works on mock; gated until `live` |
| Q&A pin/answered/archive (student view) | 🟡 | Types exist; presenter can’t moderate yet |
| AI Notes — 7 card types | ✅ | Mock cards per day |
| Word cloud canvas | ✅ | Mock growth ~every 2.8s while `live`; session / 5 min toggle |
| Slide viewer | ✅ | **Current slide only** (no thumbs/count/nav); **95% viewport height**; real PNGs via `/api/slides` or placeholders |
| Slide subtitles overlay | 🟡 | Captions toggle + language picker **top-right**; subtitle line **bottom**; mock text only |
| Slide fullscreen | ✅ | Native fullscreen + overlay fallback; **auto-exit bug fixed** (session re-render no longer kicks out) |
| Session map / overview | ✅ | Mock data |
| My Notes editor + clippings | ✅ | localStorage per day; rich toolbar; cloud clippings as JPEG snapshot |
| Send to My Notes | ✅ | From live, Q&A, cards, slides, cloud |
| Reactions | 🟡 | Header inline (all sizes) + bottom strip (phone only); mock counts |
| Week archive (read-only past days) | ✅ | Mock archives |
| Translation language picker | 🟡 | UI only; API stub |
| Export PDF (My Notes) | ❌ | Button present, not wired |
| Student join via URL `event` + `day` | 🟡 | Student route reads `?event` + `?day` with Supabase; presenter uses `current_day` for join QR |
| Session hydration | ✅ | localStorage restored after mount (no Day 1/3 SSR mismatch) |

### B. Presenter app

| Item | Status | Notes |
|------|--------|-------|
| `/presenter` dashboard | 🟡 | Go Live / Pause / End Day in header; projector + questions; settings gear |
| Session settings modal (⚙ gear) | ✅ | Week topic, day topic, **native date picker + Today**; **`public/slides/`** hint, refresh PNGs, manual slide step (test) |
| `/presenter/setup` full checklist | ❌ | Partially replaced by settings modal — no mic/Supabase/QR checks yet |
| `/presenter/speech` (Mac speech bridge) | ❌ | **Required for live** — not built |
| iPad-friendly touch layout | 🟡 | Large projector + OBS buttons; session controls in header |
| OBS WebSocket remote (6 buttons) | ✅ | Bottom bar; Connect + Mac IP + password; scene name overrides |
| Push question to `/display` | ✅ | Per-question **Show** + **Top question** shortcut |
| Q&A pin / archive | ❌ | Not built |
| Pull quote on projector | ❌ | Removed from UI (display still supports `quote` mode in code) |
| Stats / reactions on projector | ❌ | Removed from UI by design — optional later |
| Correction dictionary UI | ❌ | Not built |
| Student join QR + link on presenter | ✅ | `PresenterJoinPanel` — QR + copy link (`buildStudentJoinUrl`) |
| Connection / mic status indicators | ❌ | Not built |
| End Day transcript download (.txt) | ❌ | `fullTranscript` + subtitles in archive schema; export button not built |
| Day switcher on main UI | ✅ | **Removed** — End Day advances; see concerns §8 |

### C. Display (`/display` for OBS)

| Item | Status | Notes |
|------|--------|-------|
| idle | ✅ | Light theme; shows week + day topic |
| wordcloud | ✅ | Light theme |
| question | ✅ | “The room is asking” + vote count |
| quote | 🟡 | Light theme; no presenter button (code only) |
| stats | ❌ | Removed from DisplayView |
| join (QR) | ❌ | Use OBS **Desktop** scene instead |
| slide | ❌ | Use OBS **Keynote** scene instead |
| Light theme consistent | ✅ | All active modes use `#F7F5F2` |

### D. Backend & live wiring

| Item | Status | Notes |
|------|--------|-------|
| MockSessionProvider | ❌ | **Removed** — app requires Supabase env or shows setup screen |
| SupabaseSessionProvider | ✅ | `lib/session/supabase-provider.tsx`; realtime on questions, display, slides, reactions |
| Supabase schema + RLS | 🟡 | SQL in `supabase/migrations/` — run on your Supabase project |
| Anonymous auth on join | ✅ | `ensureSupabaseAuth()` on session load |
| `POST /api/claude/correct` | ❌ | Stub |
| `POST /api/claude/notes` | ❌ | Stub |
| `POST /api/translate` | ❌ | Stub |
| Web Speech → Supabase pipeline | ❌ | `lib/speech.ts` wrapper only |
| `GET /api/slides` | ✅ | Scans **`public/slides/*.png`** only (flat deck); sorts by trailing `.NNN.png` number |
| Slide sync row (`day_slides`) | 🟡 | Uses **`SLIDE_SYNC_DAY = 1`** for deck position (Keynote slide #), not per teaching-day folders |
| slide-bridge.js | ✅ | `npm run slide-bridge` — Keynote AppleScript → `day_slides` (`day = SLIDE_SYNC_DAY`) |
| Slide PNGs in repo / deploy | ✅ | **178 PNGs** in `public/slides/` (`Reoganland June 2025.*.png`); **Vercel serves 178** via `/api/slides` after deploy `6c8e210` |
| End Day → archive to Supabase | ❌ | Mock week tab only; includes `subtitles` + `fullTranscript` when live |
| End Day transcript export | ❌ | Download `.txt` / `.md` from presenter after archive (§10 Step 11.5) |
| Pause stops speech + AI pipelines | ❌ | Status toggles only (mock) |

### E. Production environment (your Mac / room)

| Item | Status | Notes |
|------|--------|-------|
| OBS scenes configured (6) | ❌ | You — see instruction manual |
| OBS WebSocket enabled | ❌ | You — one-time |
| Zoom → OBS Virtual Camera | ❌ | You — one-time |
| Keynote dual-display (slides on external) | ❌ | You — one-time |
| Lapel mic + AirPods output | ❌ | You — per session |
| Vercel deploy + env vars | 🟡 | **App deployed** at sphere-notes-live.vercel.app — confirm Supabase keys + `NEXT_PUBLIC_APP_URL` in Vercel dashboard |
| Phase 0 mock dry-run | 🟡 | Supabase-backed session; OBS on Mac is your next step |

---

## 3. Roadmap to fully functioning live presentation

### Phase 0 — Room rehearsal (UI + OBS) ← **you are here**

**Goal:** Learn UI + OBS layout; slides on production Vercel.

- [x] Presenter UI: Go Live, projector section, OBS bar, **student join QR**
- [x] Settings modal: week/day topics, slide refresh → **`public/slides/`**
- [x] Full Keynote deck exported → **`public/slides/`** (178 PNGs, committed)
- [x] Instruction manual + this doc
- [x] Student responsive layout (phone bottom tabs / desktop top nav)
- [x] Slides tab UX: follow current slide, viewport-fit, subtitles overlay, fullscreen
- [x] Mine notes toolbar + word cloud mock simulation
- [x] **Vercel production** — sphere-notes-live.vercel.app (presenter + student + `/api/slides`)
- [ ] Read [Instruction Manual](./instruction-manual.md) Part 3
- [ ] Phone (any network): Vercel student URL → **Slides** after ⚙ **Refresh** on presenter
- [ ] Commit **date picker** work (`TopicEditor`, `lib/dates/sessionDate.ts`) when ready
- [ ] Push **slide-bridge.js** full implementation when ready to test Keynote auto-sync
- [ ] Configure 6 OBS scenes on Mac
- [ ] Practice: iPad `/presenter` → Connect OBS → switch scenes
- [ ] Practice: Word cloud / question → OBS SphereNotes
- [ ] Log friction in §5 dry-run table

**Exit criteria:** iPad presenter + phone on **Vercel** + OBS `/display`; slides load after Refresh (Supabase env required).

---

### Phase 1 — Infrastructure ← **partially done**

- [x] Supabase schema SQL in `supabase/migrations/` (run on your project)
- [x] `SupabaseSessionProvider` — required when env vars set
- [x] Student: `?event=&day=` drives subscribed day; presenter join QR uses `current_day`
- [x] Anonymous auth on session load
- [x] Vercel deploy (app live)
- [ ] Confirm all env vars on Vercel match `.env.local`
- [ ] Full multi-device sync test (Go Live, display, reactions, Q&A)

**Exit criteria:** Two phones + iPad show same Go Live / Pause state on **production URL**.

---

### Phase 2 — Slides ← **partially done**

- [x] Export Keynote → **`public/slides/`** (full deck — 178 PNGs; Keynote `.001.png` names OK)
- [x] `GET /api/slides` — flat folder; sort by `.NNN.png` suffix
- [x] Commit PNGs + push (`d3ab3f2`, `6c8e210`)
- [x] Deploy to Vercel — `/api/slides` returns **178** on production
- [x] Presenter ⚙ Refresh + manual prev/next writes `day_slides` (`SLIDE_SYNC_DAY`)
- [x] **`slide-bridge.js`** on `main` — run on Mac during slideshow
- [ ] Verify phone Slides tab follows Keynote without manual ⚙ step (you test in room)

**Exit criteria:** Advance Keynote on Mac; slide updates on phone within ~3s.

---

### Phase 3 — Speech, subtitles & translation

**Subtitle speed rule (locked 1 Jun):** Students see text **immediately** from Web Speech interim/final results. English gets Claude correction **in the background** (swap when ready). **Translations use raw speech** — do not wait for Claude. Rest of app stays English; only Live tab + Slides captions translate.

- [ ] Build `/presenter/speech` on Mac Chrome (mic → Web Speech — swappable ASR; see §10 Step 13)
- [ ] Push interim + final lines to Supabase `speech` / `subtitles` in real time
- [ ] Accumulate `fullTranscript` in `SpeechState` as session runs
- [ ] Wire `POST /api/claude/correct` — async on **final** English chunks only
- [ ] Wire `POST /api/translate` — on **raw** text when student locale ≠ `en` (parallel, not post-Claude)
- [ ] Student Live tab + Slides captions subscribe to subtitle stream
- [ ] Word cloud from transcript tokens (replace mock tick — see §10 Step 8)

---

### Phase 4 — AI notes & session map

- [ ] Claude notes API; scripture JSON; session map

---

### Phase 5 — Presenter polish

**Partially done — remaining:**

- [x] iPad touch layout + 6 OBS WebSocket buttons
- [x] Push question to `/display` (Show + Top question)
- [x] `/display` question mode + light theme
- [x] Settings modal: editable week/day topic + date (localStorage)
- [x] Session controls inline in presenter header (Go Live / Pause / End Day)
- [x] Student Slides tab polish (viewport-fit, fullscreen, subtitle overlay)
- [ ] `/presenter/setup` or expand settings: mic test, Supabase health checks
- [x] Student join QR + link on presenter dashboard
- [ ] Q&A pin / archive
- [ ] Optional: pull quote button; reactions snapshot on projector
- [ ] Day selection via URL (not only End Day advance)

---

### Phase 6 — Q&A, reactions, archive (live)

- [ ] Live Q&A vote dedup + reactions
- [ ] End Day → `DayArchiveSnapshot` (subtitles, questions, notes, wordcloud, sessionMap, slides, `fullTranscript`)
- [ ] Presenter **Download transcript** — `.txt` or `.md` after End Day (§10 Step 11.5)

### Phase 7 — Rehearsal & polish

- [ ] Full dry-run (§5) including transcript download check
- [ ] **Optional:** ASR upgrade to Deepgram if Web Speech accuracy insufficient (§10 Step 13 — only after one real rehearsal)

---

## 4. Session state rules (locked)

| Status | Subtitles / AI / cloud | Slides | Q&A | Reactions |
|--------|------------------------|--------|-----|-----------|
| `waiting` | Off | Preview OK | Blocked | Blocked |
| `live` | On | On | On | On |
| `paused` | Frozen (speech **stopped** on Mac when live) | Still sync | Blocked | Blocked |
| End Day → `waiting` | Reset for next day | — | — | Archive written (when live) |

---

## 5. Dry-run script

| # | Step | Mock | Live |
|---|------|------|------|
| 1 | iPad `/presenter` → Go Live | ☐ | ☐ |
| 2 | Phone `/student` → LIVE badge | ☐ | ☐ |
| 3 | iPad OBS → Connect (Mac IP, password) | ☐ | ☐ |
| 4 | OBS Keynote → external monitor shows slides | ☐ | ☐ |
| 5 | Show on projector → Word cloud → OBS SphereNotes | ☐ | ☐ |
| 6 | Phone Q&A → iPad **Show** on question → SphereNotes | ☐ | ☐ |
| 7 | Mac Zoom → classroom camera visible | ☐ | ☐ |
| 8 | Pause → Q&A blocked | ☐ | ☐ |
| 9 | Mac `/presenter/speech` listening | n/a | ☐ |
| 10 | slide-bridge → phone slide updates | n/a | ☐ |
| 11 | Speak → subtitles + word cloud | n/a | ☐ |
| 12 | End Day → Week archive | ☐ | ☐ |
| 13 | Presenter → Download transcript (.txt) | n/a | ☐ |

**Friction log:**

| Step | Issue | Fix |
|------|-------|-----|
| | | |

---

## 6. Document map

| Document | Purpose | Trust level |
|----------|---------|-------------|
| **This file** | Spec + tracker + roadmap | **Primary** |
| [instruction-manual.md](./instruction-manual.md) | How to run a session | **Primary** |
| [pre-backend-design.md](./pre-backend-design.md) | Early design reference | **Stale in places** — see §8 |
| `SphereNotesLive-DesignBrief.md` | Visual design | Current for UI |
| `SphereNotesLive-PRD-v1.0.docx` | Original PRD | **Historical only** |
| `README.md` | Dev quick start | Current |

---

## 7. When you change something

1. Update **this file** (tracker + roadmap).
2. Update **instruction-manual.md** if it affects how you run a session.
3. Do **not** rely on the Word PRD or stale sections of pre-backend-design alone.

---

## 8. Concerns & mismatches (review before next session)

Read these before building backend or running a real class.

| # | Concern | Severity | Detail |
|---|---------|----------|--------|
| 1 | **Mock doesn’t sync across devices** | High | Go Live on iPad does not update a phone on another browser until Supabase (Phase 1). Same for projector `/display` if opened on Mac vs iPad session state. |
| 2 | **No `/presenter/speech` yet** | High | Live subtitles, word cloud, and AI notes cannot work without this Mac tab. |
| 3 | **4 days in app vs 5-day deck** | Medium | You mentioned a **5-day** PowerPoint; code has `totalDays: 4`. Confirm event length and update `defaultMeta.totalDays` if needed. |
| 4 | **No day picker** | Medium | Main UI only **End Day** advances `currentDay`. To jump to Day 3 without walking through End Day twice, you need URL param (Phase 1) or a settings control — not built. |
| 5 | **TopicEditor “syncs to phones”** | Medium | Copy in settings modal is **aspirational** — titles persist in **presenter browser localStorage** only until Supabase. Student on same device/tab sees updates; another phone does not. |
| 6 | **OBS Connect requires LAN** | Medium | iPad must reach `ws://MAC-IP:4455`. Presenter on Vercel URL still works for SphereNotes, but OBS buttons need Mac IP on same Wi‑Fi. |
| 7 | **`pre-backend-design.md` stale** | Low | Still mentions Pre-Show QR, stats on projector, `slide-001.png` naming. Use **this file** instead. |
| 8 | **Pull quotes / stats dropped** | Low | Intentional UX simplification. Display code still has `quote` mode; `stats` removed. Re-add only if you want them. |
| 9 | **Slides: Keynote vs phones** | High for live slides | **PNG loading fixed** on Vercel (flat `public/slides/`). **slide-bridge** still stub on `main` — manual ⚙ prev/next or bridge needed for Keynote auto-follow. |
| 10 | **Deck vs teaching day** | Medium | One PNG folder for the **whole event**; `day_slides.day = 1` (`SLIDE_SYNC_DAY`) stores Keynote position only. Teaching days 1–4 are topics/Q&A/archive — not separate slide folders. |
| 11 | **End Day in mock** | Low | Advances day in presenter localStorage only; student week archive is mock data, not tied to your live End Day click on another device. |
| 12 | **Manual slide step vs Keynote** | Medium | ⚙ Settings slide prev/next updates session state for preview only — not wired to Keynote or student phones across devices. |
| 13 | **Uncommitted date-picker work** | Low | `TopicEditor` date input + `lib/dates/sessionDate.ts` modified but not committed. |
| 14 | **README vs responsive UI** | Low | README still says “resize browser to 390px”; app is full-width with bottom tabs on phone — update README when convenient. |
| 15 | **Slides tab subtitles ≠ live speech** | Medium | Overlay shows **mock** subtitle lines from fixtures, not Mac transcription. Live tab is the intended home for real subtitles (Phase 3). |
| 16 | **PDF ≠ slide sync** | Medium | App only serves **PNG** from `public/slides/`. Export Keynote → Images, or convert PDF → PNG sequence first. |
| 17 | **Fullscreen + session ticks** | Low (fixed) | Word cloud mock tick re-rendered parent every ~2.8s and exited fullscreen — fixed. Watch for similar patterns in new code. |
| 18 | **Supabase required** | High | No mock fallback — set keys in `.env.local` / Vercel or app shows setup screen. Run `supabase/migrations/*.sql` on your project. |
| 20 | **QR from localhost** | Medium | Set `NEXT_PUBLIC_APP_URL` to production URL when generating join links from dev machine. |
| 19 | **Otter / Granola not in stack** | Low (decision locked) | Personal meeting transcribers — no live push to student phones. Use in-app archive + transcript download instead. Upgrade ASR via Deepgram (§10 Step 13) if needed — not a second parallel app. |

---

## 9. Changelog

### Session 1 (1 Jun 2026 — morning)

| Change |
|--------|
| Pre-backend design doc + instruction manual created |
| Locked 3-screen layout: iPad / MacBook / external monitor |
| OBS: Desktop replaces Pre-Show QR; 6 scenes in app |
| Built OBS WebSocket bar on `/presenter` |
| Simplified presenter: removed day switcher, stats, quote buttons from projector |
| Added question **Show** + **Top question** + `/display` question mode |
| **Editable week topic, day topic, date** — localStorage; student header, `/display` idle, week archive |
| **`GET /api/slides`** — any `.png` in `public/slides/day-{n}/`; Keynote names OK |
| **⚙ Settings modal** — topics + slide refresh/preview off main screen |
| Day 1 Keynote exported: 18 PNGs → `public/slides/day-1/` (local; not committed) |
| Display idle/light theme unified |

### Session 2 (1 Jun 2026 — late)

| Change |
|--------|
| **5-tab student nav** locked: Live · Q&A · Slides · Notes · Week (Notes sub-nav: auto / mine / cloud / overview) |
| **Responsive shell:** bottom tabs (phone), top nav (md+), full width, `h-dvh` overflow hidden |
| **Slides tab:** current slide only — no thumbnails, count, or prev/next |
| Slide fills **95% of content height** (height-driven sizing); no page scroll |
| Subtitles: controls **top-right**; caption text **bottom** when on (mock data) |
| **Slide fullscreen** view + fix for auto-exit after ~3s (session re-render / effect deps) |
| Presenter: Go Live / Pause / End Day **inline in header** |
| Mine notes: format toolbar; cloud clippings as JPEG snapshots |
| Word cloud: mock growth while live; session / 5 min filter |
| Session context: hydration fix (localStorage after mount, default Day 1) |
| Mock slide placeholders: full-bleed SVG (no inset card padding) |

### Session 3 (1 Jun 2026 — end of day)

| Change |
|--------|
| **Date field:** native `<input type="date">` + **Today** button in ⚙ Settings (`lib/dates/sessionDate.ts`) |
| Docs end-of-session review; **backend checklist** added (§10) |
| Confirmed: Day-1 PNGs + docs **committed and pushed** (`922701a`, `27deef5`, `24eae03`) |
| Locked **instant subtitle** rule: raw/interim first; Claude corrects English async; translate raw (not corrected) |

### Session 4 (1 Jun 2026 — transcript + ASR decisions)

| Change |
|--------|
| **End Day transcript download** added to roadmap (§10 Step 11.5, Phase 6, dry-run #13) |
| **ASR upgrade path** documented — Deepgram optional after rehearsal (§10 Step 13) |
| **Otter / Granola explicitly excluded** — not compatible with live student broadcast; use in-app archive instead |

### Session 5 (2 Jun 2026 — slides + production)

| Change |
|--------|
| **Supabase live session** on `main` (`2709d1d`) — `SupabaseSessionProvider`, migrations, join URLs, realtime Q&A |
| **Full deck PNGs** committed — 178 files in `public/slides/` (`d3ab3f2`) |
| **Flat slide folder** — `discoverSlides()` scans `public/slides/*.png` only; removed `day-{n}/` paths (`6c8e210`) |
| **`GET /api/slides`** — no `?day=` param; sorts by Keynote `.NNN.png` suffix |
| **Slide sync** — `SLIDE_SYNC_DAY` in `lib/slides/constants.ts`; `day_slides` row uses day `1` for deck position across teaching days |
| **Presenter UI** — settings copy points to `public/slides/`; placeholder SVG updated |
| **Vercel production** — https://sphere-notes-live.vercel.app — `/api/slides` returns 178 after deploy |
| **Docs** — production URL table; Phase 0/1/2 progress updated |
| **`slide-bridge.js`** pushed — `npm run slide-bridge` on Mac during Keynote Play |

---

## 10. Backend implementation checklist

**Read this before your next build session.** Order matters — each step depends on the one above.

Legend: **You** = your Mac / accounts · **Build** = code to write · **Test** = verify before moving on

### Step 0 — Accounts & API keys **(You, one-time)**

| # | Action | Notes |
|---|--------|-------|
| 0.1 | Create **Supabase** project | Free tier OK for event |
| 0.2 | Get **Anthropic** API key | Claude Haiku for correction + notes |
| 0.3 | Enable **Google Cloud Translation** API + key | NMT for live subtitles only |
| 0.4 | Connect repo to **Vercel** | Import from GitHub |
| 0.5 | Add env vars locally (`.env.local`) **and** on Vercel | See Step 1.4 |

### Step 1 — Supabase foundation **(Build + You)**

| # | Action | Detail |
|---|--------|--------|
| 1.1 | `npm install @supabase/supabase-js` | ✅ In `package.json` |
| 1.2 | `lib/supabase/client.ts` | ✅ Browser client with anon key |
| 1.3 | Run schema SQL | ✅ `supabase/migrations/001_initial_schema.sql` + `002_questions_realtime.sql` — run on your Supabase project |
| 1.4 | Set RLS policies | Students: read session, write own votes/reactions/questions. Presenter: write meta/display/status. Service role for slide-bridge + server routes only |
| 1.5 | Env vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server + slide-bridge only), `ANTHROPIC_API_KEY`, `GOOGLE_TRANSLATE_API_KEY` |
| 1.6 | Build `SupabaseSessionProvider` | ✅ `lib/session/supabase-provider.tsx` — app requires env or setup screen |
| 1.7 | ~~Keep mock flag~~ | **Removed** — use Supabase for all sessions |
| **Test** | Two browsers: Go Live on iPad presenter → phone shows LIVE | Also: week/day topic edits appear on both |

### Step 2 — URL join & anonymous auth **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 2.1 | Wire `?event=biblical-worldview-2026&day=N` on `/student` | Subscribe to that event/day in Supabase — not presenter localStorage |
| 2.2 | Silent **Supabase Anonymous Auth** on student load | Enables vote dedup via `voters/{uid}` |
| 2.3 | Presenter join QR + link on `/presenter` | ✅ `PresenterJoinPanel` — set `NEXT_PUBLIC_APP_URL` for production QR |
| **Test** | Phone opens link → correct day, can vote once per question |

### Step 3 — Multi-device session sync **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 3.1 | Sync `status` (waiting/live/paused), `meta`, `display`, `questions`, `reactions` | iPad presenter writes; phones + `/display` subscribe |
| 3.2 | `/display` reads Supabase display state | So OBS browser source matches iPad “Show on projector” even on different devices |
| **Test** | iPad Go Live → phone LIVE badge. iPad Show question → Mac `/display` updates |

### Step 4 — Slide PNGs on production **(You + Build)** ← **mostly done**

| # | Action | Detail |
|---|--------|--------|
| 4.1 | Full deck in git | ✅ `public/slides/*.png` (178 files) |
| 4.2 | **Deploy to Vercel** | ✅ sphere-notes-live.vercel.app |
| 4.3 | Re-export Keynote when deck changes | Replace/add PNGs in **`public/slides/`** — commit + push + ⚙ Refresh |
| 4.4 | `GET /api/slides` | ✅ Flat scan; production returns 178 |
| **Test** | Phone on cellular → Vercel student URL → **Slides** shows real PNGs after presenter ⚙ Refresh |

### Step 5 — Keynote slide-bridge **(Build + You)**

**Goal:** Advance Keynote on Mac → phone Slides tab updates within ~3s.

| # | Action | Detail |
|---|--------|--------|
| 5.1 | Implement `scripts/slide-bridge.js` | ✅ On `main` |
| 5.2 | AppleScript poll Keynote every **2s** | ✅ `SLIDE_BRIDGE_POLL_MS` optional |
| 5.3 | Write to Supabase `day_slides` | ✅ `day = SLIDE_SYNC_DAY` (1), `current` via service role PATCH |
| 5.4 | Grant Mac **Automation** permission | System Settings → Privacy → Automation: allow Terminal/Node to control Keynote |
| 5.5 | Run before each session | `npm run slide-bridge` — reads `.env.local` |
| 5.6 | Student app subscribes to slide state | Already reads `slides.current` — wire to Supabase |
| **Test** | Advance Keynote → phone slide image changes without manual ⚙ prev/next |

**AppleScript core (reference):**

```applescript
tell application "Keynote"
  if not (exists front document) then return "0|0"
  if playing is false then return "0|0"
  set n to slide number of current slide of front document
  set t to count of slides of front document
  return (n as text) & "|" & (t as text)
end tell
```

### Step 6 — Speech bridge `/presenter/speech` **(Build + You)**

**Goal:** Mac mic → subtitles on all student phones in real time.

| # | Action | Detail |
|---|--------|--------|
| 6.1 | Create `app/presenter/speech/page.tsx` | MacBook Chrome only — not iPad |
| 6.2 | Use `lib/speech.ts` `SpeechRecognizer` | `continuous: true`, `interimResults: true`, lang `en-US` |
| 6.3 | Mac audio: lapel mic as **default input** | Same mic as Zoom (see instruction manual Part 2D) |
| 6.4 | On **interim/final** result → write to Supabase immediately | Path: `speech` + append to `subtitles` list with `{ id, textEn, translations: {}, isCurrent }` |
| 6.5 | Start listening when session status = `live`; **stop** on `paused` / `waiting` | Call `SpeechRecognizer.pause()` on pause — no break chatter |
| 6.6 | Presenter UI: mic status, connection indicator, error retry | Red banner on Web Speech errors |
| **Test** | Speak on Mac → student Live tab shows lines within ~1s (raw English OK) |

### Step 7 — Instant English correction **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 7.1 | Implement `POST /api/claude/correct` | Claude Haiku; optional dictionary from Keynote notes export |
| 7.2 | On **final** speech chunk only → call correct API **async** | Do **not** block subtitle display |
| 7.3 | When correction returns → update same subtitle line in Supabase | Student UI swaps text in place |
| **Test** | Say a deliberate mis-hear → raw appears instantly → corrected version replaces within ~5–15s |

### Step 8 — Instant translation **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 8.1 | Implement `POST /api/translate` | Google Cloud Translation NMT |
| 8.2 | When student picks non-English locale → translate **raw** `textEn` | Parallel requests per locale; **not** post-Claude |
| 8.3 | Store in `subtitle.translations[locale]` | Live tab + Slides caption overlay read this |
| 8.4 | Debounce/cache identical phrases | Reduce API cost |
| **Test** | Student picks Spanish → sees Spanish within ~1–2s of English raw appearing |

### Step 9 — Live word cloud **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 9.1 | Tokenize incoming transcript | Reuse `lib/wordcloud/simulation.ts` (`tokenize`, `categorize`, `buildSpeechPool`) |
| 9.2 | Increment word counts in Supabase `wordcloud` | On each final speech chunk (or every N seconds) |
| 9.3 | Student Notes → Cloud tab + `/display` wordcloud subscribe | Replace mock ~2.8s tick growth |
| 9.4 | **Pause** freezes cloud | No new tokens while paused |
| **Test** | Speak “Kingdom”, “Scripture” repeatedly → words grow on phone + projector word cloud |

### Step 10 — AI notes & session map **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 10.1 | Implement `POST /api/claude/notes` | Every ~60s while live; scripture JSON bundled |
| 10.2 | Write note cards to Supabase `notes` | 7 card types already in UI |
| 10.3 | Session map segments | Tie notes to time/slide segments |
| **Test** | Teach 2 min → Auto notes tab gets new cards |

### Step 11 — Q&A, reactions, archive **(Build)**

| # | Action | Detail |
|---|--------|--------|
| 11.1 | Live Q&A submit/vote via Supabase | Vote dedup with anonymous uid |
| 11.2 | Presenter pin / archive questions | UI not built yet |
| 11.3 | Reactions increment live | Replace mock counts |
| 11.4 | **End Day** → snapshot to `archive` | Week tab reads real past days; includes `subtitles[]` + `fullTranscript` |
| 11.5 | **Download transcript** on presenter | After End Day: button → `.txt` or `.md` file with day topic, date, timestamped subtitle lines, and full corrected transcript. Route: `GET /api/archive/{eventId}/{day}/transcript` or client-side blob from archive |
| **Test** | End Day → Week tab shows archive → Download transcript opens valid `.txt` file |

### Step 12 — Production rehearsal **(You)**

| # | Action |
|---|--------|
| 12.1 | Configure 6 OBS scenes (instruction manual Part 2B) |
| 12.2 | OBS WebSocket enabled; iPad Connect green |
| 12.3 | Keynote dual-display; slide-bridge running |
| 12.4 | Mac: Zoom + `/presenter/speech` + Keynote notes |
| 12.5 | iPad: `/presenter` Home Screen |
| 12.6 | Run dry-run script (§5) — log friction |
| 12.7 | After End Day → **Download transcript** and spot-check against what students saw |

### Step 13 — ASR upgrade path (optional — after rehearsal)

**When:** Only if a real session shows Web Speech is too inaccurate for names/theology terms **even after** Claude correction. Do not add Otter or Granola — they do not feed the live student pipeline.

**Default (MVP):** Web Speech API in Chrome — free, interim results, already in `lib/speech.ts`.

| # | Action | Detail |
|---|--------|--------|
| 13.1 | Abstract ASR behind one interface | e.g. `lib/speech/provider.ts` — `start()`, `onInterim()`, `onFinal()`, `stop()`; Web Speech and Deepgram both implement it |
| 13.2 | Add Deepgram streaming SDK | `@deepgram/sdk` — WebSocket from `/presenter/speech` |
| 13.3 | Env var toggle | `SPEECH_PROVIDER=webspeech` (default) or `deepgram`; `DEEPGRAM_API_KEY` when upgraded |
| 13.4 | Same downstream pipeline | Interim/final chunks still → Supabase → Claude correct → translate → word cloud — **only the mic→text engine changes** |
| 13.5 | Cost estimate | ~$0.0043/min (Deepgram Nova) — ~$0.26 for a 60 min session |
| **Test** | Side-by-side: same 5 min teaching clip — compare Web Speech + Claude vs Deepgram + Claude on name/theology terms |

**Not recommended:** Running Otter/Granola in parallel for a “better personal record” — duplicate systems, transcript won’t match what students saw, extra cost and session-day complexity.

### Dependency map

```
Step 0 (keys)
  └─► Step 1 Supabase
        ├─► Step 2 URL + auth
        ├─► Step 3 session sync
        ├─► Step 5 slide-bridge ──► needs Step 1
        ├─► Step 6 speech ──► needs Step 1 + 3 (live status)
        │     ├─► Step 7 Claude correct
        │     ├─► Step 8 translate
        │     └─► Step 9 word cloud
        ├─► Step 10 AI notes
        └─► Step 11 Q&A / archive
Step 4 Vercel deploy (can parallel Step 1)
Step 12 rehearsal (after 1–11)
Step 13 ASR upgrade (optional — after 12, if Web Speech fails rehearsal)
```

---

*SphereNotes Live · nathanielbaldock.com*

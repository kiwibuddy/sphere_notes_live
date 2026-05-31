# SphereNotes Live — Source of Truth

**Last updated:** 1 June 2026 (late session — student slides UX, responsive layout, fullscreen fix)  
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
| **Student phones** | `/student?event=…&day=…` (URL params **not wired yet** — mock uses localStorage) |
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
| Speech | Web Speech API — **Chrome on Mac only** (`/presenter/speech` — planned) |
| Slides | Keynote → PNG in `public/slides/day-{n}/` + **`slide-bridge.js`** on Mac |
| OBS remote | WebSocket v5 from iPad browser → Mac OBS (LAN only) |
| Auth | **Supabase Anonymous Auth** on student join (for vote dedup) — planned |
| Bible text | **Bundled JSON** (KJV + BSB) |
| Hosting | Vercel |

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
| Student join via URL `event` + `day` | ❌ | Day/session not URL-driven yet |
| Session hydration | ✅ | localStorage restored after mount (no Day 1/3 SSR mismatch) |

### B. Presenter app

| Item | Status | Notes |
|------|--------|-------|
| `/presenter` dashboard | 🟡 | Go Live / Pause / End Day in header; projector + questions; settings gear |
| Session settings modal (⚙ gear) | ✅ | Week topic, day topic, date; slide folder hint, refresh PNGs, manual slide step (test) |
| `/presenter/setup` full checklist | ❌ | Partially replaced by settings modal — no mic/Supabase/QR checks yet |
| `/presenter/speech` (Mac speech bridge) | ❌ | **Required for live** — not built |
| iPad-friendly touch layout | 🟡 | Large projector + OBS buttons; session controls in header |
| OBS WebSocket remote (6 buttons) | ✅ | Bottom bar; Connect + Mac IP + password; scene name overrides |
| Push question to `/display` | ✅ | Per-question **Show** + **Top question** shortcut |
| Q&A pin / archive | ❌ | Not built |
| Pull quote on projector | ❌ | Removed from UI (display still supports `quote` mode in code) |
| Stats / reactions on projector | ❌ | Removed from UI by design — optional later |
| Correction dictionary UI | ❌ | Not built |
| Student join QR + link on presenter | ❌ | Not built |
| Connection / mic status indicators | ❌ | Not built |
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
| MockSessionProvider | ✅ | Default for all routes |
| SupabaseSessionProvider | ❌ | Stub in `lib/supabase/client.ts` |
| Supabase schema + RLS | ❌ | Designed in `types/realtime.ts` |
| Anonymous auth on join | ❌ | Decision locked, not implemented |
| `POST /api/claude/correct` | ❌ | Stub |
| `POST /api/claude/notes` | ❌ | Stub |
| `POST /api/translate` | ❌ | Stub |
| Web Speech → Supabase pipeline | ❌ | `lib/speech.ts` wrapper only |
| `GET /api/slides` | ✅ | Scans `public/slides/day-{n}/*.png`; any filename; sorts by number (Keynote `.001.png` OK) |
| slide-bridge.js | ❌ | Stub only — Keynote does **not** auto-advance phone slides yet |
| Slide PNGs in repo / deploy | 🟡 | **18 PNGs on disk** for day-1 (`The_Kingdom_Blueprint.001.png` … `.018.png`); **not committed to git** as of this session |
| End Day → archive to Supabase | ❌ | Mock week tab only |
| Pause stops speech + AI pipelines | ❌ | Status toggles only (mock) |

### E. Production environment (your Mac / room)

| Item | Status | Notes |
|------|--------|-------|
| OBS scenes configured (6) | ❌ | You — see instruction manual |
| OBS WebSocket enabled | ❌ | You — one-time |
| Zoom → OBS Virtual Camera | ❌ | You — one-time |
| Keynote dual-display (slides on external) | ❌ | You — one-time |
| Lapel mic + AirPods output | ❌ | You — per session |
| Vercel deploy + env vars | ❌ | When backend ready |
| Phase 0 mock dry-run | 🟡 | App UI ready; OBS on Mac is your next step |

---

## 3. Roadmap to fully functioning live presentation

### Phase 0 — Use mock app confidently ← **you are here**

**Goal:** Learn UI + OBS layout with fake data.

- [x] Presenter UI: Go Live, projector section, OBS bar
- [x] Settings modal: week/day topics, slide refresh
- [x] Day 1 Keynote exported → `public/slides/day-1/` (18 PNGs, local)
- [x] Instruction manual + this doc
- [ ] Read [Instruction Manual](./instruction-manual.md) Part 3
- [ ] **Commit + push** slide PNGs (or they won’t exist on Vercel)
- [ ] Phone on same Wi‑Fi: open `/student/slides` after ⚙ Refresh slides
- [ ] Configure 6 OBS scenes on Mac
- [ ] Practice: iPad `/presenter` → Connect OBS → switch scenes
- [ ] Practice: Word cloud / question → OBS SphereNotes
- [ ] Log friction in §5 dry-run table

**Exit criteria:** Mock session on iPad + phone + OBS `/display` without API keys.

---

### Phase 1 — Infrastructure

- [ ] Supabase project + RLS per `types/realtime.ts`
- [ ] `SupabaseSessionProvider`; mock flag for local dev
- [ ] Student + presenter: `?event=&day=` drives session
- [ ] Anonymous auth on `/student` load
- [ ] Vercel deploy + env vars

**Exit criteria:** Two phones + iPad show same Go Live / Pause state.

---

### Phase 2 — Slides ← **partially started**

- [x] Export Keynote → `public/slides/day-{n}/` (Day 1 done — Keynote names OK)
- [x] `GET /api/slides` + student Slide tab loads PNGs (dev server; ⚙ Refresh)
- [ ] Commit PNGs + deploy to Vercel
- [ ] Implement `slide-bridge.js` (Keynote → auto slide number on phones)
- [ ] Multi-device slide sync via Supabase (Phase 1)

**Exit criteria:** Advance Keynote on Mac; slide updates on phone within ~3s.

---

### Phase 3 — Speech & subtitles

- [ ] Build `/presenter/speech` on Mac
- [ ] Web Speech → Supabase; Claude correct API
- [ ] Word cloud from transcript (not mock tick)

---

### Phase 4 — AI notes & session map

- [ ] Claude notes API; scripture JSON; session map

---

### Phase 5 — Presenter polish

**Partially done in this chat — remaining:**

- [x] iPad touch layout + 6 OBS WebSocket buttons
- [x] Push question to `/display` (Show + Top question)
- [x] `/display` question mode + light theme
- [x] Settings modal: editable week/day topic + date (localStorage)
- [ ] `/presenter/setup` or expand settings: mic test, Supabase, join QR/link
- [ ] Q&A pin / archive
- [ ] Optional: pull quote button; reactions snapshot on projector
- [ ] Day selection via URL (not only End Day advance)

---

### Phase 6 — Q&A, reactions, archive (live)

### Phase 7 — Rehearsal & polish

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
| 9 | **Slides: local vs live sync** | High for live slides | API + PNG loading work on dev server. **slide-bridge** still stub — manual prev/next in ⚙ settings is test-only. Keynote advance won’t update phones until bridge + Supabase. |
| 10 | **Day 1 PNGs not in git** | **High before deploy** | `public/slides/` is **untracked**. Slides won’t appear on Vercel or another machine until you `git add`, commit, and push (or re-export on deploy machine). |
| 11 | **End Day in mock** | Low | Advances day in presenter localStorage only; student week archive is mock data, not tied to your live End Day click on another device. |
| 12 | **Manual slide step vs Keynote** | Medium | ⚙ Settings slide prev/next updates session state for preview only — not wired to Keynote or student phones across devices. |

---

## 9. Changelog (this chat session)

| Date | Change |
|------|--------|
| 1 Jun 2026 | Pre-backend design doc + instruction manual created |
| 1 Jun 2026 | Locked 3-screen layout: iPad / MacBook / external monitor |
| 1 Jun 2026 | OBS: Desktop replaces Pre-Show QR; 6 scenes in app |
| 1 Jun 2026 | Built OBS WebSocket bar on `/presenter` |
| 1 Jun 2026 | Simplified presenter: removed day switcher, stats, quote buttons from projector |
| 1 Jun 2026 | Added question **Show** + **Top question** + `/display` question mode |
| 1 Jun 2026 | **Editable week topic, day topic, date** — persisted in localStorage; shown on student header, `/display` idle, week archive (same browser) |
| 1 Jun 2026 | **`GET /api/slides`** — discovers any `.png` in `public/slides/day-{n}/`; Keynote export names (e.g. `Presentation.001.png`) supported |
| 1 Jun 2026 | **⚙ Settings modal** — topics + slide refresh/preview moved off main presenter screen |
| 1 Jun 2026 | Day 1 Keynote exported: 18 PNGs → `public/slides/day-1/` (local disk; not yet committed) |
| 1 Jun 2026 | Display idle/light theme unified |

---

*SphereNotes Live · nathanielbaldock.com*

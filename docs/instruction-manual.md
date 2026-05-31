# SphereNotes Live — Instruction Manual

Simple steps for running a session.  
**Source of truth for what’s built vs planned:** [source-of-truth.md](./source-of-truth.md)

**Last updated:** 1 June 2026 (end-of-session — settings modal, slides API, Keynote export)

---

## Two modes

| Mode | When | What works |
|------|------|------------|
| **Mock mode** | **Now** — no API keys | Full UI with fake data; OBS remote; projector word cloud + questions |
| **Live mode** | After backend Phases 1–7 | Real speech, multi-device sync, AI notes, slide-bridge |

Live-only steps are marked **(LIVE)**.

---

## Part 1 — Your hardware layout

```
   iPad                          MacBook                      External monitor
┌─────────────┐              ┌─────────────────┐            ┌─────────────────┐
│ /presenter  │              │ Zoom (classroom)│            │ Keynote slides  │
│ Go Live     │              │ Keynote notes   │            │ (fullscreen)    │
│ Show on     │              │ /presenter/     │            │                 │
│  projector  │              │   speech (LIVE) │            │ OBS Keynote     │
│             │              └────────┬────────┘            │ captures this   │
│ 6 OBS btns  │                       │                     └────────┬────────┘
└──────┬──────┘                       ▼                              │
       │                         OBS on Mac ◄─────────────────────────┘
       │ OBS WiFi (ws://Mac-IP:4455)
       └──────────────────► Virtual Camera ──► Zoom ──► Projector

Student phones ──► /student  (NOT Zoom)
```

| Device | Role |
|--------|------|
| **iPad** | `/presenter` — session, projector content, **6 OBS buttons** (bottom) |
| **MacBook** | Zoom (see classroom) + Keynote presenter notes + **(LIVE)** `/presenter/speech` |
| **External monitor** | Keynote slideshow only |
| **Lapel mic** | Mac **input** (Zoom + transcription when live) |
| **AirPods** | Mac **output** (hear Zoom) — not as mic |
| **Logitech camera** | OBS **Camera** scene |

---

## Part 2 — One-time setup (Mac + OBS)

### A. Keynote

1. External monitor connected.
2. Keynote → **Settings → Slideshow**:
   - Present on: **external display**
   - Presenter display on: **MacBook**
3. **Export slides (mock or live):** Keynote → File → Export To → **Images** → PNG sequence into:
   ```
   public/slides/day-1/   (or day-2, day-3, day-4)
   ```
   Keynote names files like `The_Kingdom_Blueprint.001.png` — **that’s fine**; no need to rename to `slide-001.png`.
4. In app: `/presenter` → **⚙ Settings** → **Refresh** to pick up new PNGs.
5. **(LIVE)** Commit PNGs + `git push` → Vercel deploy so phones load slides from production URL.

### B. OBS — create 6 scenes

Names must match the app defaults (or rename in iPad OBS settings):

| Scene name | Source |
|------------|--------|
| **Desktop** | Display Capture → **MacBook screen** |
| **Title / Idle** | Browser → `/display` or static image (optional) |
| **Keynote** | Display Capture → **external monitor** |
| **Camera** | Video Capture → Logitech |
| **SphereNotes** | Browser → `/display` URL |
| **Keynote + PiP** | Keynote display + camera overlay (optional) |

**SphereNotes browser source:**

- URL: `http://localhost:3000/display` (rehearsal) or `https://your-app.vercel.app/display` (production)
- 1920 × 1080 · Shutdown when not visible: **Off** · Refresh on scene: **Off**

**WebSocket:** Tools → WebSocket Server Settings → Enable · password · port **4455**

**Before Zoom:** Start **Virtual Camera** in OBS.

### C. Zoom

- Video → **OBS Virtual Camera**
- Mic → **lapel**
- Turn **off** “Use dual monitors”
- Pin **classroom camera** on MacBook

### D. Mac audio

- Input: lapel · Output: AirPods (optional)

---

## Part 3 — Mock mode (practice now)

### Start

```bash
npm install
npm run dev
```

| Device | URL |
|--------|-----|
| iPad presenter | `http://YOUR-MAC-IP:3000/presenter` |
| Student phone | `http://YOUR-MAC-IP:3000/student` |
| OBS browser source | `http://localhost:3000/display` |

Add `/presenter` to iPad **Home Screen** for full-screen remote.

### Connect OBS from iPad

1. Open `/presenter` on iPad (same Wi‑Fi as Mac).
2. Bottom bar → expand **OBS scenes** settings.
3. Enter **Mac IP**, port **4455**, **WebSocket password**.
4. Tap **Connect** → green dot.
5. Tap scene buttons (Keynote, Camera, SphereNotes, …).

### Mock session flow

1. **⚙ Settings** (gear, top-right) — set **week topic**, **day topic**, **date**; tap **Refresh** if you added slide PNGs.
2. **Go Live** (header).
3. **Phone** → `http://YOUR-MAC-IP:3000/student` — LIVE badge *(same browser storage only until Supabase — see Part 9)*.
4. **Phone** → **Slide** tab — should show real PNGs after Refresh in settings *(same Wi‑Fi + dev server on Mac)*.
5. **Phone** — browse tabs; submit/vote Q&A while live.
6. **Show on projector:**
   - **Word cloud** — then OBS **SphereNotes**
   - Or **Show** on a specific question — then OBS **SphereNotes**
   - **Top question** — shortcut for highest votes
7. **OBS Keynote** — room sees slides on external monitor.
8. **Pause** — Q&A blocks on phone (mock).
9. **End Day** — advances presenter day counter.

### What works in mock vs what doesn’t

| Works now | Does not work yet |
|-----------|-------------------|
| Presenter UI, Go Live / Pause / End Day | iPad Go Live **syncing** to student phone on another device |
| 6 OBS buttons (LAN + WebSocket) | `/presenter/speech`, real subtitles |
| Word cloud + question on `/display` | **slide-bridge** — Keynote auto-advance on phones |
| Question **Show** / **Top question** | Supabase, AI notes from your voice |
| ⚙ Settings: week/day topic, date, slide refresh | Topics syncing to **other people’s phones** (localStorage only) |
| Real PNG slides on Slide tab (Mac dev server + Refresh) | Student join QR on presenter |
| Manual slide prev/next in settings (preview/test) | Export PDF (My Notes) |

---

## Part 4 — Presenter page guide

### Header

| Control | Action |
|---------|--------|
| **Go Live** | Students can use live tabs *(when backend connected)* |
| **Pause** / **Resume** | Break; blocks Q&A |
| **End Day** | End session; advance to next day in app |
| **⚙ Settings** | Week topic, day topic, date; slide folder path; **Refresh** PNGs; manual slide step (test only) |
| **Student view** / **Open display** | Preview links |

There is **no Day 1–4 switcher** on the main screen — you run one day at a time. **End Day** moves to the next day.

### ⚙ Settings modal

Open from the **gear icon** (top-right). Not on the main teaching screen.

| Section | What to do |
|---------|------------|
| **Session topics** | Tap a field to edit week title, today’s topic, date. Saves automatically to this browser. |
| **Slides** | After Keynote export, tap **Refresh**. Use prev/next to **test** slide images — does not control Keynote. |

**Keynote export tip:** Files like `My_Talk.001.png` work. Put them in `public/slides/day-N/` matching today’s day number.

### Show on projector

Sets what `/display` shows. **Always pair with OBS SphereNotes** (except slides/camera — those use OBS Keynote/Camera).

| Button | Effect |
|--------|--------|
| **Word cloud** | Live word cloud on `/display` |
| **Top question** | Highest-voted question |
| **Clear** | Blank idle display |

### Questions list

Each question has **Show** → puts that exact question on `/display`. Active row shows **On screen**.

### OBS bar (bottom)

Six scenes — switches Mac OBS. Not the same as “Show on projector.”

**Teaching loop:** Keynote (OBS) → speak → optional Word cloud or Question (presenter + OBS SphereNotes) → back to Keynote.

---

## Part 5 — Live mode day-of **(when backend ready)**

### T−30 — Open

**Mac:** Keynote · OBS · Zoom · `/presenter/speech` · `slide-bridge.js` · `/display` in OBS  
**iPad:** `/presenter` (Home Screen) · Connect OBS

### T−15 — Checks

- [ ] PNGs for today’s day in repo / CDN (`public/slides/day-N/` — any `.png` names)
- [ ] **(mock now)** ⚙ Refresh slides on presenter after export
- [ ] slide-bridge running **(LIVE)**
- [ ] OBS Connect green on iPad
- [ ] **(LIVE)** Supabase connected
- [ ] **(LIVE)** Mic test on Mac speech tab
- [ ] Student link: `https://…/student?event=biblical-worldview-2026&day=N`

### During session

| Goal | Steps |
|------|--------|
| Slides | OBS **Keynote** |
| Your face | OBS **Camera** |
| Word cloud | Presenter **Word cloud** → OBS **SphereNotes** |
| Specific question | **Show** on question → OBS **SphereNotes** |
| Mac screen / welcome | OBS **Desktop** (mind privacy) |
| Break | **Pause** |
| End | **End Day** |

### Students (phones)

Live · Q&A · Notes · Slide · etc. — **Send to My Notes** via **+** on cards and lines.

*Personal notes stay on the device — not shared with you.*

---

## Part 6 — OBS quick reference

| Scene | Projector shows | When |
|-------|-----------------|------|
| **Keynote** | Slides (external monitor) | Most teaching |
| **Camera** | Your face | Intro, story |
| **SphereNotes** | `/display` content | Word cloud, questions |
| **Desktop** | MacBook screen | Welcome, troubleshooting |
| **Idle** | Optional title/waiting | Between segments |
| **PiP** | Slides + face | Optional |

**Keynote scene = external monitor only** — not your presenter notes on the MacBook.

---

## Part 7 — Troubleshooting

| Problem | Fix |
|---------|-----|
| OBS Connect fails | Same Wi‑Fi; WebSocket enabled; correct Mac IP + password |
| Scene button does nothing | Scene name in OBS must match app (check rename overrides) |
| Room sees presenter notes | OBS Keynote capturing MacBook — use **external display** |
| Phone not LIVE when iPad is | **Expected in mock** — need Supabase (Phase 1) |
| `/display` empty after question | Tap **Show** then OBS **SphereNotes** (not Keynote) |
| No subtitles | **(LIVE)** Open `/presenter/speech` on Mac Chrome |
| No slide images on phone | ⚙ **Refresh** on presenter; PNGs must exist in `public/slides/day-N/`; phone must hit same server (Mac IP dev or Vercel after deploy) |
| Slides don’t follow Keynote | **Expected** until `slide-bridge.js` + Supabase — room uses OBS Keynote; phones need bridge |
| Topics don’t update on student phone | **Expected in mock** if phone is a different browser — need Supabase (Phase 1) |
| Q&A won’t submit | Session not live, or paused |

---

## Part 8 — URLs

| Role | Mock | Live |
|------|------|------|
| Presenter (iPad) | `http://MAC-IP:3000/presenter` | `https://…/presenter` |
| Student | `http://MAC-IP:3000/student` | `https://…/student?event=…&day=N` |
| Speech (Mac) | — | `https://…/presenter/speech` **(not built)** |
| Display (OBS) | `http://localhost:3000/display` | `https://…/display` |

---

## Part 9 — Before you close for the day

1. Skim [source-of-truth.md §8](./source-of-truth.md#8-concerns--mismatches-review-before-next-session) — open concerns.
2. If you exported slides today: **`git add public/slides/`** and commit (otherwise they exist only on this Mac).
3. Note any friction in the dry-run table (source-of-truth §5).
4. Next build priority: **Phase 1 Supabase** so iPad + phones actually sync (topics, Go Live, slides).

### End-of-session flags (1 Jun 2026)

| Flag | Action |
|------|--------|
| **18 Day-1 PNGs untracked** | Commit before deploy or phones on Vercel won’t see slides |
| **Mock = one browser** | Go Live, topics, slide number don’t sync iPad ↔ phone until Supabase |
| **slide-bridge missing** | Room slides = OBS Keynote; phone Slide tab ≠ live Keynote position |
| **4 days in code** | Confirm if your event is 4 or 5 days — update `totalDays` if needed |
| **No day jump** | Can’t skip to Day 3 without End Day twice (or future URL param) |

---

## Part 10 — Related docs

- [source-of-truth.md](./source-of-truth.md) — tracker + roadmap + concerns
- [README.md](../README.md) — dev install
- [SphereNotesLive-DesignBrief.md](../SphereNotesLive-DesignBrief.md) — visual design

---

*SphereNotes Live · nathanielbaldock.com*

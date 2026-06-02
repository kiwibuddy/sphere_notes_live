# SphereNotes Live — Instruction Manual

Simple steps for running a session.  
**Source of truth for what’s built vs planned:** [source-of-truth.md](./source-of-truth.md)

**Last updated:** 1 June 2026 (transcript export + ASR upgrade path)

---

## Two modes

| Mode | When | What works |
|------|------|------------|
| **Mock mode** | **Now** — no API keys | Full UI with fake data; OBS remote; projector word cloud + questions; real PNG slides on dev server |
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
3. **Export slides:** Keynote → File → Export To → **Images** → PNG sequence into:
   ```
   public/slides/
   ```
   One **flat folder** for the full deck (e.g. `Reoganland June 2025.001.png`). Keynote `.001.png` names are fine — no `day-1/` subfolders.
   
   **PDF files do not work** — the app only loads `.png`. Export from Keynote → Images, or convert your PDF to a PNG sequence first.
4. In app: `/presenter` → **⚙ Settings** → **Refresh** to pick up new PNGs.
5. **Deploy:** Push to GitHub → Vercel redeploys. Production: **https://sphere-notes-live.vercel.app**

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

- URL: `http://localhost:3000/display` (rehearsal) or `https://sphere-notes-live.vercel.app/display` (production)
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

**Student layout:** On phone, tabs are at the **bottom** (Live · Q&A · Slides · Notes · Week). On tablet/desktop, tabs move to a **top bar** under the header. The app is full width — no phone frame.

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
4. **Phone** → **Slides** tab — shows **current slide only** (follows presenter slide # via Supabase `day_slides`). Tap **fullscreen** (top-right). Toggle **captions** for mock subtitles. After ⚙ **Refresh** on presenter, PNGs load from `public/slides/` (178 on production after Jun 2026 deploy).
5. **Phone** — browse tabs; submit/vote Q&A while live.
6. **Show on projector:**
   - **Word cloud** — then OBS **SphereNotes**
   - Or **Show** on a specific question — then OBS **SphereNotes**
   - **Top question** — shortcut for highest votes
7. **OBS Keynote** — room sees slides on external monitor.
8. **Pause** — Q&A blocks on phone (mock).
9. **End Day** — advances presenter day counter.

### Slides tab (student)

| Element | Location | Notes |
|---------|----------|-------|
| Current slide | Centre | Fills ~95% of space below nav; no thumbnails or slide counter |
| Language + captions + fullscreen | Top-right | Captions off by default in fullscreen; on in inline view |
| Subtitle line | Bottom (when captions on) | **Mock text** until `/presenter/speech` (Phase 3) |
| Scroll | None | Page locked to viewport height |

**Room vs phones:** Projector slides = OBS **Keynote** scene. Phone Slides tab = PNG from app API — position only updates when session slide number changes (mock: ⚙ manual step on presenter, same browser only until Supabase + slide-bridge).

### What works in mock vs what doesn’t

| Works now | Does not work yet |
|-----------|-------------------|
| Presenter UI, Go Live / Pause / End Day (header) | iPad Go Live **syncing** to student phone on another device |
| 6 OBS buttons (LAN + WebSocket) | `/presenter/speech`, real subtitles |
| Word cloud + question on `/display` | **slide-bridge** — Keynote auto-advance on phones |
| Question **Show** / **Top question** | Supabase, AI notes from your voice |
| ⚙ Settings: week/day topic, date, slide refresh | Topics syncing to **other people’s phones** (localStorage only) |
| Real PNG slides on Slides tab (Mac dev server + Refresh) | Student join QR on presenter |
| Slides tab: viewport-fit, captions overlay, fullscreen | Live subtitle text on Slides tab (mock fixtures only) |
| Responsive student nav (bottom phone / top desktop) | Export PDF (My Notes) |
| Manual slide prev/next in settings (preview/test) | Multi-device slide sync |

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
| **Session topics** | Tap a field to edit week title, today’s topic. **Date** uses a calendar picker + **Today** button. Saves automatically to this browser. |
| **Slides** | After Keynote export, tap **Refresh**. Use prev/next to **test** slide images — does not control Keynote. |

**Keynote export tip:** Files like `My_Talk.001.png` work. Put them in **`public/slides/`** (one folder for the full deck).

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

- [ ] Full deck PNGs in repo / Vercel (`public/slides/` — any `.png` names)
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
| End | **End Day** → then **Download transcript** on presenter **(LIVE)** |

### Students (phones)

Five main tabs: **Live** · **Q&A** · **Slides** · **Notes** (auto / mine / cloud / overview) · **Week**.  
**Send to My Notes** via **+** on cards and lines.

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
| Need full session transcript | **(LIVE)** End Day → **Download transcript** on presenter — not Otter |
| Subtitles too inaccurate after rehearsal | Consider **Deepgram** upgrade (source-of-truth §10 Step 13) — not a second app |
| No slide images on phone | ⚙ **Refresh** on presenter; PNGs in **`public/slides/`**; hard-refresh if UI still mentions `day-1` (old deploy); use Vercel URL or same dev server |
| Slides don’t follow Keynote | **Expected** until `slide-bridge.js` + Supabase — room uses OBS Keynote; phones need bridge |
| Fullscreen exits after a few seconds | **Fixed** in code (was session re-render) — pull latest; report if it returns |
| Topics don’t update on student phone | **Expected in mock** if phone is a different browser — need Supabase (Phase 1) |
| Q&A won’t submit | Session not live, or paused |

---

## Part 8 — URLs

**Production (Vercel):** https://sphere-notes-live.vercel.app

| Role | Local dev | Production |
|------|-----------|------------|
| Presenter (iPad) | `http://MAC-IP:3000/presenter` | https://sphere-notes-live.vercel.app/presenter |
| Student | `http://MAC-IP:3000/student?event=biblical-worldview-2026&day=1` | https://sphere-notes-live.vercel.app/student?event=biblical-worldview-2026&day=1 |
| Speech (Mac) | — | `/presenter/speech` **(not built)** |
| Display (OBS) | `http://localhost:3000/display` | https://sphere-notes-live.vercel.app/display |

**iPad:** no separate URL — use `/presenter` and **Add to Home Screen**.

Set `NEXT_PUBLIC_APP_URL=https://sphere-notes-live.vercel.app` so QR/join links never use `localhost`.

---

## Part 9 — Before you close for the day

1. Skim [source-of-truth.md §8](./source-of-truth.md#8-concerns--mismatches-review-before-next-session) — open concerns.
2. Commit any uncommitted work (`TopicEditor` date picker, doc updates).
3. Note any friction in the dry-run table (source-of-truth §5).
4. Next build priority: **[source-of-truth.md §10](./source-of-truth.md#10-backend-implementation-checklist) Step 5 — slide-bridge** (push local script) + Step 6 — `/presenter/speech`.

### End-of-session flags (2 Jun 2026)

| Flag | Status / action |
|------|-----------------|
| **Slide PNGs** | ✅ 178 files in `public/slides/`; flat-folder API deployed (`6c8e210`) |
| **Vercel** | ✅ https://sphere-notes-live.vercel.app — `/api/slides` returns 178 |
| **Supabase session** | ✅ On `main` — env vars required; run migrations on your project |
| **slide-bridge** | ✅ On `main` — run `npm run slide-bridge` on Mac while Keynote is playing |
| **Date picker** | 🟡 Check if `TopicEditor` + `lib/dates/sessionDate.ts` still uncommitted |
| **Next** | Phone test on Vercel Slides tab; OBS rehearsal; push slide-bridge |
| **No `/presenter/speech`** | Subtitles, translation, word cloud from voice all blocked (§10 Steps 6–9) |
| **4 days in code** | Confirm if your event is 4 or 5 days — update `totalDays` if needed |
| **No day jump** | Can’t skip to Day 3 without End Day twice (or future URL param) |
| **README outdated** | Still mentions “390px” phone frame — app is responsive full-width now |
| **PDF ≠ slides** | App needs PNG in `public/slides/` — not PDF |

---

## Part 10 — Backend build order (your checklist)

Full technical detail lives in [source-of-truth.md §10](./source-of-truth.md#10-backend-implementation-checklist). This is the **short version** of what you need to get every live feature working.

### One-time setup (accounts)

1. **Supabase** project
2. **Anthropic** API key (Claude — correction + AI notes)
3. **Google Cloud Translation** API key (live subtitles only)
4. **Vercel** linked to GitHub repo
5. Copy all keys into `.env.local` and Vercel dashboard

### Build order (do in this sequence)

| Order | What | Unlocks |
|-------|------|---------|
| **1** | Supabase schema + `SupabaseSessionProvider` + env vars | iPad ↔ phone sync (Go Live, topics, display) |
| **2** | Student URL `?event=&day=` + anonymous auth | Proper join links, vote dedup |
| **3** | Deploy to Vercel | Slides on phones without Mac dev server |
| **4** | **`slide-bridge.js`** — AppleScript reads Keynote slide # → Supabase | Phone Slides tab follows Keynote |
| **5** | **`/presenter/speech`** — Mac Chrome + lapel mic + Web Speech | Raw subtitles on phones (~instant) |
| **6** | **`/api/claude/correct`** — async on final English chunks | Cleaner English (swap in when ready) |
| **7** | **`/api/translate`** — on **raw** speech, not corrected | Translated live subtitles |
| **8** | Word cloud from transcript tokens → Supabase | Real cloud growth (not mock tick) |
| **9** | **`/api/claude/notes`** + End Day archive | AI notes + Week tab |
| **10** | Q&A pin/archive, join QR on presenter | Full presenter polish |
| **11** | **Download transcript** (.txt) after End Day | Full session record for your files |
| **12** *(optional)* | **Deepgram ASR** swap if Web Speech fails rehearsal | Better accuracy — same live pipeline |

### Day-of: what runs on your Mac

| Process | Command / URL | Purpose |
|---------|---------------|---------|
| Next.js (or Vercel) | `npm run dev` or production URL | App |
| **slide-bridge** | `node scripts/slide-bridge.js` | Keynote → phone slide sync |
| **Speech tab** | Chrome → `/presenter/speech` | Mic → subtitles + word cloud input |
| Keynote | Presenter mode, external display | Room slides via OBS |
| OBS | Virtual Camera + WebSocket | Projector + iPad scene buttons |
| Zoom | OBS Virtual Camera input | Classroom camera on MacBook |

### Subtitle speed (locked)

| Language | What student sees first | What updates later |
|----------|-------------------------|-------------------|
| **English** | Raw Web Speech (interim + final) | Claude-corrected text swaps in async |
| **Other** | Google Translate of **raw** speech | No wait for Claude |

Everything else in the app (notes, Q&A, UI labels) stays **English**.

### Transcript download (after End Day)

When live backend is wired, **End Day** saves a full archive including every subtitle line and `fullTranscript`. A **Download transcript** button on the presenter (or Week tab for past days) gives you a `.txt` file — no Otter or Granola needed.

Typical file contents:

```
Biblical Worldview — Day 1: The Kingdom Blueprint
Monday 2 June 2026

[09:14:02] Today we begin with the kingdom of God…
[09:14:18] Scripture tells us that…
…

--- Full transcript ---
Today we begin with the kingdom of God. Scripture tells us that…
```

Use this for your records, blog posts, or course materials. Students do not see this file — it is presenter-only.

### Speech engine: Web Speech vs Otter vs Deepgram

| Tool | Role in SphereNotes |
|------|---------------------|
| **Web Speech** (default) | Free; drives live subtitles, word cloud, AI notes via your pipeline |
| **Deepgram** (optional upgrade) | Swap in after rehearsal if names/theology terms are too wrong — same pipeline, better mic→text |
| **Otter / Granola** | **Not used** — personal meeting apps; cannot push live translated subtitles to student phones |

Do not run Otter alongside teaching for a “backup transcript” — you will get two different texts, and only the in-app archive matches what students saw.

### Keynote slide-bridge (what you’ll run)

Before each session, in Terminal on the Mac:

```bash
# After slide-bridge.js is implemented:
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
export EVENT_ID="biblical-worldview-2026"
export DAY="1"
node scripts/slide-bridge.js
```

Mac will ask once for **Automation** permission to control Keynote. Keep Keynote in slideshow on the external monitor while teaching.

---

## Part 11 — Related docs

- [source-of-truth.md](./source-of-truth.md) — tracker + roadmap + **§10 backend checklist**
- [README.md](../README.md) — dev install
- [SphereNotesLive-DesignBrief.md](../SphereNotesLive-DesignBrief.md) — visual design

---

*SphereNotes Live · nathanielbaldock.com*

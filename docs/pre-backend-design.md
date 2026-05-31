# SphereNotes Live — Pre-Backend Design Decisions

**Status:** Locked for backend wiring  
**Event model:** `biblical-worldview-2026` · 4 teaching days  
**Stack:** Next.js · Supabase Realtime · Claude API · Web Speech · Keynote AppleScript · OBS · Zoom

This document resolves the seven pre-backend work items. Treat each section as the source of truth when implementing live services.

---

## 1. Production runbook — OBS, Zoom, Keynote

### Principle

Zoom carries **video only** (what the room sees on the projector). SphereNotes Live is **entirely separate** — students join via phone browser. OBS is the switcher that decides what video Zoom sends.

```
Keynote ──► OBS Scene "Slides" ──┐
/display ──► OBS Scene "SphereNotes" ──┼──► Virtual Camera ──► Zoom ──► Projector
Webcam ──► OBS Scene "Camera" ──┘

Student phones ──► Vercel app (independent of Zoom)
Presenter laptop ──► Chrome /presenter + slide-bridge.js + Keynote
```

### OBS scene list (6 scenes)

| # | Scene name | Source | When to use |
|---|------------|--------|-------------|
| 1 | **Pre-Show QR** | Browser Source → `/display?mode=join` | 10–15 min before start; return during long breaks if needed |
| 2 | **Title / Idle** | Browser Source → `/display` (idle) or static Keynote title slide | Session ended; between segments |
| 3 | **Keynote** | Window capture or Display capture of Keynote slideshow | Default while teaching |
| 4 | **Camera** | Webcam (presenter) | Intros, Q&A face time, stories |
| 5 | **SphereNotes** | Browser Source → `/display` (1920×1080) | Word cloud, quote, pinned question, stats |
| 6 | **Keynote + PiP** | Keynote full + small camera corner (optional) | If you want face + slides together |

### Browser Source settings (Scenes 1, 2, 5)

| Setting | Value |
|---------|-------|
| URL | `https://<your-domain>/display` (production) or `http://localhost:3000/display` (rehearsal) |
| Width × Height | 1920 × 1080 |
| FPS | 30 |
| Custom CSS | `body { overflow: hidden; }` (optional — app should already be full-bleed) |
| Shutdown source when not visible | **Off** (keeps WebSocket/Realtime connected) |
| Refresh browser when scene becomes active | **Off** (avoid flicker; display listens to Realtime) |

### Zoom setup

1. OBS → **Start Virtual Camera**
2. Zoom → Settings → Video → Camera → **OBS Virtual Camera**
3. Zoom audio: use room PA / Zoom audio as normal for the **classroom**. This is unrelated to SphereNotes transcription (see §2).
4. Share nothing from Zoom to students — they use the QR link, not Zoom.

### Keynote + slide-bridge

1. Keynote deck open in **presenter mode** on the Mac
2. Terminal: `node scripts/slide-bridge.js` (writes current slide index to Supabase every 2s)
3. Slide PNGs already deployed at `public/slides/day-{n}/slide-001.png`

### Hotkeys (OBS — set in Settings → Hotkeys)

| Hotkey | Action |
|--------|--------|
| `F1` | Scene: Keynote |
| `F2` | Scene: Camera |
| `F3` | Scene: SphereNotes |
| `F4` | Scene: Pre-Show QR |
| `F5` | Scene: Title / Idle |

*Adjust to avoid Mac system shortcuts. Practice until muscle memory.*

### Run-of-show timeline

| Time | You do | Big screen (OBS) | App |
|------|--------|------------------|-----|
| T−15 min | Open Keynote, OBS, Zoom VC, `/presenter`, `/display` tab | **Pre-Show QR** | Status: `waiting` |
| T−5 min | Run setup checklist (§5) | Pre-Show QR | Tests green |
| T−0 | Welcome, invite scan | Pre-Show QR → **Camera** | Still `waiting` |
| Start | **Go Live** in presenter | **Keynote** | `live` |
| Mid-session highlight | Push word cloud / quote from presenter | **F3 → SphereNotes** | displayMode sync |
| Answer question | Pin in presenter, push question display | **SphereNotes** | displayMode: `question` |
| Break | **Pause** | Keynote title or idle | `paused` |
| End of day | **End Day** | Title / Idle | `waiting`, day++ |

### QR moment

- **When:** Pre-show (T−15 to T−0) and optionally after **End Day**
- **Where:** OBS Scene **Pre-Show QR** — full-screen join screen, not a corner overlay on Keynote
- **Content:** Session title, day label, QR code, short URL, line: *"No app download · Works in your browser"*
- **Join URL shape:** `{APP_URL}/student?event={eventId}&day={n}`

---

## 2. Audio + mic plan — Web Speech input

### Problem

Web Speech API runs in **Chrome on the presenter laptop**. It is not fed by Zoom or OBS automatically. Poor mic planning = garbage subtitles and word cloud.

### Recommended setup (single mic, simplest)

```
USB lapel mic ──► Mac audio input
                      ├──► Chrome /presenter tab (Web Speech) ← transcription source
                      ├──► OBS (Camera scene) ← optional room video
                      └──► Zoom mic ← room hears you
```

**Rules:**
1. Use **one primary mic** — USB lav or headset — as Mac default input
2. Chrome `/presenter` tab: grant mic permission once; pin tab; do not mute the tab
3. **Same mic** for Zoom so room and transcription stay aligned
4. Disable Mac **ambient noise reduction** if it clips teaching cadence (System Settings → Sound → Input)

### Alternative (room PA / mixed audio)

If the mic is only on the room mixer and not the Mac: use a **splitter / USB interface** or **Loopback** (Rogue Amoeba) to route mixer output into Mac input. Avoid trying to transcribe from Zoom's incoming audio — latency and quality are worse.

### Presenter browser discipline

| Rule | Why |
|------|-----|
| Use **Chrome** only for `/presenter` | Web Speech API support |
| Keep `/presenter` on **wired connection** | WiFi drop kills transcription before Realtime drops |
| Do not close or refresh `/presenter` mid-session | Restarts speech recognition |
| Second monitor: presenter dashboard visible at all times | Mic status, connection, push-to-screen |

### Speech ↔ session state

| Session status | Web Speech | Raw transcript → Supabase | Claude correction | AI notes |
|----------------|------------|---------------------------|-------------------|----------|
| `waiting` | Off | — | — | — |
| `live` | **Listening** | Write | Every 10s | Every 60s |
| `paused` | **Stopped** | No writes | Paused | Paused |
| `ended` | Off | — | — | — |

On **Pause:** call `SpeechRecognizer.pause()` — do not keep listening in the background (avoids break chatter in transcript).

On **Resume:** restart recognition; do not backfill the break into notes.

### Degradation

| Failure | Student sees | Presenter sees |
|---------|--------------|----------------|
| Web Speech error | Last corrected subtitles frozen | Red "Mic error" banner + retry |
| Claude correction slow | Interim raw text, then swap | "Correction lag" warning if >20s |
| Claude down | Raw subtitles only | Banner: "AI notes paused — subtitles OK" |

---

## 3. Session state + multi-day schema

### State machine

```
waiting ──Go Live──► live ──Pause──► paused ──Resume──► live
   ▲                    │                │
   │                    │                │
   └── End Day ─────────┴────────────────┘
        (also from live/paused)
```

**`ended`** is reserved for future use (full event over). For this event, **End Day** returns to `waiting` on the next day.

### Gating matrix (matches current mock intent)

| Feature | waiting | live | paused |
|---------|---------|------|--------|
| Live subtitles | Hidden / "Session hasn't started" | Active | Visible, **frozen** (no new lines) |
| Slides tab | Preview OK (sync if bridge running) | Active | Active (keep syncing during break) |
| AI Notes tab | Sample or hidden | Active | Visible, **frozen** |
| Word cloud | Empty / seed | Growing | **Frozen** |
| Q&A submit/vote | **Blocked** | Active | **Blocked** |
| Reactions | Blocked | Active | Blocked |
| My Notes | Always available | Always | Always |
| Week archive | Past days readable | Past days readable | Past days readable |

### Multi-day data model

**Hierarchy:**

```
event (biblical-worldview-2026)
  └── day (1 | 2 | 3 | 4)
        └── live session state + content
```

**Supabase / Realtime paths:**

```
events/{eventId}/meta
  title, presenter, totalDays, currentDay, status, startedAt, studentCount

events/{eventId}/days/{day}/slide
  current, total, updatedAt

events/{eventId}/days/{day}/speech
  isRecording, rawBuffer, correctedBuffer, fullTranscript

events/{eventId}/days/{day}/wordcloud
  words: { [word]: { count, category, lastAt } }

events/{eventId}/days/{day}/questions/{questionId}
  text, votes, voters, status, createdAt

events/{eventId}/days/{day}/notes/{noteId}
  type, content, createdAt, transcriptChunk

events/{eventId}/days/{day}/reactions
  fire, clap, think, question

events/{eventId}/days/{day}/sessionMap/{segmentId}
  title, startTime, noteIds, type

events/{eventId}/days/{day}/display
  mode, payload (see §4), updatedAt

events/{eventId}/days/{day}/archive  (written on End Day)
  snapshot of subtitles, questions, notes, wordcloud, sessionMap, slides
```

**Client join:** read `eventId` + `day` from URL query params. Subscribe to `events/{eventId}/days/{day}/*`.

**Presenter writes:** `meta`, `display`, question moderation, `status` transitions.

**slide-bridge writes:** `slide/current` only (service role).

**Students write:** `questions` (create), `questions/{id}/voters` (vote), `reactions` (increment).

**Server/API writes:** speech correction, notes cards, session map segments.

### End Day archive flow

1. Presenter clicks **End Day**
2. Server copies day snapshot → `archive` node (or `archives` table row)
3. Reset live nodes for that day OR leave intact and switch `currentDay`
4. Mock today: Week tab reads archived days; live day reads Realtime/mock

### Pause semantics (locked)

- **Slides:** keep syncing (presenter may advance title slide during break)
- **Speech pipeline:** full stop
- **Student UX:** show subtle "Break" chip in header; frozen content is OK

---

## 4. Display mode completion + projector theme

### Projector theme decision: **Light**

Match the student app (Design Brief). Classroom is lit; warm white `#F7F5F2` background reads better than dark PRD display modes.

**Exception:** optional `join` mode may use slightly higher contrast (dark text on warm white) — still light theme.

All `/display` modes use:
- Background: `#F7F5F2`
- Text: `#1A1A18`
- Display font: Instrument Serif (quotes, titles)
- Minimum quote size: 48px at 1920×1080

### Display modes (complete set)

| Mode | Trigger | Content |
|------|---------|---------|
| `idle` | Default / Clear display | Session title + day label, subtle logo |
| `join` | Pre-show OBS scene | Title + QR + URL + "Scan to follow along" |
| `wordcloud` | Presenter push | Full-screen word cloud |
| `quote` | Presenter push (pick card) | Single pull quote, centered |
| `question` | Presenter push / auto on pin | Pinned or top-voted question |
| `slide` | Presenter push OR optional auto-follow | Current slide PNG full-bleed |
| `stats` | Presenter push | Reactions + question count + student count |
| `ask-room` | Presenter "Ask the Room" (later) | Claude synthesis, 2–3 sentences |

### Display payload (Realtime)

```typescript
interface DisplayState {
  mode: DisplayMode;
  payload?: {
    quoteText?: string;
    questionId?: string;
    questionText?: string;
    slideNumber?: number;
    askRoomSummary?: string;
  };
  updatedAt: string;
}
```

### Presenter push UX (MVP)

- **Word Cloud / Stats:** one click
- **Pull Quote:** dropdown of recent quote cards, then push
- **Question:** dropdown top 5 by votes + pinned, then push
- **Slide:** push current slide (manual — you switch OBS to SphereNotes scene)
- **Clear:** returns to `idle` (not `join` — OBS handles QR scene separately)

### OBS coordination note

When pushing SphereNotes content, **you** hit OBS `F3` (SphereNotes scene). The app does not control OBS. Optional v2: Stream Deck / AppleScript — out of scope for MVP.

---

## 5. Pre-session setup checklist UX

Route: **`/presenter/setup`** (linked from dashboard before Go Live)

### Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to dashboard          Pre-session setup · Day 2         │
├─────────────────────────────────────────────────────────────────┤
│  SESSION                                                          │
│  Title    [ Biblical Worldview                              ]    │
│  Day      ( • Day 1 ) ( ○ Day 2 ) ( ○ Day 3 ) ( ○ Day 4 )         │
├─────────────────────────────────────────────────────────────────┤
│  SLIDES                                              ○ Ready     │
│  ○ PNG folder deployed: public/slides/day-2/                     │
│  ○ slide-001.png … slide-038.png found (38 slides)               │
│  [ Open folder instructions ]                                    │
│  ○ slide-bridge running — last sync 2s ago (slide 1)           │
│  [ Test slide advance → ]                                        │
├─────────────────────────────────────────────────────────────────┤
│  AI CORRECTION DICTIONARY                            ○ Ready     │
│  Paste slide text export (Keynote → Send to Notes → paste)       │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Colossians · Imago Dei · YWAM · Nathaniel · …             │   │
│  └───────────────────────────────────────────────────────────┘   │
│  Custom terms (comma-separated)                                  │
│  [ YWAM, Kona, Biblical Worldview, Colossians 1:16              ] │
│  [ Save dictionary ]                                             │
├─────────────────────────────────────────────────────────────────┤
│  CONNECTIONS                                         ○ Ready     │
│  ○ Supabase connected                                            │
│  ○ /display reachable (open preview)                             │
│  ○ Mic permission granted in Chrome                              │
│  [ Test mic — speak 5 seconds ]  → "Listening: OK"               │
├─────────────────────────────────────────────────────────────────┤
│  STUDENT JOIN                                        ○ Ready     │
│  URL: https://app.example.com/student?event=…&day=2              │
│  [QR preview]     [ Copy link ]                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  ✓ All checks passed — ready to Go Live                  │     │
│  │                          [ Go Live ]  (disabled until ✓) │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Checklist rules

| Check | Pass condition |
|-------|----------------|
| Slides deployed | `slide-001.png` exists for current day; count matches `total` |
| slide-bridge | Heartbeat &lt; 5s old |
| Dictionary | ≥1 non-empty field saved |
| Supabase | Presenter channel subscribed |
| Mic | Web Speech receives ≥3 words in test |
| Display | `/display` loads without error |

**Go Live** on setup page = same as dashboard Go Live. Dashboard may show compact red/yellow/green checklist summary linking here.

### Slide deploy workflow (MVP — locked)

1. Keynote → Export → PNG → `public/slides/day-{n}/`
2. `git add` + `git push` → Vercel deploy (~30–60s)
3. Hard-refresh `/presenter/setup` to verify file count

No Firebase Storage upload in v1.

---

## 6. PRD open questions — decisions closed

| # | Question | **Decision** | Rationale |
|---|----------|--------------|-----------|
| 1 | Bible text source | **Bundled JSON** — KJV + BSB (already started in `public/bible/`) | Offline, zero latency, no API failure mid-session. Scripture card shows reference + both translations in expandable UI, default BSB for display. |
| 2 | Student auth | **Supabase Anonymous Auth** at join | One-time silent sign-in on `/student` load. Enables vote deduplication (`voters/{uid}`) without login UX. Session join still URL-based. |
| 3 | Word cloud rendering | **Custom canvas** (already built) | Matches premium animation spec. |
| 4 | Slide hosting | **GitHub `/public/slides/`** for MVP | You already deploy on Vercel; good enough for 4-day event. |
| 5 | Session data cleanup | **Archive on End Day; delete live nodes after 30 days** | Supabase cron or manual; low priority script post-event. |
| 6 | Offline resilience | **Banner + local transcript buffer on presenter** | Students: Supabase Realtime reconnect. Presenter: queue last 5 min transcript in memory; flush on reconnect. No offline on student phones beyond last received state. |

### Scripture card display (design)

- Primary verse: **BSB** (readable modern English)
- Tap "Other translation" → KJV
- No live API call during session

### Privacy copy (show on join screen + first My Notes visit)

> *Your personal notes stay on this device. They are not shared with the presenter or other students.*

---

## 7. Dry-run script (mock → rehearsal → live)

Run this once on **mock data** before backend, then again with **real Supabase** before the event.

### A. Mock dry-run (~15 min, no API keys)

| Step | Action | Pass |
|------|--------|------|
| 1 | `npm run dev` — open `/presenter`, `/display`, `/student` on phone | All load |
| 2 | OBS: add Browser Source → localhost `/display` | No scrollbars, fills 16:9 |
| 3 | Presenter **Go Live** | Student header shows LIVE |
| 4 | Student: subtitles tab | Content appears (mock tick) |
| 5 | Student: Q&A — submit + upvote | Blocked before live; works after |
| 6 | Presenter: push Word Cloud → OBS F3 | Display updates |
| 7 | Presenter: push Quote, Stats, Clear | Modes switch |
| 8 | Student: Send to My Notes from subtitle + Q&A | Clippings appear |
| 9 | Presenter **Pause** | Q&A blocked; subtitles stop updating |
| 10 | Presenter **Resume** | Live again |
| 11 | Presenter **End Day** | Day advances; Week archive reachable |
| 12 | Change day on presenter | Student URL/day param needed (note friction) |

**Friction log template:**

```
| Step | Issue | Severity | Fix before backend? |
|------|-------|----------|---------------------|
|      |       |          |                     |
```

### B. Rehearsal with backend (~30 min)

| Step | Action | Pass |
|------|--------|------|
| 1 | Deploy to Vercel; `.env.local` keys set | Health OK |
| 2 | Export Day 1 slides; push; verify CDN URLs | Images load on phone |
| 3 | Run `slide-bridge.js`; advance Keynote | Slide &lt;3s on phone |
| 4 | `/presenter/setup` — all checks green | Go Live enabled |
| 5 | Speak 2 min; watch subtitles + word cloud | Correction &lt;15s lag |
| 6 | Wait 60s | ≥1 AI note card appears |
| 7 | Pin question; push to display | Readable at 1920×1080 from back row |
| 8 | Disable WiFi on phone 30s | Reconnect banner; data resumes |
| 9 | Kill mic permission | Presenter error banner |
| 10 | Full OBS + Zoom to projector | Room sees intended scene |

### Known mock friction (pre-fill)

| Issue | Severity | Resolution |
|-------|----------|------------|
| Student day tied to presenter localStorage, not URL | **High** | Backend: `?event=&day=` drives subscription |
| No `/presenter/setup` route yet | **High** | Build in Phase E |
| Display modes incomplete (`question`, `slide`, `join`) | **Medium** | Extend DisplayView + types |
| No QR on join display | **Medium** | Add `join` mode + qrcode lib |
| Pull Quote push picks first quote only | **Low** | Quote picker dropdown |
| `StudentJoinSection` not on dashboard | **Medium** | Add join URL + QR to setup |

---

## Implementation order (backend phase)

1. Supabase schema + RLS matching §3  
2. Anonymous auth on student join  
3. Replace MockSessionProvider with Realtime provider (keep mock flag)  
4. Web Speech → Supabase speech pipeline  
5. Claude routes (correct + notes)  
6. slide-bridge.js → Supabase  
7. `/presenter/setup` checklist  
8. Complete `/display` modes + light theme pass  
9. Rehearsal §7B  

---

*Last updated: pre-backend design lock · SphereNotes Live*

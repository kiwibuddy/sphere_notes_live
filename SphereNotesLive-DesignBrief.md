# SphereNotes Live — Design Brief
**For:** Brand & UI Design Collaboration  
**Version:** 1.0  
**Owner:** Nathaniel Baldock · nathanielbaldock.com  
**App:** SphereNotes Live  
**Current session topic:** Biblical Worldview *(topics change per teaching series; the app shell stays the same)*

---

## 1. What This App Is

**SphereNotes Live** is a real-time companion app for live classroom teaching sessions. Students scan a QR code at the start of a session and the app opens instantly in their mobile browser — no download, no login.

The presenter teaches at the front of the room. Students follow along on their phones. Everything updates live.

It is not a chat app. It is not a polling tool. It is a **premium second-screen learning experience** — closer in spirit to a beautifully designed conference programme that comes alive during the talk.

The closest design references emotionally are:
- Apple's iOS product pages — confident typography, generous white space, restrained colour
- Linear's interface — clean, purposeful, nothing wasted
- A well-designed book or journal — the feeling that content is the hero, not chrome

---

## 2. The People Using This

**Students (primary — the phone view)**  
Adults in a classroom, seated, phones in hand. Many are ministry leaders, church workers, missionaries, educators. International audience — Kenya, New Zealand, USA, Australia. Age range 22–60. They want clarity, not complexity. They will glance at the phone and look back up at the presenter.

**The Presenter (secondary — the laptop view)**  
Nathaniel Baldock. Teaching in a flowing, pastoral, intellectually rigorous style. His brand is warm intelligence — not corporate, not casual. The app should feel like an extension of how he teaches.

---

## 3. The Seven Tabs (Student View)

Each tab is a distinct experience. They should feel coherent as a family but each has a personality.

| # | Tab Name | Icon concept | What it shows | Emotional tone |
|---|---|---|---|---|
| 1 | **Cloud** | Organic cluster | Live word cloud from the presenter's speech — words grow as he says them | Wonder, emergence |
| 2 | **Live** | Waveform or caption line | Live auto-corrected subtitles, rolling line by line | Focus, accessibility |
| 3 | **Q&A** | Question mark or raised hand | Student questions, upvoted to the top | Participation, democracy |
| 4 | **Notes** | Spark or star | AI-generated structured notes — titles, quotes, scriptures, bullets | Intelligence, craft |
| 5 | **Slide** | Rectangle or screen | Current Keynote slide, synced live | Orientation, context |
| 6 | **Map** | Path or timeline | Session timeline building in real time | Journey, structure |
| 7 | **Mine** | Pencil or leaf | Personal freeform notepad with rich text | Ownership, privacy |

---

## 4. The Content Types (AI Notes Tab)

This is the richest tab. It generates **seven distinct card types** from the presenter's voice. Each needs its own visual identity within the same design system:

### 4a. Section Title Card
Marks a new teaching topic. Large, confident. Like a chapter heading in a well-designed book.  
**Feel:** Editorial. Monumental but light.

### 4b. Bullet Summary Card
2–4 concise key points. Clean, scannable.  
**Feel:** Efficient. Professional notes.

### 4c. Pull Quote Card
A rhetorically strong sentence extracted from speech. Large italic serif. The visual centrepiece of the notes.  
**Feel:** Poster. Quotable. Worth photographing.

### 4d. Scripture Card
Automatically detected Bible references. The reference displayed prominently, verse below.  
**Feel:** Reverential but not stuffy. Clean devotional design, not church bulletin.

### 4e. Key Concept Card
A single term displayed large — like a vocabulary card. Brief definition alongside.  
**Feel:** Lexical. Study-quality.

### 4f. Diagram Card
Simple AI-generated SVG diagrams — flow arrows, comparisons, timelines.  
**Feel:** Explanatory. Textbook-quality but contemporary.

### 4g. Story Title Card
When the presenter tells a story, it gets a cinematic title.  
**Feel:** Narrative. Like a documentary chapter card.

---

## 5. Cross-Tab Feature: Send to My Notes

Every tab has a subtle "+" or "Send" action. Tapping it inserts a **clipping** into the My Notes tab — a visually distinct block showing where it came from (Subtitles / Questions / AI Notes / Slide). The student can then write freely around these clippings.

This is a key interaction — it should feel satisfying, like pulling a bookmark from a beautiful page.

---

## 6. Design Direction

### 6a. Theme: Light

**The app must be light-themed.** Clean whites and warm off-whites, not dark mode. The reasoning: students are in a lit classroom, looking at a bright projected screen, then glancing down at their phone. A light UI matches the ambient environment and feels like a notebook or textbook, not a dashboard.

The dark mock that exists is a reference for layout and structure only — discard the colour palette entirely.

### 6b. Colour Palette Direction

Start from warm neutrals. SphereNotes Live is topic-agnostic — the teaching subject changes each series. For the current build, the session topic is **Biblical Worldview**: theological, warm, intellectually serious. Not tech-cold. Not startup-bright.

**Suggested palette direction (to be refined in design):**

| Role | Direction |
|---|---|
| Background | Warm white — something like `#FAFAF8` or `#F7F5F2`, never pure `#FFFFFF` |
| Surface (cards) | Pure white `#FFFFFF` with a very subtle warm shadow |
| Primary text | Near-black warm — `#1A1A18` or similar |
| Secondary text | Mid warm grey — `#6B6860` |
| Borders | Hairline warm grey — `#E8E5E0` |
| **Tab 1 — Cloud** | Warm teal / sage — something natural, not electric |
| **Tab 2 — Live** | Calm blue — readable, accessible-feeling |
| **Tab 3 — Q&A** | Warm terracotta or amber — human, not alarming |
| **Tab 4 — Notes** | Deep gold or ochre — intelligent, editorial |
| **Tab 5 — Slide** | Soft indigo or slate |
| **Tab 6 — Map** | Neutral warm grey |
| **Tab 7 — Mine** | Fresh green — growth, personal, alive |
| **Live indicator** | Coral red — the only bright-saturated colour in the UI |

### 6c. Typography Direction

This app is about words, ideas, and learning. Typography is the soul of it.

**Requirements:**
- A **serif display font** for all major headings, pull quotes, section titles, story titles, and the session name. It should feel warm and intelligent — editorial, not decorative. Reference: something between the confidence of a quality newspaper and the warmth of a book. Fraunces, Lora, Playfair Display, or a similar optical-size serif.
- A **clean sans-serif** for all body text, labels, and UI chrome. Should be highly legible at small sizes. Reference: the clarity of Geist Sans, the warmth of DM Sans, or the neutrality of Söhne.
- The **pull quote card** specifically should have the quote in a large italic serif — this is the typographic hero moment of the whole app.
- Scripture should feel slightly different to regular text — slightly more formal serif, slightly more generous leading.
- Tab labels should be uppercase, tight tracking, very small — like refined clothing labels.

### 6d. Spatial System

- **Generous padding** inside cards — content should breathe.
- Cards have **soft rounded corners** (12–18px) and very **subtle shadows** (`box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`) — they float slightly off the background.
- **No hard borders** on cards — shadow and background contrast do the work.
- **Tab bar** sits at the bottom. Simple, clean, generous touch targets. The active tab's icon and label get the tab's accent colour. Everything else is mid-grey.
- **Reaction strip** above the tab bar — four pill buttons, light background, subtle. Not prominent unless tapped.
- **Session header** at top — session name in the serif display font. Small subtitle below. LIVE chip in coral red with pulse dot.

### 6e. Motion Principles

- **Purposeful only** — motion communicates, never decorates.
- Tab switches: fade + 6px translateY, 200ms ease-out. Nothing dramatic.
- Card entrance: staggered fade-up, 80ms between cards, 300ms per card. Feels like content arriving, not exploding.
- Word cloud words: gentle scale-in on entry, subtle scale pulse when frequency increases.
- Vote count: number ticks up with a brief scale pulse.
- "Send to Notes" clipping: slides down into the My Notes tab, left border draws in. Satisfying but not flashy.
- Pull quote on AI Notes: slight scale-up entrance (0.97 → 1.0) with fade. A beat of pause before it appears.
- Live badge pulse: slow, breathing. Not urgent.

---

## 7. Layout Specifications

### Phone Shell (when previewed on desktop)
- Max width: 390px
- Max height: 844px
- Border radius: 44–50px (iPhone 14 proportions)
- Subtle device shadow for context in the browser

### App Structure (top to bottom)
```
┌─────────────────────────────┐
│  Status bar (44px)          │  ← simulated iOS status bar
│  Session header (56px)      │  ← name + LIVE chip
├─────────────────────────────┤
│                             │
│  Content area (flex: 1)     │  ← current tab panel, scrollable
│                             │
├─────────────────────────────┤
│  Reactions strip (52px)     │  ← 🔥 👏 🤔 ❓ pills
│  Tab bar (58px)             │  ← 7 tabs
└─────────────────────────────┘
```

### Tab Bar Detail
- 7 tabs: Cloud · Live · Q&A · Notes · Slide · Map · Mine
- SVG icons only — no emoji
- Tab label: 9–10px, uppercase, letter-spacing 0.06em
- Active: icon + label in tab accent colour, no background pill
- Inactive: mid warm grey
- Active indicator: 2px line at the very top of the tab bar (drawn above the tab), in the tab accent colour

### Card Anatomy
```
┌─────────────────────────────┐  ← border-radius: 14px
│  [eyebrow label]  10px 600  │  ← optional, accent colour, uppercase
│                             │
│  [main content]             │  ← varies by card type
│                             │
│  ─────────────────────────  │  ← 0.5px warm grey rule
│  [Save]  [+ My Notes]       │  ← action buttons, right-aligned
└─────────────────────────────┘
```

---

## 8. The My Notes Tab (Special Attention)

This tab is the most personal. It should feel like opening a beautiful notebook.

- **Background** slightly warmer than the rest of the app — like cream paper vs white
- **Editor area** has no visible border when unfocused — just a very subtle inner shadow suggesting a page
- **Formatting toolbar** is minimal — 8 buttons max, small, in a pill-shaped bar. Only appears when the editor is focused on desktop; always visible on mobile.
- **Clipping blocks** have a left accent border (2px, in the source tab's colour), a very small source label, and the clipped text in a slightly smaller size. They should feel like sticky notes placed in a journal.
- **Export buttons** at the bottom: Copy · Export PDF · MD. Understated. The PDF export is the primary action (green accent).
- **Autosave indicator** at the very bottom: tiny, monospace, warm grey. "Saved just now." Students should feel safe.

---

## 9. The Word Cloud Tab (Special Attention)

The word cloud should feel like something alive — organic, not mechanical.

- **Background** for this tab only: slightly different — perhaps a very faint warm gradient or a subtle noise texture to give the words a surface to sit on
- Words are categorised and coloured:
  - Theology terms (Kingdom, Mission, Imago Dei): **warm gold / ochre**
  - Names (YWAM, Jesus, Nathaniel): **calm blue**
  - Core concepts (AI, Human, Ethics): **teal / sage**
  - General vocabulary: **light warm grey**
- Words should feel like they're floating, not pasted on a grid
- The cloud should never feel cramped — generous spacing
- The SESSION / 5 MIN toggle is a small segmented control, top right, unobtrusive

---

## 10. Key Interactions to Design

1. **Tab switch** — including the active indicator drawing in
2. **Vote increment** — the number ticking up with haptic-like visual feedback
3. **Send to Notes** — the clipping block arriving in the My Notes tab
4. **Word appearing in cloud** — a new word scaling in from zero
5. **New subtitle line** — the current line indicator scrolling
6. **Pull quote card arriving** — the typographic moment
7. **Reaction tap** — the emoji floating up from the pill
8. **Story title card** — the cinematic reveal

---

## 11. What Already Exists (Reference Only)

A working dark-theme HTML prototype exists at `SessionLive-Mock.html`. It demonstrates:
- All 7 tabs with working navigation
- Live subtitle simulation (new lines every 6 seconds)
- Upvote interactions on Q&A
- Send to Notes cross-tab functionality with animated clipping arrival
- Reaction emoji floating animation
- My Notes editor with autosave indicator and export buttons
- Word cloud with categorised word colouring
- Session map timeline

**Use this for structure and interactions only. Ignore all colours, all dark backgrounds, all current fonts.**

---

## 12. Tech Implementation Context

The final build will use:
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for all styling
- **shadcn/ui** for component primitives (Tabs, Card, Badge, Button, Dialog, Toast)
- **Framer Motion** for all animations
- **Firebase Realtime DB** for live sync
- **Claude API** (Anthropic) for AI features

Design output should be compatible with Tailwind's utility class system. When specifying values, include both the design token (e.g. `text-warm-900`) and the raw hex/value so the developer can configure Tailwind's theme correctly.

---

## 13. Brand Context: SphereNotes Live

SphereNotes Live is a companion teaching app — the UI and design system stay consistent while the session topic changes (currently **Biblical Worldview**). Key design attributes:

| Attribute | Expression |
|---|---|
| **Warm intelligence** | The app should feel like a thoughtful person designed it, not a team of engineers |
| **Faith-rooted** | Not explicitly religious in the UI, but the aesthetic should be consistent with a theological world — dignified, unhurried, reverent of language |
| **Accessible authority** | Confident design without being cold. The kind of book you'd find in a good pastor's study |
| **Human over machine** | Ironic for an AI-powered app — but the design should constantly reinforce humanity. Serif type, warm whites, organic word cloud, breathing animations |
| **Premium without ostentation** | This is not a $500/month SaaS product. It should feel expensive in the way a well-made object feels expensive — through quality, not price signals |

---

## 14. Deliverables Requested from Design

1. **Colour palette** — full token set with names, hex values, and usage rules
2. **Typography scale** — font choices, size scale, weight usage, line heights
3. **Component library** — all 7 card types, tab bar states, reaction pills, clipping blocks, editor toolbar
4. **Screen designs** — each of the 7 tab panels at 390×844, light theme
5. **Interaction notes** — annotated description of each key interaction (see Section 10)
6. **Updated HTML prototype** — the `SessionLive-Mock.html` rebuilt with the light theme applied

---

## 15. Questions for the Design Conversation

When working with Claude on design, these are the open creative questions:

1. **Should the pull quote card be full-bleed or contained?** A full-bleed card with a large serif quote and near-minimal chrome would be very striking. But it might overwhelm smaller phones.

2. **Does the word cloud tab need a different background?** Or does the warm white of the main app give enough contrast for the coloured words?

3. **How do we signal "live" without making it feel urgent or anxious?** The LIVE badge and the pulsing subtitle indicator both need to communicate currency without stress.

4. **Tab bar: labels always visible, or only on active tab?** Apple hides labels on inactive tabs in some apps. Given there are 7 tabs (more than Apple's typical 5), labels-always may be necessary for orientation.

5. **Should the My Notes tab background be noticeably different (cream) or the same as the rest?** A cream distinction adds warmth and the "notebook" feeling. But it might look inconsistent.

6. **The Scripture card — should it reference a specific Bible translation?** ESV is the most typographically clean. But this is a design decision that affects the feel of the card.

---

*This document is the complete design brief for SphereNotes Live v1.0. Hand this to a designer or use it as a prompt for Claude's design tools to begin building the light-theme prototype.*

*Last updated: SphereNotes Live PRD v1.0 · nathanielbaldock.com*

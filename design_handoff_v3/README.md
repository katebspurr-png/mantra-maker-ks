# Resonance — Design Handoff · v3 "Minimal / High-End"
## SwiftUI / Xcode · for Claude Code

---

## Overview

Resonance is a voice-based affirmations app: users record mantras in their own voice and play them back on loop. The design direction ("Breath") is radical whitespace, large serif italic type, and a warm neutral palette — a personal journal, not a productivity tool.

This package documents **v3**, the current design. It supersedes any earlier handoff (`design_handoff_resonance/`).

> The HTML files are **design references** built as prototypes. The task is to **recreate these designs in SwiftUI** using the app's existing architecture and patterns — not to ship the HTML. Open `Resonance Breath Full App v3.html` in a browser: it's a pan/zoom canvas of every screen, organized in sections (Onboarding, Core App, Recording Flow, First Run / Empty States, How It's Been).

**Fidelity:** High. Colors, typography, spacing, and copy are final-intent — implement per the specs below, using `DesignTokens.swift` as the single source of truth.

---

## Product principles (read before building)

1. **No pressure, ever.** No streaks, counts, scores, charts, badges, red dots, or guilt-inducing empty states. This is deliberate. Do not add metrics anywhere, including the "How It's Been" feature.
2. **Minimalism is structural, not decorative.** Screens are built from type, whitespace, and hairline rules — almost no cards or boxes. Resist adding containers.
3. **One accent per screen** (see Color rules).
4. **Two button styles only** (see Buttons).

---

## Design System (v3 rules)

### Color

All tokens in `DesignTokens.swift`. Key v3 changes vs. earlier tokens:
- `resTextSoft` = `#6E6759`, `resTextMuted` = `#857B6D` (darkened for AA contrast)

**Accent ownership — never mix sage and terracotta on one screen:**

| Accent | Owns |
|--------|------|
| `resWarm` (terracotta) | Entire recording flow: breathing rings, mic affordances, rec indicator, karaoke highlight, live waveform, save-screen radios + waveform. Also the "Try today" warm block on Home. |
| `resSage` (sage) | Library (incl. tags, hearts, play circles), Playlists, Reflections/How It's Been links, onboarding selection states, active tab icon. |
| `resText` (near-black) | All primary buttons, mic outline on record-ready, play circle on Home. |

### Typography

Cormorant Garamond (display/serif) + Plus Jakarta Sans (UI). Full scale in `DesignTokens.swift`. Notables:
- Page titles: 32pt Cormorant **upright** Regular
- Affirmations: Cormorant **Light Italic**, 23–32pt by context, line-height ~1.55–1.75
- List row titles: 16pt Cormorant Medium Italic
- Eyebrows: 10pt Jakarta SemiBold, UPPERCASE, tracking 0.14em (`EyebrowLabel` helper)
- Tab labels: 10.5pt
- **Always curly quotes (“ ”)** around affirmation text, never straight quotes.

### Structure
- Horizontal screen padding: 26pt; content top: 66pt below status bar
- **All dividers are 0.5pt hairlines** (`Hairline` view) — never 1pt
- At most **one contained surface per screen** (the cream `resBgWarm` block, radius 20). Save and Profile are de-boxed: bare rows + hairlines, no card borders.
- Icons: feather-style line icons, **1.5pt stroke everywhere** (use SF Symbols with `.light`/`.regular` weight to approximate)

### Buttons — exactly two styles
1. **Filled dark**: `resText` bg, `resBg` label, 52–54pt tall, radius 14 (`ResPrimaryButtonStyle`)
2. **Text link**: 13–14pt Medium, colored `resTextSoft` / `resWarm` / `resSage` by context (`ResTextButtonStyle`)

No outlined pills, no dashed borders, no chip-buttons. Destructive actions (Discard) are text links in `resWarm` @ 60%.

### Motion
One shared curve for everything: **500ms `cubic-bezier(0.22, 1, 0.36, 1)`** (`ResMotion.standard`). Transitions are **fades (+ subtle 8pt translate at most)** — no slides, no springs, no bounces. The only other rhythm is the **3.5s breathing tempo** (`ResMotion.breath`) on record rings and player orbs. Respect Reduce Motion.

### Navigation — 4 tabs
```
TabView (custom bar, 92pt, bg resBg@95% + thin material, 0.5pt top hairline)
├── Home
├── Library            ← segmented: Recordings · Playlists · Suggestions
├── [Record CTA]         46×46pt, radius 14, resText bg, lifted 14pt, mic icon
└── Profile
.fullScreenCover → ImmersivePlayerView → FeelingCaptureView
First launch → Onboarding (6 steps, 2 designed here)
```
Playlists is **not** a tab — it's the middle segment of Library.

---

## Screens

Every screen below exists as an artboard in the HTML canvas — treat the canvas as the pixel reference and this list as the implementation notes.

### Core

**1 · Home** — Greeting ("Good morning" caption + 32pt name) → eyebrow "YOUR PRACTICE" → hero affirmation (32pt Light Italic, curly quotes) → play row: 52pt outlined circle (1.5pt `resText`), "1:14 · Listened 12 times" caption, and a 44pt expand button (trailing) that opens the Immersive Player → hairline → filled-dark "Record a New Affirmation" (54pt) → full-bleed warm block "TRY TODAY" (26pt quote, "Confidence" chip is a static tag not a button, text links "Show me another" + "Record this") → three collapsible rows: Thought Transformer, Favorites, How it's been (16pt SemiBold + chevron, hairline dividers).

**2 · Library — Recordings tab** — 32pt title, 3-segment control (Recordings · Playlists · Suggestions; active = white pill on `resBgDim` track), search field, horizontal tag scroll. Rows: 16pt Medium Italic title, meta caption, trailing actions each ≥44pt hit target: heart (fav = `resSage`), 44pt play circle (`resSageSoft` bg, sage icon), more-dots.

**3 · Library — Playlists tab** — Same header, Playlists segment active. Rows: 40pt icon square (`resSageSoft` bg, sage icon, radius 12), 16pt serif title, "N affirmations · M:SS" caption, 44pt play circle. Below list: text-link "＋ Create a Playlist" in sage.

**4 · Record — ready** — Nav: back chevron + "New Affirmation" (17pt serif italic). Warm block with affirmation text (23pt Light Italic, first word highlighted `resWarm`@20%) and an "Edit text" chip (terracotta text + pencil, 1px `resWarm`@25% border, radius 16 — this chip is the one sanctioned exception to the two-button rule, treat as an inline field affordance). Centered 88pt mic button (2pt `resText` outline) inside two breathing rings (`resWarm`@30% / @22%, 3.5s pulse). Toggles (Teleprompter / Karaoke): 44×26pt, on = `resWarm`.

**5 · Record — in progress** — "Cancel" text link top-left; top-right blinking rec dot (`resWarm`, 1.6s) + tabular timer. Warm block "READ ALONG": karaoke text, spoken words highlighted `resWarm`@18%. Center: live waveform (34 bars, all terracotta family, staggered 1.1s scaleY animation) above an 84pt **filled terracotta** stop button (white rounded square glyph, pulsing ring) + "Tap to finish" caption.

**6 · Record — save** — De-boxed. Waveform player strip (38pt dark play circle, 45 bars: played = `resWarm`, rest = `resText`@15%). Warm block "YOUR AFFIRMATION" quote. Bare form: title input (white bg, 0.5pt border, radius 14, pencil icon — must read as editable), playback radios (18pt circle, selected = `resWarm` ring + dot). Actions: filled-dark "Save Recording", text-link "Try Again", text-link "Discard" (`resWarm`@60%).

**7 · Immersive Player** — `fullScreenCover`, dark gradient `#1C1610 → #141009 55% → #0F0C07`, two breathing ambient orbs (terracotta @12% / sage @10%, 10s). Close ✕ top-right (36pt circle, `resDarkText`@6%). Centered quote 28pt Light Italic `resDarkText`@92%. Bottom: 4pt progress bar (radius 2, terracotta gradient fill, **14pt scrub handle** `#E8C9B4`), then Repeat · 64pt Play/Pause circle · Volume. Swipe-down ≥100pt dismisses.

**8 · Profile** — De-boxed: avatar row (52pt circle, `resBgWarm`, serif initial), hairline-separated setting rows (34pt icon square `resBgDim`, 15pt Medium label, chevron/toggle 44×24 sage). Colour theme: 6 swatches 36pt, active = double ring. Sign Out = text link. *(Note: only the sage theme is demonstrated; treat other swatches as TODO product decision.)*

**9–10 · Onboarding steps 1–2** — Progress dots (active = 24pt wide sage pill). 34pt Light Italic headline. Option rows: radius 20, 1px border (`resSage`@55% selected / `resBorder`), **no shadow unselected**. Step 2 uses 38pt icon squares with line icons (no emoji), selected = `resSageSoft` bg + sage icon. Continue = filled dark, 40% opacity disabled.

### First run — empty states

**11 · Home empty** — Greeting → eyebrow "BEGIN" → 30pt italic "Your practice begins with a single sentence, spoken in your own voice." → filled-dark "Record Your First Affirmation" → warm block "NOT SURE WHERE TO START?" with sample quote + "Show me another" / "Record this" text links → numbered 3-step how-it-works list (serif numerals, hairlines).

**12 · Library empty** — Header + segmented control as normal. Centered: 64pt mic circle (`resBgDim`), "Nothing here yet" 24pt italic, one caption line, filled-dark record CTA, sage text-link "Or browse suggestions".

**13 · Playlists tab empty** — Centered 64pt sage icon circle, "Build a ritual" 24pt italic, caption, filled-dark "＋ Create a Playlist".

### How It's Been (Reflections)

Full spec lives in `REFLECTIONS.md` (data model, vague-date rules, capture logic). Screens:

**14 · Home, section open** — expanded row shows "Words you've left after listening, lately:" + the last 2–3 distinct words in 24pt italic separated by " · ", and a sage text-link "See your reflections →".

**15 · Reflections page** — push nav. Intro sentence, groups "THIS WEEK" / "EARLIER" (eyebrows), entries: vague day word (12pt muted) → “feeling word” (25pt Light Italic) → context line (13pt). Footer note on `resBgDim`, radius 20: "This page holds only what you choose to add. Nothing is counted, scored, or tracked automatically."

**16 · Feeling capture** — after an immersive session ends: same dark gradient (reads as a continuation), "A MOMENT BEFORE YOU GO" eyebrow, "How do you feel right now?" 27pt italic, single-select serif word chips (`lighter, steadier, calm, tender, strong`; selected = terracotta tint), "or write your own…", cream filled "Keep this" (disabled until selection), always-visible "Skip". Never show twice per session; skipping forever is fine.

---

## Component Inventory

| Component | Used in |
|-----------|---------|
| `EyebrowLabel` | everywhere (in DesignTokens.swift) |
| `Hairline` | everywhere (in DesignTokens.swift) |
| `ResPrimaryButtonStyle` / `ResTextButtonStyle` | everywhere (in DesignTokens.swift) |
| `AffirmationQuote` (size variants, curly quotes) | Home, Try Today, Record, Save, Player |
| `PlayCircle` (outlined dark / sage-soft filled) | Home, Library, Playlists |
| `RecordingRow` | Library |
| `WarmBlock` | Home, Record, Save |
| `CollapsibleSection` | Home |
| `SegmentedTabs` (3-segment) | Library |
| `BreathingRing` | Record ready/live |
| `LiveWaveform` / `StaticWaveform` | Record live / Save |
| `AmbientOrb` | Immersive Player, Feeling Capture |
| `FeelingChip` | Feeling Capture |
| `ProgressDots` | Onboarding |
| `ResTabBar` (4 tabs + lifted CTA) | root |
| `EmptyState` (icon circle + italic title + caption + CTA) | Library/Playlists empty |

---

## Assets

- **Fonts:** Cormorant Garamond + Plus Jakarta Sans — `FontSetup.md`
- **Icons:** SF Symbols at light/regular weight (mic, house, book, person, chevrons, heart, magnifyingglass, arrow.clockwise, repeat, speaker.wave.2, ellipsis, plus, pencil, arrow.up.left.and.arrow.down.right)
- No raster assets required.

---

## Files

| File | Purpose |
|------|---------|
| `Resonance Breath Full App v3.html` | Canvas of all 16+ screens — primary pixel reference (open in browser) |
| `resonance-breath-app-v3.jsx` | Prototype source — exact values for anything not covered above (token object `B` at top) |
| `DesignTokens.swift` | Drop into Xcode — colors, fonts, spacing, radii, motion, button styles |
| `FontSetup.md` | Custom font integration walkthrough |
| `REFLECTIONS.md` | Deep spec for the How It's Been feature |
| `design-canvas.jsx`, `ios-frame.jsx` | Canvas scaffolding — ignore |

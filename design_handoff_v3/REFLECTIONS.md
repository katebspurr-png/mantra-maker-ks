# Reflections ("How It's Been") — Feature Spec

> Part of the v3 handoff. Tokens/quotes referenced here follow `DesignTokens.swift`; where this file and the v3 README disagree on visual details (v2-era token values, 1px borders), the v3 README + canvas win.

## Overview
A qualitative reflection feature for Resonance (a voice-affirmation app). After listening to an affirmation, the user may optionally leave a single feeling-word ("lighter", "steadier", …). Those words accumulate into a quiet, journal-like record surfaced from the Home screen.

**Core product principle — read this first:** this feature must never create pressure. There are **no streaks, no counts, no scores, no charts, no reminders to reflect, and no empty-state guilt**. Capture is opt-in per session; skipping forever is a valid way to use the app. Do not "improve" this with metrics.

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look and behavior, not production code to copy directly. Recreate these designs in the target codebase's existing environment (React Native, SwiftUI, Flutter, etc.) using its established patterns and libraries. If no app codebase exists yet, choose the most appropriate mobile framework and implement there.

`Resonance Breath Full App v2.html` renders a design canvas of the whole app. The three screens for THIS feature are in the section titled **"How It's Been — Exploration"** (component source: `resonance-breath-app-v2.jsx`, components `HomeReflectionsOpenScreen`, `ReflectionsScreen`, `FeelingCaptureScreen`). The rest of the canvas is context.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy are final-intent. Recreate closely, mapping to the app's design-token system.

## Design Tokens (shared app palette)
- `bg` #FDFCF9 (app background) · `bgWarm` #F5EFE6 · `bgCard` #FFFFFF · `bgDim` #F0EBE2
- `text` #1C1A16 · `textSoft` #6E6759 · `textMuted` #857B6D
- `accent` (sage) #4A6741 · `accentSoft` rgba(74,103,65,0.1)
- `warm` (terracotta) #C07A52 · `warmSoft` rgba(192,122,82,0.1)
- `border` #E8E2D9
- Radii: 14 (controls), 20 (cards)
- Fonts: **Cormorant Garamond** (serif — affirmations, feeling words, italic) + **Plus Jakarta Sans** (sans — UI)
- Dark (capture screen): gradient 170deg #1C1610 → #141009 55% → #0F0C07; cream text rgba(250,244,236,0.92)

## Screens

### 1. Post-listen capture (`FeelingCaptureScreen`)
- **Purpose**: The single input to the whole feature. Shown after the immersive player session ends (user taps close or playback stops).
- **Layout**: Full-screen dark (same gradient + soft terracotta radial glow as the immersive player, so it reads as a continuation). Content centered; actions pinned to bottom with 56px bottom padding.
- **Content**:
  - Eyebrow: "A MOMENT BEFORE YOU GO" — 11px sans, 600, letter-spacing 0.1em, rgba(255,255,255,0.3)
  - Title: "How do you feel right now?" — 27px Cormorant italic 300, rgba(250,244,236,0.92)
  - Word chips (wrap, centered, gap 10, max-width 300): `lighter, steadier, calm, tender, strong` — 16px Cormorant italic, padding 11px 20px, radius 24. Unselected: bg rgba(255,255,255,0.05), border rgba(255,255,255,0.1), text rgba(250,244,236,0.6). Selected: bg rgba(192,122,82,0.22), border rgba(192,122,82,0.55), text rgba(250,235,222,0.95). **Single-select.**
  - "or write your own…" — 14px sans rgba(255,255,255,0.35); opens a minimal text input (one line, ~24 char max) in place of the chips
  - Primary: "Keep this" — full-width 52px, radius 14, bg rgba(250,244,236,0.92), text #1C1610, 15px/500. Disabled until a chip is selected or text entered.
  - "Skip" — plain text button, 14px, rgba(255,255,255,0.4). **Always visible.**
- **Behavior**: Keep this → save entry, dismiss to Home. Skip → dismiss, save nothing. Consider showing the sheet only after sessions ≥ some minimal length (e.g. one full loop) so it never interrupts a false start. Never show it twice for one session.

### 2. Reflections page (`ReflectionsScreen`)
- **Purpose**: The full record. Reached from Home ("See your reflections").
- **Layout**: Standard light screen, safe-area top (~62px), back arrow + italic serif title "How it's been" (17px). 26px horizontal padding.
- **Content**:
  - Intro: "A quiet record of how practice has felt — in your words, only when you choose to leave them." — 15px sans, textSoft, line-height 1.65
  - Groups by loose recency — headers "THIS WEEK" / "EARLIER" — 11px sans 600 uppercase, letter-spacing 0.09em, sage accent. **Deliberately vague grouping; no exact dates.**
  - Entry (18px vertical padding, 1px border-bottom `border`):
    - Day word ("Sunday", "Last Tuesday", "Two weeks ago") — 12px, textMuted
    - Feeling word in curly quotes — 25px Cormorant italic 300, text
    - Context — 13px textSoft — "after {affirmation title or playlist name}"
  - Footer card: bgDim, radius 20, padding 16px 18px — "This page holds only what you choose to add. Nothing is counted, scored, or tracked automatically." — 13px textSoft
- **Empty / first visit**: not yet designed — show the intro + footer card only (they read naturally as an explanation). No illustration, no CTA to "start reflecting".

### 3. Home — section open (`HomeReflectionsOpenScreen`)
- **Purpose**: Ambient surfacing on Home. "How it's been" is the third collapsible row (after "Thought Transformer" and "Favorites").
- **Collapsed**: identical to the other rows — 16px/600 sans title + chevron-down, 16px vertical padding, border-bottom.
- **Expanded**:
  - "Words you've left after listening, lately:" — 14px sans textSoft
  - The 2–3 **most recent distinct** words joined with " · " — 24px Cormorant italic 300, line-height 1.9, text color. E.g. `lighter · steadier · more sure of myself`
  - Link: "See your reflections →" — 14px/500 sans, sage accent, chevron-right 13px → Reflections page
- **No entries yet**: the row still exists but expanding shows only a single quiet line: "After you listen, you can leave a word about how you feel. It gathers here." (13–14px textSoft). No CTA, no badge.

## Interactions & Behavior
- Capture sheet transition: fade/slide up from the immersive player (~300ms ease-out); it shares the dark background so it should feel like the same space.
- Chip selection: instant, no animation needed beyond a color transition (~150ms).
- Reflections page: plain push navigation.
- No notifications, badges, or red dots anywhere for this feature.

## State Management / Data Model
```
Reflection {
  id: string
  word: string            // ≤ ~24 chars, user-chosen or from suggestions
  createdAt: timestamp    // stored precisely, DISPLAYED vaguely
  sourceType: 'affirmation' | 'playlist'
  sourceId: string
  sourceTitle: string     // denormalized for display
}
```
- Suggested chip words: start with the static list `lighter, steadier, calm, tender, strong`. Optional nicety: over time, bias suggestions toward words the user has actually used.
- Display grouping: `createdAt` within last 7 days → "This week"; otherwise "Earlier". Day labels: weekday name if < 7 days; "Last {weekday}" if < 14; "Two weeks ago" / "Last month" beyond. Never render a numeric date in this feature.
- Home section shows the last 3 distinct words by recency.
- Storage: local-first (this is private journal data). If synced, treat as sensitive.
- Deletion: long-press an entry on the Reflections page → delete (confirm with a simple sheet). Users must be able to remove words.

## Assets
None. All icons are inline stroke SVGs (feather-style, 1.8px stroke). Fonts from Google Fonts: Cormorant Garamond (300–600 + italics), Plus Jakarta Sans (300–700).

## Files
- See the v3 package: screens 14–16 in `Resonance Breath Full App v3.html`; components `HomeReflectionsOpenScreen`, `ReflectionsScreen`, `FeelingCaptureScreen` in `resonance-breath-app-v3.jsx`.

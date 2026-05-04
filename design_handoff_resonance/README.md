# Resonance — Design Handoff
## "Breath" Direction · SwiftUI / Xcode

---

## Overview

This package documents the **Breath** design direction for Resonance — a voice-based affirmations app where users record mantras in their own voice and play them back on loop.

The Breath direction is characterised by radical whitespace, large serif italic type, and a warm neutral palette. It feels like a personal journal or poetry book, not a productivity tool.

**Design files in this package:**
- `Resonance Breath Full App.html` — All screens, interactive, viewable in any browser
- `Resonance Fresh Start.html` — The original 3-direction exploration for reference
- `DesignTokens.swift` — Drop into Xcode; all colors, fonts, spacing, radii
- `FontSetup.md` — Step-by-step custom font integration guide
- `README.md` — This document

> These HTML files are **design references** built as prototypes. The task is to **recreate these designs in SwiftUI** using the app's existing architecture, Supabase integration, and Swift patterns — not to ship the HTML.

**Fidelity:** High-fidelity. Colors, typography, spacing, and interaction patterns should be implemented pixel-precisely per the specs below.

---

## Design System

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `resBg` | `#FDFCF9` | Primary app background |
| `resBgWarm` | `#F5EFE6` | Featured content blocks (Try Today, Record text area) |
| `resCard` | `#FFFFFF` | Card surfaces |
| `resBgDim` | `#F0EBE2` | Input fields, inactive areas |
| `resText` | `#1C1A16` | Primary text |
| `resTextSoft` | `#7A7468` | Secondary text, placeholders |
| `resTextMuted` | `#B5ADA3` | Captions, timestamps, muted labels |
| `resSage` | `#4A6741` | Primary accent — active states, CTAs, active nav |
| `resSageSoft` | `#4A6741` @ 10% | Sage tint backgrounds |
| `resWarm` | `#C07A52` | Warm accent — category tags, suggestions, highlights |
| `resWarmSoft` | `#C07A52` @ 10% | Terracotta tint |
| `resBorder` | `#E8E2D9` | Dividers, card borders |
| `resDarkBg` | `#1C1610` | Immersive Player background |
| `resDarkText` | `#FAF4EC` | Text on dark surfaces |
| `resDarkMuted` | `#FAF4EC` @ 28% | Muted text on dark |

### Typography

| Token | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| `resDisplay` | Cormorant Garamond Italic | 32pt | Regular Italic | Page titles (Kate, Library) |
| `resAffirmationLg` | Cormorant Garamond Light Italic | 32pt | Light Italic | Home hero quote |
| `resAffirmationMd` | Cormorant Garamond Light Italic | 26pt | Light Italic | Try Today quote |
| `resAffirmationSm` | Cormorant Garamond Light Italic | 22pt | Light Italic | Record screen text area |
| `resSerif16` | Cormorant Garamond Italic | 16pt | Regular Italic | Playlist names, list items |
| `resBodyMd` | Plus Jakarta Sans Medium | 15pt | Medium | Primary UI labels, body |
| `resBody` | Plus Jakarta Sans Regular | 15pt | Regular | Secondary UI text |
| `resBodySm` | Plus Jakarta Sans Regular | 14pt | Regular | Form inputs, subtext |
| `resSemibold` | Plus Jakarta Sans SemiBold | 15pt | SemiBold | Buttons, key actions |
| `resSemiboldSm` | Plus Jakarta Sans SemiBold | 13pt | SemiBold | Small buttons, tags |
| `resCaption` | Plus Jakarta Sans Regular | 12pt | Regular | Timestamps, metadata |
| `resMicro` | Plus Jakarta Sans SemiBold | 11pt | SemiBold | Section eyebrows (uppercase) |
| `resNavLabel` | Plus Jakarta Sans Regular | 9pt | Regular | Tab bar labels (inactive) |
| `resNavLabelActive` | Plus Jakarta Sans SemiBold | 9pt | SemiBold | Tab bar labels (active) |

**Eyebrow labels** (e.g. "Your practice", "Try today", "Resume") are always:
- `resMicro` / 11pt SemiBold
- Uppercase with `letterSpacing: 0.1em`
- Color: `resWarm` (in warm blocks) or `resSage` (on neutral backgrounds)

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `screen` | 26pt | Horizontal page padding |
| `section` | 32pt | Gap between sections |
| `sectionLg` | 40pt | Top content padding after header |
| `card` | 22pt | Card internal padding |
| `cardSm` | 18pt | Smaller card padding |
| `row` | 16pt | List row vertical padding (top + bottom) |
| `sm` | 8pt | Small gaps between elements |
| `xs` | 4pt | Tight gaps |

### Corner Radii

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 10pt | Tags, toggles, small elements |
| `md` | 14pt | Default cards, inputs |
| `lg` | 20pt | Large cards (hero, warm blocks) |
| `pill` | 999pt | Fully rounded — category chips |
| `full` | 999pt | Circular buttons |

### Navigation Tab Bar

- Height: **80pt** (including safe area)
- 5 items: Home · Library · **[Record CTA]** · Playlists · Profile
- CTA button: 46×46pt, `cornerRadius: 14`, background `resText`, lifted **14pt** above bar
- CTA shadow: `color: .black.opacity(0.22), radius: 7, x: 0, y: 4`
- Active icon: `resSage`, strokeWidth 2.0
- Inactive icon: `resTextMuted`, strokeWidth 1.5
- Tab bar background: `resBg` @ 95% opacity + `ultraThinMaterial` blur
- Top border: 1pt `resBorder`

---

## Screens

### 1 · Home

**Purpose:** Daily entry point. Resume last affirmation, record new, discover today's suggestion.

**Layout (top → bottom):**

```
[Sticky Header — 26pt padding]
  "Good morning"    11pt · SemiBold · resTextMuted · uppercase · tracking 0.04em
  "Kate"            32pt · Cormorant Garamond Italic · resText

[Content — 40pt top padding, 26pt horizontal]
  [Section eyebrow] "Your practice" · resSage
  [Affirmation quote] 32pt Cormorant Light Italic · resText · lineHeight 1.55
  [Play row] 26pt top margin
    Circle button 52×52pt · border 1.5pt resText · Play icon resText
    Title 14pt Medium + "Listened N times" 12pt resTextMuted

[Full-width divider] 36pt margin top/bottom · resBorder

[Record button] 26pt horizontal padding
  Height: 54pt · cornerRadius 14 · border 1.5pt resBorder
  Label: "Record a New Affirmation" · 15pt Medium · resTextSoft
  Leading icon: Mic 16pt · resTextSoft

[Warm block — full bleed, no horizontal padding]
  Background: resBgWarm · padding 28pt horizontal, 28pt vertical
  [Eyebrow] "Try today" · resWarm
  [Quote] 26pt Cormorant Light Italic · resText · lineHeight 1.6
  [Footer row] Category chip + Refresh icon | Record button
    Chip: "Confidence" · 12pt SemiBold · resWarm · background resWarmSoft · cornerRadius pill
    Record button: 34pt height · border 1pt resWarm@50% · resWarm text

[Collapsible sections — 26pt padding, 16pt row height]
  "Thought Transformer" · expanded by default, shows description + link
  "Favorites" · collapsed
  "How it's been" · collapsed
  Dividers: 1pt resBorder
```

**Sticky header:** `background: resBg.opacity(0.96)` + `.ultraThinMaterial` blur effect

---

### 2 · Library

**Purpose:** Browse, search, and play all personal recordings.

**Layout:**

```
[Sticky Header]
  "Library" · resDisplay (32pt Cormorant Italic)
  Segmented control: My Recordings | Suggestions
    Active: white card, shadow 0 1 3 rgba(0,0,0,0.05)
    Inactive: resBgDim background, resTextSoft text
  Search bar: resCard bg · border resBorder · cornerRadius 14
    Icon: Search 16pt resTextMuted
  Tag filters: horizontal scroll, no scrollbar
    Active tag: resText bg, resBg text, cornerRadius pill
    Inactive tag: resSageSoft bg, resTextSoft text

[List — 26pt horizontal padding]
  Row height: ~52pt (16pt top + 16pt bottom padding)
  Divider: 1pt resBorder between rows
  Layout per row:
    Title: 15pt Cormorant Italic · resText · truncated to 1 line
    Meta: duration · 12pt resCaption · resTextMuted | tag · 11pt resSage
    Actions (trailing): Heart icon (filled = resWarm) | Play circle 32×32 resSageSoft | More dots
```

---

### 3 · Record — Ready to Begin

**Purpose:** Compose affirmation text and record voice.

**Layout:**

```
[Navigation bar]
  Back arrow (chevron left) · 20pt · resTextSoft
  "New Affirmation" · 17pt Cormorant Italic · resText

[Affirmation text area] — resBgWarm block · cornerRadius 20 · padding 26×22
  26pt Cormorant Light Italic · resText · lineHeight 1.7
  First word highlighted: background resWarm@20%, cornerRadius 3
  "Edit text" button bottom-left · 12pt resTextMuted

[Mic button — centered, 48pt top margin]
  Outer ring 1: 130pt diameter · border 1pt resSage@18% · breathing animation
  Outer ring 2: 108pt diameter · border 1pt resSage@14% · breathing animation (1s delay)
  Button: 88×88pt · border 2pt resText · background none
    Mic icon: 34pt · resText

[Breathing ring animation]
  Keyframes: scale 1.0→1.06, opacity 0.5→0.9
  Duration: 3.5s · easing: easeInOut · repeat forever · autoreverse

[Settings row — top border resBorder, 40pt margin top]
  Two toggle switches: "Teleprompter" · "Karaoke"
  Toggle on: background resSage
  Toggle off: background resBorder
  Label: 13pt resTextSoft
```

---

### 4 · Record — Save Affirmation

**Purpose:** Review recording, set title and playback mode, save.

**Layout:**

```
[Navigation bar] same style as Record screen

[Waveform player card] — resCard · border resBorder · cornerRadius 20 · padding 18
  Play button 38×38 circle · resText background
  Waveform bars: 45 bars · filled bars resSage · unfilled resText@15%
  Duration: 12pt resTextMuted

[Affirmation review] — resBgWarm block · cornerRadius 20 · padding 20×22
  Eyebrow: "Your affirmation" · resWarm
  Quote: 19pt Cormorant Light Italic · resText

[Settings card] — resCard · border resBorder · cornerRadius 20 · padding 20×22
  Title field: resText text · resBgDim background input
  Playback section: radio group (Play once / Loop 3× / Loop until stopped)
    Radio: 18×18pt circle · selected border resSage + inner dot resSage
    Label: 14pt · selected resText · unselected resTextSoft

[Action buttons — 10pt gap]
  Save: 52pt height · resText background · resBg text · cornerRadius 14
  Try Again: 44pt height · border resBorder · resTextSoft text
  Discard: 44pt height · no border · resWarm@60% text
```

---

### 5 · Immersive Player

**Purpose:** Full-screen focused listening. Activated by tapping play on any recording.

**Implementation:** Present as a full-screen modal (`fullScreenCover`) over the entire app, hiding the tab bar.

**Layout:**

```
[Background]
  Gradient: LinearGradient top→bottom
    #1C1610 (0%) → #141009 (55%) → #0F0C07 (100%)

[Ambient glow — non-interactive overlay]
  Orb 1: 300×300pt radial, resWarm@12%, blur 50pt
    Position: 25% from top, horizontally centered
    Animation: opacity 0.4→0.7, scale 1.0→1.08, 10s easeInOut, repeat
  Orb 2: 180×180pt radial, resSage@10%, blur 40pt
    Position: 40% top, 25% from left
    Same animation, 4s delay

[Close button] — top-right, 16pt from edge
  36×36pt circle · background resDarkText@6% · X icon resDarkText@40%

[Affirmation display — centered, flex 1]
  Eyebrow: recording title · 11pt SemiBold · uppercase · tracking 0.1em · resDarkText@28%
  Quote: 28pt Cormorant Light Italic · resDarkText@92% · lineHeight 1.75 · centered
  28pt margin between eyebrow and quote

[Controls — bottom, 48pt from safe area]
  Progress bar: 1pt height · resDarkText@8% bg
    Fill: resWarm@50% → resWarm@75%
    32pt margin below bar
  Button row: Repeat icon | Play/Pause 64pt circle | Volume icon
    Repeat: 20pt icon · resDarkText@60% · opacity based on loop state
    Play/Pause: 64×64pt circle · resDarkText@8% bg + blur · resDarkText@90% icon
    Volume: 20pt icon · resDarkText@60% · opacity based on active zen track

[Swipe to dismiss]
  SwiftUI: .gesture(DragGesture().onEnded { if $0.translation.height > 100 { dismiss() } })
```

---

### 6 · Playlists

**Purpose:** Browse and manage affirmation playlists.

**Layout:**

```
[Sticky Header]
  "Playlists" · resDisplay (32pt Cormorant Italic)
  "New" button: 34pt height · resText bg · resBg text · cornerRadius pill

[List — 26pt horizontal padding]
  Row height: ~60pt (18pt top + 18pt bottom)
  Divider: 1pt resBorder
  Per row:
    Icon area: 40×40pt · cornerRadius 12 · resBgWarm bg · playlist icon resWarm
    Title: 16pt Cormorant Italic · resText
    Meta: "N affirmations · M:SS" · 12pt resTextMuted
    Play button: 34×34pt circle · resSageSoft bg · Play icon resSage

[Create CTA]
  50pt height · cornerRadius 14 · dashed border 1.5pt resBorder
  "Create a Playlist" · 14pt resTextMuted · Plus icon resTextMuted
  12pt top margin
```

---

### 7 · Profile

**Purpose:** Manage account and app preferences.

**Layout:**

```
[Header — 28pt top padding]
  "Profile" · resDisplay

[User card — resCard, border resBorder, cornerRadius 20]
  Avatar: 52×52pt circle · resBgWarm bg
    Initial: 22pt Cormorant Italic · resWarm
  Name: 17pt Cormorant Italic · resText
  Email: 13pt resTextMuted

[Color theme section]
  Eyebrow: "Colour theme" · resMicro uppercase
  Grid: 6 swatches · 36×36pt circles
    Active: double ring (2.5pt gap then 4pt border matching swatch color)
    Available: Calm (#3B3840), Golden (resWarm), Ocean (#3B9DAD),
               Forest (#4A8C6A), Lavender (#7D5EAA), Rose (#C0506A)

[Settings groups — each group:]
  Eyebrow label above
  resCard container · border resBorder · cornerRadius 20 · 0 16pt internal padding
  Rows:
    Icon: 34×34pt · cornerRadius 9 · resBgDim bg
    Label: 15pt Medium resText
    Detail: 12pt resTextMuted
    Disclosure: ChevronRight | Toggle (44×24pt, resSage when on)
  1pt resBorder divider between rows

[Settings groups]
  "Playback": Default loop mode · Playback timer
  "Preferences": Notifications (toggle on) · Auto-save sounds (toggle on)

[Sign Out button]
  46pt height · border resBorder · 14pt resTextSoft · cornerRadius 14
```

---

### 8 · Onboarding — Step 1: Vibe

**Purpose:** Set the app's tone/personality on first launch.

**Layout:**

```
[Progress dots — top, centered]
  6 dots total · 5pt height · cornerRadius 3
  Active: 24pt wide · resSage@80%
  Completed: 5pt · resSage@30%
  Upcoming: 5pt · resBorder

[Content — 28pt horizontal padding, 28pt top]
  Eyebrow: "Welcome" · resMicro · resSage
  Headline: 34pt Cormorant Light Italic · "How should this space feel?"
  Subtext: 15pt resTextSoft · lineHeight 1.6

[Option pills — 10pt gap, flex column]
  Height: auto · cornerRadius 20 · padding 18pt
  Selected: border 1.5pt resSage@40% · shadow resSage@10%
  Unselected: border 1.5pt resBorder · minimal shadow
  Layout: icon area (42×42pt, cornerRadius 12) + label/sub text + check icon
    Selected icon area: resSageSoft bg · resSage icon
    Selected label: 16pt Cormorant Italic Medium · resText
    Unselected label: 16pt Cormorant Italic · resTextSoft
    Sub: 13pt resTextMuted

  Options:
    Focused — "Clean, disciplined, minimal." — Focus circle icon
    Grounded — "Calm, steady, spacious." — Leaf/nature icon  ← pre-selected in mock
    Energized — "Forward-moving, confident, sharp." — Lightning icon

[Continue button — bottom, 26pt horizontal, 44pt bottom]
  52pt height · resText bg · resBg text · cornerRadius 14
  Disabled when nothing selected: resText@40% opacity
```

---

### 9 · Onboarding — Step 2: Intention

**Purpose:** Capture the user's primary reason for using the app.

**Layout:**

```
[Same progress dots — step 2 active]

[Content — same padding]
  Headline: 34pt Cormorant Light Italic · "What brings you here?"
  Subtext: 15pt resTextSoft · "There's no wrong answer..."

[Option list — 8pt gap]
  Rows: 14pt top + 14pt bottom padding · cornerRadius 20
  Same selected/unselected border treatment as Step 1
  Per row: emoji 22pt | 16pt Cormorant Italic | check icon (if selected)

  Options:
    🌱 Build Confidence    ← pre-selected in mock
    🌊 Find Calm
    💛 Practice Self-Love
    🎯 Sharpen Focus
    🦋 Support Healing
    ✨ Just Exploring

[Continue button — same as Step 1]
```

---

## Interactions & Animations

### Breathing Ring (Record Screen)
```swift
// Two concentric rings, offset by 1s
struct BreathingRing: View {
    @State private var pulsing = false
    var body: some View {
        Circle()
            .stroke(Color.resSage.opacity(pulsing ? 0.9 : 0.5), lineWidth: 1)
            .scaleEffect(pulsing ? 1.06 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: 3.5).repeatForever(autoreverses: true)) {
                    pulsing = true
                }
            }
    }
}
```

### Ambient Glow (Immersive Player)
```swift
// Pulsing radial glow
struct AmbientOrb: View {
    let color: Color
    let delay: Double
    @State private var pulsing = false
    var body: some View {
        Circle()
            .fill(RadialGradient(colors: [color.opacity(0.12), .clear], center: .center, startRadius: 0, endRadius: 150))
            .frame(width: 300, height: 300)
            .scaleEffect(pulsing ? 1.08 : 1.0)
            .opacity(pulsing ? 0.7 : 0.4)
            .blur(radius: 50)
            .onAppear {
                withAnimation(.easeInOut(duration: 10).repeatForever(autoreverses: true).delay(delay)) {
                    pulsing = true
                }
            }
    }
}
```

### Screen Transitions
- Tab switching: `.tabItem` standard (no custom transition needed)
- Record → Save state: slide up from bottom, `.easeOut(duration: 0.35)`
- Immersive Player open: `.fullScreenCover` with slide-up transition
- Immersive Player close on swipe: threshold 100pt downward drag
- Onboarding step advance: fade + translateY(-8pt), duration 0.4s

### Collapsible Sections (Home)
```swift
withAnimation(.easeInOut(duration: 0.3)) {
    isExpanded.toggle()
}
// Content: .transition(.opacity.combined(with: .move(edge: .top)))
```

---

## Navigation Structure

```
TabView
├── HomeView                    (tab: house icon)
├── LibraryView                 (tab: book icon)
│   └── RecordingDetailView     (push)
├── [Record CTA → NewRecordingView]  (tab: mic icon, lifted)
├── PlaylistsView               (tab: list icon)
│   └── PlaylistDetailView      (push)
└── ProfileView                 (tab: person icon)

.fullScreenCover → ImmersivePlayerView
    (presented over entire TabView, global overlay)

.sheet / NavigationStack → OnboardingView
    (presented on first launch, before TabView)
```

---

## Component Inventory

Reusable SwiftUI views to build:

| Component | Used in |
|-----------|---------|
| `AffirmationQuoteView` | Home hero, Try Today, Immersive Player |
| `PlayButtonCircle` | Home, Library rows, Playlists |
| `RecordingRow` | Library, Favorites |
| `WarmBlock` | Home Try Today section |
| `CollapsibleSection` | Home sections |
| `EyebrowLabel` | All screens |
| `CategoryChip` | Library filter, Try Today |
| `ToggleRow` | Profile settings |
| `SettingsCard` | Profile settings groups |
| `BreathingRing` | Record screen |
| `AmbientOrb` | Immersive Player |
| `WaveformBar` | Library rows (optional mini), Record save |
| `OnboardingPill` | Onboarding Step 1 + 2 |
| `ProgressDots` | Onboarding |
| `ResBottomTabBar` | Root navigation |

---

## Assets

| Asset | Notes |
|-------|-------|
| Cormorant Garamond | See `FontSetup.md` |
| Plus Jakarta Sans | See `FontSetup.md` |
| SF Symbols | Use for: chevron.down, chevron.right, arrow.left, ellipsis.vertical, heart, heart.fill, magnifyingglass, arrow.clockwise |
| Custom icons | Mic, Repeat, Volume2 — use SF Symbols alternatives: `mic`, `repeat`, `speaker.wave.2` |

---

## Files

| File | Purpose |
|------|---------|
| `Resonance Breath Full App.html` | All screens, interactive — primary design reference |
| `Resonance Fresh Start.html` | Three initial directions for context |
| `DesignTokens.swift` | Drop into Xcode project — all color/font/spacing tokens |
| `FontSetup.md` | Custom font integration walkthrough |
| `README.md` | This document |

# V3 Design Integration: Minimal / High-End

This PR integrates the complete v3 design handoff, implementing refined visual tokens and the new "How It's Been" reflections feature.

## Overview

The v3 design represents a significant refinement of Resonance's visual language, emphasizing minimalism, accessibility, and thoughtful restraint. This update touches every screen while adding one new feature that embodies the app's philosophy: capturing how practice feels, without pressure or metrics.

## What's New

### 🎨 V3 Design System
- **Hairline dividers** (0.5pt) replace all 1pt dividers for refined hierarchy
- **Improved contrast** - textSoft and textMuted darkened for AA accessibility
- **Typography updates** - Page titles now upright Regular (32pt), list rows Medium Italic (16pt)
- **Tab bar refinements** - Height increased to 92pt, labels to 10.5pt with proper 18pt bottom padding
- **Motion system** - Single unified curve (ResMotion.standard) for all UI transitions
- **Eyebrows** - 10pt semibold, 0.14em tracking throughout

### 🌿 "How It's Been" — Reflections Feature

A qualitative reflection system that captures how listening sessions feel, in the user's own words.

**Core Philosophy**: No streaks, no counts, no scores, no charts, no reminders, and no empty-state guilt. Capture is opt-in per session; skipping forever is valid.

#### Three New Screens

1. **FeelingCaptureView** (Post-Listen Sheet)
   - Dark continuation of immersive player aesthetic
   - 5 suggested feeling words: lighter, steadier, calm, tender, strong
   - Custom text input option (≤24 chars)
   - Only shown after sessions ≥10 seconds
   - "Skip" always visible

2. **ReflectionsView** (Journal Page)
   - Grouped by "THIS WEEK" / "EARLIER" (deliberately vague)
   - Entries show: day word, feeling in curly quotes, context ("after [source]")
   - Long-press to delete with confirmation
   - Footer explaining privacy philosophy
   - Empty state with no guilt, no CTA

3. **HomeView Integration**
   - Third collapsible section (after Thought Transformer, Favorites)
   - Shows 2-3 most recent distinct words joined with " · "
   - Link to full reflections page
   - Empty state: single quiet explanatory line

#### Technical Implementation

- **Data Model**: `Reflection` with vague time display helpers
- **Storage**: Local JSON (sensitive journal data)
- **Source Tracking**: Links to affirmations or playlists
- **AppState Integration**: Full CRUD with persistence

### 🎨 Color System Enforcement

V3 strictly separates accent colors by context:

**Sage Green** (#4A6741)
- Library, Playlists, Reflections, Onboarding
- Represents: growth, collection, reflection

**Terracotta** (#C07A52)
- **Owns the ENTIRE recording flow**: rings, toggles, radios, sliders, waveform
- Try Today block
- Represents: creation, action, warmth

**Rule**: Never mix sage + warm on one screen.

## Files Changed

### New Files
- `FeelingCaptureView.swift` (266 lines) - Post-listen reflection capture
- `ReflectionsView.swift` (179 lines) - Full reflections journal

### Core Updates
- `DesignTokens.swift` - V3 specifications (hairlines, motion, typography)
- `Models.swift` - Reflection model with vague time helpers
- `ResonanceBreathApp.swift` - Reflections persistence and management
- `HomeView.swift` - Reflections section integration, hairline divider
- `ImmersivePlayerView.swift` - FeelingCapture trigger on dismiss
- `RecordView.swift` - All sage → warm per v3 color rules
- `MainTabView.swift` - Hairline border, proper label padding
- `Components.swift` - Hairline component, ResMotion.standard

## Breaking Changes

None. This is purely additive and refinement.

## Design Tokens Updated

```swift
// V3 Changes:
- textSoft: #6E6759 (darkened for AA contrast)
- textMuted: #857B6D (darkened, passes AA at 12pt+)
- Hairline: 0.5pt dividers (was 1pt)
- Eyebrows: 10pt tracking 0.14em (was 11pt, 0.1em)
- Tab bar: 92pt height, 10.5pt labels (was 80pt, 9pt)
- Motion: ResMotion.standard cubic-bezier(0.22, 1, 0.36, 1) @ 500ms
- Motion: ResMotion.breath 3.5s for breathing pulse only
```

## Testing Notes

### To Test FeelingCaptureView
1. Play any affirmation for 10+ seconds
2. Tap close button (X)
3. Should see dark feeling capture sheet
4. Select a word or type custom text
5. Tap "Keep this" → should save and return to home
6. Verify entry appears in "How it's been" section on Home

### To Test ReflectionsView
1. After capturing a few feelings, expand "How it's been" on Home
2. Tap "See your reflections →"
3. Should see grouped entries (THIS WEEK / EARLIER)
4. Long-press any entry → confirm deletion works
5. Verify vague date labels ("Sunday", "Last Tuesday", etc.)

### Visual Review
- All dividers should be subtle hairlines (0.5pt)
- Recording flow uses terracotta throughout (rings, toggles, sliders)
- Library/Playlists use sage
- Tab bar labels properly padded at bottom
- CollapsibleSection expands with smooth fade

## Performance Impact

- Minimal: Reflections stored as local JSON
- No network calls
- Lazy loading of reflection words in HomeView
- All new views use efficient SwiftUI layouts

## Accessibility

- Improved text contrast (textSoft, textMuted now AA compliant)
- Larger tap targets maintained
- Semantic grouping preserved
- Long-press gesture for deletion (standard iOS pattern)

## Commit History

```
e52d14e Apply v3 motion: use ResMotion.standard for UI animations
3362e2f Apply v3 color rules: warm owns recording flow, hairline dividers
5e3321a Integrate FeelingCaptureView with ImmersivePlayerView
1180fbc Add "How It's Been" collapsible section to HomeView
58427f8 Create ReflectionsView journal page
2f1d2b2 Create FeelingCaptureView post-listen reflection sheet
38e43a2 Implement Reflections data model and AppState integration
637498b Apply v3 visual refinements: hairlines, tab bar, typography
102332c Fix v3 token compatibility issues across codebase
59d35e6 Update DesignTokens.swift to v3 specifications
```

## Screenshots

_(Add screenshots after testing)_

1. FeelingCaptureView - Dark sheet with word chips
2. ReflectionsView - Journal page with grouped entries
3. HomeView - "How it's been" section expanded
4. HomeView - "How it's been" section with recent words

## Related

- Design Handoff: `design_handoff_v3/`
- Design Spec: `design_handoff_v3/REFLECTIONS.md`
- Tokens: `design_handoff_v3/DesignTokens.swift`

---

**Ready for**: Testing and visual review
**Builds**: ✅ All successful
**Branch**: `feature/v3-design-integration`
**Base**: `main`

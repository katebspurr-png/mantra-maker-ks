
# Auto-Save Sound Preferences

## Overview
Replace the manual "Save as Default" button with automatic preference saving, and add a toggle in Profile settings to control this behavior.

## Changes

### 1. ZenMusicControl.tsx
- Remove the "Save as Default" button entirely
- Add auto-save logic: whenever `zenEnabled`, `zenTrackId`, `zenVolume`, or `zenDuckingIntensity` changes, check if auto-save is enabled (localStorage key `zen-auto-save-enabled`, default `true`), and if so, persist the current settings to `zen-default-settings` in localStorage automatically
- This will use a `useEffect` that watches the four values and writes to localStorage when auto-save is on

### 2. Profile.tsx (Settings page)
- Add a new settings card titled "Background Sounds" (placed after the Notification Settings section)
- Include a toggle: "Auto-save sound preferences" with a descriptive subtitle: "Automatically save your background sound choices as the default for new mantras"
- The toggle reads/writes to localStorage key `zen-auto-save-enabled`, defaulting to `true`
- When toggled OFF, clear the saved defaults from `zen-default-settings` so new mantras start clean (no background sound)

### 3. NewRecording.tsx
- Current logic already reads `zen-default-settings` from localStorage -- no changes needed here since the auto-save toggle controls whether defaults exist in localStorage

## Technical Details

**localStorage keys:**
- `zen-auto-save-enabled` -- boolean (`"true"` / `"false"`), defaults to `true` if absent
- `zen-default-settings` -- JSON object (existing), written automatically when auto-save is on

**Auto-save in ZenMusicControl:**
```text
useEffect that runs when zenEnabled/zenTrackId/zenVolume/zenDuckingIntensity change:
  - Read zen-auto-save-enabled from localStorage (default true)
  - If enabled, write current settings to zen-default-settings
  - Skip writing on initial mount to avoid overwriting defaults before user interacts
```

**Toggle-off behavior:**
When the user turns off auto-save in settings, `zen-default-settings` is removed from localStorage. New mantras will then be created without any zen defaults (background sounds off, no track selected).

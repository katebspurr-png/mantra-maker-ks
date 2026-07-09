# Custom Font Integration — Xcode

The Resonance "Breath" design uses two custom font families that must be added to your Xcode project.

---

## Fonts Required

| Family | Weights needed | Source |
|--------|---------------|--------|
| **Cormorant Garamond** | Light, Light Italic, Regular, Italic, Medium, Medium Italic, SemiBold, SemiBold Italic | Google Fonts |
| **Plus Jakarta Sans** | Light, Regular, Medium, SemiBold, Bold | Google Fonts |

---

## Step 1 — Download

1. Go to [fonts.google.com/specimen/Cormorant+Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) → Download family
2. Go to [fonts.google.com/specimen/Plus+Jakarta+Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) → Download family
3. Unzip both archives — you'll have `.ttf` files

---

## Step 2 — Add to Xcode Project

1. In Xcode, create a **group** called `Fonts` inside your main app target folder
2. Drag all required `.ttf` files into this group
3. In the "Add Files" dialog, ensure:
   - ✅ **Copy items if needed** is checked
   - ✅ Your **app target** is checked under "Add to targets"

---

## Step 3 — Register in Info.plist

Add a `Fonts provided by application` key (`UIAppFonts`) to your `Info.plist` with an entry for each font file:

```xml
<key>UIAppFonts</key>
<array>
    <string>CormorantGaramond-Light.ttf</string>
    <string>CormorantGaramond-LightItalic.ttf</string>
    <string>CormorantGaramond-Regular.ttf</string>
    <string>CormorantGaramond-Italic.ttf</string>
    <string>CormorantGaramond-Medium.ttf</string>
    <string>CormorantGaramond-MediumItalic.ttf</string>
    <string>CormorantGaramond-SemiBold.ttf</string>
    <string>CormorantGaramond-SemiBoldItalic.ttf</string>
    <string>PlusJakartaSans-Light.ttf</string>
    <string>PlusJakartaSans-Regular.ttf</string>
    <string>PlusJakartaSans-Medium.ttf</string>
    <string>PlusJakartaSans-SemiBold.ttf</string>
    <string>PlusJakartaSans-Bold.ttf</string>
</array>
```

---

## Step 4 — Verify PostScript Names

Font PostScript names (used in `Font.custom()`) sometimes differ from file names. To verify:

```swift
// Add this temporarily to a View's .onAppear to print all registered fonts
UIFont.familyNames.sorted().forEach { family in
    UIFont.fontNames(forFamilyName: family).forEach { print($0) }
}
```

Expected names:
```
CormorantGaramond-Light
CormorantGaramond-LightItalic
CormorantGaramond-Regular
CormorantGaramond-Italic
CormorantGaramond-Medium
CormorantGaramond-MediumItalic
CormorantGaramond-SemiBold
CormorantGaramond-SemiBoldItalic
PlusJakartaSans-Light
PlusJakartaSans-Regular
PlusJakartaSans-Medium
PlusJakartaSans-SemiBold
PlusJakartaSans-Bold
```

Update `DesignTokens.swift` if any names differ.

---

## Step 5 — SwiftUI Usage

```swift
// Affirmation quote
Text(""I am worthy of success."")
    .font(.resAffirmationLg)
    .foregroundColor(.resText)

// Section heading
Text("Library")
    .font(.resDisplay)
    .foregroundColor(.resText)

// UI label
Text("Record a New Affirmation")
    .font(.resBodyMd)
    .foregroundColor(.resTextSoft)
```

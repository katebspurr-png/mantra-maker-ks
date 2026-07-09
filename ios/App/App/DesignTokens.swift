// ─────────────────────────────────────────────────
// Resonance — Design Tokens · v3 "Minimal / High-End"
// Supersedes the earlier DesignTokens.swift
// ─────────────────────────────────────────────────
//
// Usage: Add this file to your Xcode project.
// Fonts require Cormorant Garamond + Plus Jakarta Sans
// (see FontSetup.md for integration guide)
//
// v3 changes from v1:
//   · textSoft / textMuted darkened (accessibility)
//   · Hairline dividers (0.5pt), not 1pt
//   · Eyebrows: 10pt, tracking 0.14em
//   · Tab bar: 4 tabs, 92pt, 10.5pt labels
//   · Motion: one shared curve, fades only
//
// ─────────────────────────────────────────────────

import SwiftUI

// MARK: - Color Palette

extension Color {
    // ── Backgrounds ──────────────────────────────
    /// Primary app background — warm white
    static let resBg         = Color(hex: "#FDFCF9")
    /// Warm cream — featured content blocks
    static let resBgWarm     = Color(hex: "#F5EFE6")
    /// Card surface — pure white (rare in v3; most surfaces are de-boxed)
    static let resCard       = Color(hex: "#FFFFFF")
    /// Dimmed surface — inputs, segmented control track
    static let resBgDim      = Color(hex: "#F0EBE2")

    // ── Text ─────────────────────────────────────
    /// Primary text
    static let resText       = Color(hex: "#1C1A16")
    /// Secondary text — v3: darkened for contrast
    static let resTextSoft   = Color(hex: "#6E6759")
    /// Muted / metadata text — v3: darkened, passes AA at 12pt+
    static let resTextMuted  = Color(hex: "#857B6D")

    // ── Accent — Sage ─────────────────────────────
    /// Sage green. v3 rule: sage owns Library, Playlists,
    /// Reflections, onboarding — anything about growth/collection.
    static let resSage       = Color(hex: "#4A6741")
    static let resSageSoft   = Color(hex: "#4A6741").opacity(0.10)

    // ── Accent — Terracotta ───────────────────────
    /// Terracotta. v3 rule: warm owns the ENTIRE recording flow
    /// (rings, toggles, radios, waveform, rec indicator) and the
    /// Try Today block. NEVER mix sage + warm on one screen.
    static let resWarm       = Color(hex: "#C07A52")
    static let resWarmSoft   = Color(hex: "#C07A52").opacity(0.10)

    // ── Structural ────────────────────────────────
    /// Dividers (draw at 0.5pt), input borders
    static let resBorder     = Color(hex: "#E8E2D9")

    // ── Dark (Immersive Player + Feeling Capture) ─
    static let resDarkBg     = Color(hex: "#1C1610")
    static let resDarkText   = Color(hex: "#FAF4EC")
    static let resDarkMuted  = Color(hex: "#FAF4EC").opacity(0.30)

    // ── Hex initialiser ───────────────────────────
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: (a, r, g, b) = (255, (int >> 8)*17, (int >> 4 & 0xF)*17, (int & 0xF)*17)
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255, blue: Double(b)/255, opacity: Double(a)/255)
    }
}

// MARK: - Typography

extension Font {
    // ── Display — Cormorant Garamond ──────────────
    /// Page titles e.g. "Kate", "Library" (32pt, upright)
    static let resDisplay = Font.custom("CormorantGaramond-Regular", size: 32)
    /// Affirmation quotes — Light Italic
    static let resAffirmationLg = Font.custom("CormorantGaramond-LightItalic", size: 32)
    static let resAffirmationMd = Font.custom("CormorantGaramond-LightItalic", size: 26)
    static let resAffirmationSm = Font.custom("CormorantGaramond-LightItalic", size: 23)
    /// Feeling words (Reflections) — 24–25pt Light Italic
    static let resFeelingWord = Font.custom("CormorantGaramond-LightItalic", size: 25)
    /// List row titles — v3: 16pt Medium Italic (was 15 Regular)
    static let resSerif16 = Font.custom("CormorantGaramond-MediumItalic", size: 16)
    static let resSerif18 = Font.custom("CormorantGaramond-LightItalic", size: 18)

    // ── Body — Plus Jakarta Sans ──────────────────
    static let resBody     = Font.custom("PlusJakartaSans-Regular", size: 15)
    static let resBodyMd   = Font.custom("PlusJakartaSans-Medium",  size: 15)
    static let resBodySm   = Font.custom("PlusJakartaSans-Regular", size: 14)
    static let resSemibold = Font.custom("PlusJakartaSans-SemiBold", size: 15)
    static let resSemiboldSm = Font.custom("PlusJakartaSans-SemiBold", size: 13)
    static let resCaption  = Font.custom("PlusJakartaSans-Regular",  size: 12)
    /// Eyebrows — v3: 10pt (was 11), always uppercase + 0.14em tracking
    static let resMicro    = Font.custom("PlusJakartaSans-SemiBold", size: 10)
    /// Tab bar labels — v3: 10.5pt (was 9)
    static let resNavLabel = Font.custom("PlusJakartaSans-Regular",  size: 10.5)
    static let resNavLabelActive = Font.custom("PlusJakartaSans-SemiBold", size: 10.5)
}

// Eyebrow helper — the canonical treatment
struct EyebrowLabel: View {
    let text: String
    var color: Color = .resSage
    
    init(_ text: String, color: Color = .resSage) {
        self.text = text
        self.color = color
    }
    
    var body: some View {
        Text(text.uppercased())
            .font(.resMicro)
            .kerning(1.4)          // ≈ 0.14em at 10pt
            .foregroundColor(color)
    }
}

// MARK: - Spacing & Layout

enum ResSpacing {
    static let screen: CGFloat = 26      // horizontal page padding
    static let safeTop: CGFloat = 66     // content top (below status bar)
    static let section: CGFloat = 32
    static let sectionLg: CGFloat = 40
    static let card: CGFloat = 22
    static let row: CGFloat = 16         // list row vertical padding
    static let sm: CGFloat = 8
    static let xs: CGFloat = 4
}

// MARK: - Corner Radii

enum ResRadius {
    static let sm:   CGFloat = 10
    static let md:   CGFloat = 14   // buttons, inputs
    static let lg:   CGFloat = 20   // the one warm block per screen
    static let full: CGFloat = 999
}

// MARK: - Hairlines (v3)

/// All dividers are hairlines. Use in place of Divider().
struct Hairline: View {
    var body: some View {
        Rectangle().fill(Color.resBorder).frame(height: 0.5)
    }
}

// MARK: - Motion (v3)

/// ONE shared curve for everything. Fades, not slides.
/// The only other rhythm in the app is the 3.5s breathing tempo.
enum ResMotion {
    /// cubic-bezier(0.22, 1, 0.36, 1) @ 500ms
    static let standard = Animation.timingCurve(0.22, 1, 0.36, 1, duration: 0.5)
    /// Breathing pulse (record rings, ambient orbs)
    static let breath = Animation.easeInOut(duration: 3.5).repeatForever(autoreverses: true)
}

// MARK: - Tab Bar (v3: 4 tabs)

enum ResTabBar {
    /// Home · Library · [Record CTA] · Profile
    static let height:    CGFloat = 92
    static let labelPadBottom: CGFloat = 18
    static let ctaSize:   CGFloat = 46
    static let ctaRadius: CGFloat = 14
    static let ctaLift:   CGFloat = 14
}

// MARK: - Buttons (v3: exactly two styles)

/// Style 1 — Filled dark primary. The ONLY filled button.
struct ResPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.resBodyMd)
            .foregroundColor(.resBg)
            .frame(maxWidth: .infinity, minHeight: 52)
            .background(Color.resText)
            .cornerRadius(ResRadius.md)
            .opacity(configuration.isPressed ? 0.85 : 1)
    }
}

/// Style 2 — Quiet text link. Everything else.
/// (No outlined pills, no dashed boxes — removed in v3.)
struct ResTextButtonStyle: ButtonStyle {
    var color: Color = .resTextSoft
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.custom("PlusJakartaSans-Medium", size: 14))
            .foregroundColor(color)
            .opacity(configuration.isPressed ? 0.6 : 1)
    }
}

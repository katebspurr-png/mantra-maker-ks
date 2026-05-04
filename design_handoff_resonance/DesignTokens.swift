// ─────────────────────────────────────────────────
// Resonance — Design Tokens
// "Breath" direction · Generated from design mocks
// ─────────────────────────────────────────────────
//
// Usage: Add this file to your Xcode project.
// Fonts require Cormorant Garamond + Plus Jakarta Sans
// (see FontSetup.md for integration guide)
//
// ─────────────────────────────────────────────────

import SwiftUI

// MARK: - Color Palette

extension Color {
    // ── Backgrounds ──────────────────────────────
    /// Primary app background — warm white
    static let resBg         = Color(hex: "#FDFCF9")
    /// Warm cream — used for featured content blocks
    static let resBgWarm     = Color(hex: "#F5EFE6")
    /// Card surface — pure white
    static let resCard       = Color(hex: "#FFFFFF")
    /// Dimmed surface — inputs, inactive areas
    static let resBgDim      = Color(hex: "#F0EBE2")

    // ── Text ─────────────────────────────────────
    /// Primary text
    static let resText       = Color(hex: "#1C1A16")
    /// Secondary text
    static let resTextSoft   = Color(hex: "#7A7468")
    /// Muted / placeholder text
    static let resTextMuted  = Color(hex: "#B5ADA3")

    // ── Accent — Sage ─────────────────────────────
    /// Primary action accent (sage green)
    static let resSage       = Color(hex: "#4A6741")
    /// Sage tint for backgrounds
    static let resSageSoft   = Color(hex: "#4A6741").opacity(0.10)

    // ── Accent — Terracotta ───────────────────────
    /// Warm accent (terracotta) — suggestions, categories
    static let resWarm       = Color(hex: "#C07A52")
    /// Terracotta tint
    static let resWarmSoft   = Color(hex: "#C07A52").opacity(0.10)

    // ── Structural ────────────────────────────────
    /// Dividers, card borders
    static let resBorder     = Color(hex: "#E8E2D9")

    // ── Dark (Immersive Player) ───────────────────
    /// Immersive player background — dark warm
    static let resDarkBg     = Color(hex: "#1C1610")
    /// Primary text on dark surfaces
    static let resDarkText   = Color(hex: "#FAF4EC")
    /// Muted text on dark surfaces
    static let resDarkMuted  = Color(hex: "#FAF4EC").opacity(0.28)

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

// Custom font names (after adding to project — see FontSetup.md)
// Family: Cormorant Garamond
//   CormorantGaramond-Light
//   CormorantGaramond-LightItalic
//   CormorantGaramond-Regular
//   CormorantGaramond-Italic          ← primary display font
//   CormorantGaramond-Medium
//   CormorantGaramond-MediumItalic
//   CormorantGaramond-SemiBold
//   CormorantGaramond-SemiBoldItalic
// Family: Plus Jakarta Sans
//   PlusJakartaSans-Light
//   PlusJakartaSans-Regular
//   PlusJakartaSans-Medium
//   PlusJakartaSans-SemiBold
//   PlusJakartaSans-Bold

extension Font {
    // ── Display — Cormorant Garamond Italic ───────
    /// Page titles e.g. "Kate", "Library" (32pt)
    static let resDisplay = Font.custom("CormorantGaramond-Italic", size: 32)
    /// Large affirmation quotes (28–34pt depending on length)
    static let resAffirmationLg = Font.custom("CormorantGaramond-LightItalic", size: 32)
    static let resAffirmationMd = Font.custom("CormorantGaramond-LightItalic", size: 26)
    static let resAffirmationSm = Font.custom("CormorantGaramond-LightItalic", size: 22)
    /// Compact serif italic — recording rows, playlist names
    static let resSerif16 = Font.custom("CormorantGaramond-Italic", size: 16)
    static let resSerif18 = Font.custom("CormorantGaramond-LightItalic", size: 18)
    static let resSerif19 = Font.custom("CormorantGaramond-LightItalic", size: 19)

    // ── Body — Plus Jakarta Sans ──────────────────
    /// Primary body text
    static let resBody     = Font.custom("PlusJakartaSans-Regular", size: 15)
    static let resBodyMd   = Font.custom("PlusJakartaSans-Medium",  size: 15)
    static let resBodySm   = Font.custom("PlusJakartaSans-Regular", size: 14)
    /// Buttons, section labels
    static let resSemibold = Font.custom("PlusJakartaSans-SemiBold", size: 15)
    static let resSemiboldSm = Font.custom("PlusJakartaSans-SemiBold", size: 13)
    /// Tab bar labels, tags, micro copy
    static let resCaption  = Font.custom("PlusJakartaSans-Regular",  size: 12)
    static let resMicro    = Font.custom("PlusJakartaSans-SemiBold", size: 11)
    /// Tab bar nav labels
    static let resNavLabel = Font.custom("PlusJakartaSans-Regular",  size: 9)
    static let resNavLabelActive = Font.custom("PlusJakartaSans-SemiBold", size: 9)
}

// MARK: - Spacing & Layout

enum ResSpacing {
    /// Horizontal screen padding (26pt)
    static let screen: CGFloat = 26
    /// Gap between major sections (32–40pt)
    static let section: CGFloat = 32
    static let sectionLg: CGFloat = 40
    /// Card internal padding
    static let card: CGFloat = 22
    static let cardSm: CGFloat = 18
    /// Row vertical padding (both sides)
    static let row: CGFloat = 16
    /// Small element gap
    static let sm: CGFloat = 8
    static let xs: CGFloat = 4
    /// Stack gap between form elements
    static let formGap: CGFloat = 10
}

// MARK: - Corner Radii

enum ResRadius {
    static let sm:   CGFloat = 10
    static let md:   CGFloat = 14   // default card
    static let lg:   CGFloat = 20   // large cards
    static let pill: CGFloat = 20   // tags, small buttons
    static let full: CGFloat = 999  // circular buttons
}

// MARK: - Tab Bar

enum ResTabBar {
    static let height:       CGFloat = 80
    /// CTA (Record) button size
    static let ctaSize:      CGFloat = 46
    static let ctaRadius:    CGFloat = 14
    /// CTA lifts above the bar by this amount
    static let ctaLift:      CGFloat = 14
}

// MARK: - Shadows

struct ResShadow: ViewModifier {
    func body(content: Content) -> some View {
        content.shadow(color: .black.opacity(0.04), radius: 3, x: 0, y: 1)
    }
}

struct ResCardShadow: ViewModifier {
    func body(content: Content) -> some View {
        content.shadow(color: .black.opacity(0.05), radius: 6, x: 0, y: 2)
    }
}

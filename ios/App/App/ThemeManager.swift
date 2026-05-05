// ─────────────────────────────────────────────────
// Resonance — Theme Manager
// Handles color themes and dark mode support
// ─────────────────────────────────────────────────

import SwiftUI

// MARK: - Theme

enum AppTheme: String, CaseIterable, Identifiable {
    case sage = "Sage"
    case lavender = "Lavender"
    case ocean = "Ocean"
    case sunset = "Sunset"
    case forest = "Forest"
    
    var id: String { rawValue }
    
    var displayName: String { rawValue }
    
    var icon: String {
        switch self {
        case .sage: return "🌿"
        case .lavender: return "💜"
        case .ocean: return "🌊"
        case .sunset: return "🌅"
        case .forest: return "🌲"
        }
    }
    
    // Primary accent color
    var primaryColor: Color {
        switch self {
        case .sage: return Color(hex: "#4A6741")
        case .lavender: return Color(hex: "#8B7AB8")
        case .ocean: return Color(hex: "#4A7C8B")
        case .sunset: return Color(hex: "#C07A52")
        case .forest: return Color(hex: "#3D5A3D")
        }
    }
    
    // Secondary accent color
    var secondaryColor: Color {
        switch self {
        case .sage: return Color(hex: "#C07A52")
        case .lavender: return Color(hex: "#D4A5A5")
        case .ocean: return Color(hex: "#E8A87C")
        case .sunset: return Color(hex: "#E8A87C")
        case .forest: return Color(hex: "#8B9D77")
        }
    }
}

// MARK: - Color Scheme Mode

enum ColorSchemeMode: String, CaseIterable {
    case light = "Light"
    case dark = "Dark"
    case system = "System"
    
    var displayName: String { rawValue }
    
    var icon: String {
        switch self {
        case .light: return "sun.max.fill"
        case .dark: return "moon.fill"
        case .system: return "iphone"
        }
    }
    
    func colorScheme(for systemScheme: ColorScheme?) -> ColorScheme? {
        switch self {
        case .light: return .light
        case .dark: return .dark
        case .system: return systemScheme
        }
    }
}

// MARK: - Theme Manager

class ThemeManager: ObservableObject {
    @Published var selectedTheme: AppTheme {
        didSet {
            UserDefaults.standard.set(selectedTheme.rawValue, forKey: "selectedTheme")
        }
    }
    
    @Published var colorSchemeMode: ColorSchemeMode {
        didSet {
            UserDefaults.standard.set(colorSchemeMode.rawValue, forKey: "colorSchemeMode")
        }
    }
    
    init() {
        // Load saved theme
        if let savedTheme = UserDefaults.standard.string(forKey: "selectedTheme"),
           let theme = AppTheme(rawValue: savedTheme) {
            self.selectedTheme = theme
        } else {
            self.selectedTheme = .sage
        }
        
        // Load saved color scheme mode
        if let savedMode = UserDefaults.standard.string(forKey: "colorSchemeMode"),
           let mode = ColorSchemeMode(rawValue: savedMode) {
            self.colorSchemeMode = mode
        } else {
            self.colorSchemeMode = .system
        }
    }
    
    func preferredColorScheme(for systemScheme: ColorScheme?) -> ColorScheme? {
        colorSchemeMode.colorScheme(for: systemScheme)
    }
}

// MARK: - Semantic Colors (Theme-aware)

extension Color {
    // MARK: - Light Mode Colors
    
    private static func lightBg(theme: AppTheme) -> Color {
        Color(hex: "#FDFCF9")
    }
    
    private static func lightBgWarm(theme: AppTheme) -> Color {
        Color(hex: "#F5EFE6")
    }
    
    private static func lightCard(theme: AppTheme) -> Color {
        Color(hex: "#FFFFFF")
    }
    
    private static func lightBgDim(theme: AppTheme) -> Color {
        Color(hex: "#F0EBE2")
    }
    
    private static func lightText(theme: AppTheme) -> Color {
        Color(hex: "#1C1A16")
    }
    
    private static func lightTextSoft(theme: AppTheme) -> Color {
        Color(hex: "#7A7468")
    }
    
    private static func lightTextMuted(theme: AppTheme) -> Color {
        Color(hex: "#B5ADA3")
    }
    
    private static func lightBorder(theme: AppTheme) -> Color {
        Color(hex: "#E8E2D9")
    }
    
    // MARK: - Dark Mode Colors
    
    private static func darkBg(theme: AppTheme) -> Color {
        Color(hex: "#0F0C07")
    }
    
    private static func darkBgWarm(theme: AppTheme) -> Color {
        Color(hex: "#1C1610")
    }
    
    private static func darkCard(theme: AppTheme) -> Color {
        Color(hex: "#1C1814")
    }
    
    private static func darkBgDim(theme: AppTheme) -> Color {
        Color(hex: "#252218")
    }
    
    private static func darkText(theme: AppTheme) -> Color {
        Color(hex: "#FAF4EC")
    }
    
    private static func darkTextSoft(theme: AppTheme) -> Color {
        Color(hex: "#B5ADA3")
    }
    
    private static func darkTextMuted(theme: AppTheme) -> Color {
        Color(hex: "#7A7468")
    }
    
    private static func darkBorder(theme: AppTheme) -> Color {
        Color(hex: "#2A2620")
    }
    
    // MARK: - Semantic Color Accessors
    
    static func themedBg(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkBg(theme: theme) : lightBg(theme: theme)
    }
    
    static func themedBgWarm(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkBgWarm(theme: theme) : lightBgWarm(theme: theme)
    }
    
    static func themedCard(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkCard(theme: theme) : lightCard(theme: theme)
    }
    
    static func themedBgDim(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkBgDim(theme: theme) : lightBgDim(theme: theme)
    }
    
    static func themedText(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkText(theme: theme) : lightText(theme: theme)
    }
    
    static func themedTextSoft(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkTextSoft(theme: theme) : lightTextSoft(theme: theme)
    }
    
    static func themedTextMuted(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkTextMuted(theme: theme) : lightTextMuted(theme: theme)
    }
    
    static func themedBorder(theme: AppTheme, colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? darkBorder(theme: theme) : lightBorder(theme: theme)
    }
    
    static func themedPrimary(theme: AppTheme) -> Color {
        theme.primaryColor
    }
    
    static func themedSecondary(theme: AppTheme) -> Color {
        theme.secondaryColor
    }
    
    static func themedPrimarySoft(theme: AppTheme) -> Color {
        theme.primaryColor.opacity(0.10)
    }
    
    static func themedSecondarySoft(theme: AppTheme) -> Color {
        theme.secondaryColor.opacity(0.10)
    }
}

// MARK: - Environment Key

struct ThemeKey: EnvironmentKey {
    static let defaultValue: AppTheme = .sage
}

extension EnvironmentValues {
    var appTheme: AppTheme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

// MARK: - View Extension

extension View {
    func themedColors(_ theme: AppTheme) -> some View {
        environment(\.appTheme, theme)
    }
}

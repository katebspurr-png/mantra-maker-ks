// ─────────────────────────────────────────────────
// Resonance — Theme Settings View
// Allows users to customize app theme and dark mode
// ─────────────────────────────────────────────────

import SwiftUI

struct ThemeSettingsView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme
    @EnvironmentObject var themeManager: ThemeManager
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Color Scheme Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Appearance")
                            .font(.resBodyMd)
                            .foregroundColor(.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        
                        VStack(spacing: 12) {
                            ForEach(ColorSchemeMode.allCases, id: \.self) { mode in
                                ColorSchemeButton(
                                    mode: mode,
                                    isSelected: themeManager.colorSchemeMode == mode
                                ) {
                                    HapticManager.shared.selection()
                                    themeManager.colorSchemeMode = mode
                                }
                            }
                        }
                    }
                    
                    // Divider
                    Rectangle()
                        .fill(Color.themedBorder(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        .frame(height: 1)
                    
                    // Color Theme Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Color Theme")
                            .font(.resBodyMd)
                            .foregroundColor(.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        
                        VStack(spacing: 12) {
                            ForEach(AppTheme.allCases) { theme in
                                ThemeButton(
                                    theme: theme,
                                    isSelected: themeManager.selectedTheme == theme
                                ) {
                                    HapticManager.shared.selection()
                                    themeManager.selectedTheme = theme
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                .padding(.bottom, 40)
            }
            .background(Color.themedBg(theme: themeManager.selectedTheme, colorScheme: colorScheme))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Theme")
                        .font(.resSerif17)
                        .foregroundColor(.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        HapticManager.shared.buttonTap()
                        dismiss()
                    }) {
                        Text("Done")
                            .font(.resBodyMd)
                            .foregroundColor(.themedPrimary(theme: themeManager.selectedTheme))
                    }
                }
            }
        }
    }
}

// MARK: - Color Scheme Button

struct ColorSchemeButton: View {
    @Environment(\.colorScheme) var colorScheme
    @EnvironmentObject var themeManager: ThemeManager
    
    let mode: ColorSchemeMode
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    Circle()
                        .fill(isSelected ? 
                              Color.themedPrimary(theme: themeManager.selectedTheme).opacity(0.12) :
                              Color.themedBgDim(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: mode.icon)
                        .font(.system(size: 18))
                        .foregroundColor(isSelected ?
                                        Color.themedPrimary(theme: themeManager.selectedTheme) :
                                        Color.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                }
                
                // Label
                Text(mode.displayName)
                    .font(.resBody)
                    .foregroundColor(isSelected ?
                                    Color.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme) :
                                    Color.themedTextSoft(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                
                Spacer()
                
                // Checkmark
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(Color.themedPrimary(theme: themeManager.selectedTheme))
                }
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(isSelected ?
                       Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme) :
                       Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.md)
                    .stroke(isSelected ?
                           Color.themedPrimary(theme: themeManager.selectedTheme).opacity(0.2) :
                           Color.themedBorder(theme: themeManager.selectedTheme, colorScheme: colorScheme),
                           lineWidth: 1)
            )
            .cornerRadius(ResRadius.md)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Theme Button

struct ThemeButton: View {
    @Environment(\.colorScheme) var colorScheme
    @EnvironmentObject var themeManager: ThemeManager
    
    let theme: AppTheme
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Color preview circles
                HStack(spacing: -8) {
                    Circle()
                        .fill(theme.primaryColor)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Circle()
                                .stroke(Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme), lineWidth: 2)
                        )
                    
                    Circle()
                        .fill(theme.secondaryColor)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Circle()
                                .stroke(Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme), lineWidth: 2)
                        )
                }
                
                // Icon and Label
                HStack(spacing: 8) {
                    Text(theme.icon)
                        .font(.system(size: 20))
                    
                    Text(theme.displayName)
                        .font(.resBody)
                        .foregroundColor(isSelected ?
                                        Color.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme) :
                                        Color.themedTextSoft(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                }
                
                Spacer()
                
                // Checkmark
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(Color.themedPrimary(theme: themeManager.selectedTheme))
                }
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(isSelected ?
                       Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme) :
                       Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.md)
                    .stroke(isSelected ?
                           theme.primaryColor.opacity(0.3) :
                           Color.themedBorder(theme: themeManager.selectedTheme, colorScheme: colorScheme),
                           lineWidth: isSelected ? 2 : 1)
            )
            .cornerRadius(ResRadius.md)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var appState: AppState
    @Environment(\.colorScheme) var colorScheme
    @State private var showingThemeSettings = false
    @State private var showingMyAffirmations = false
    @State private var showingImportRecordings = false
    @State private var notificationsEnabled = true
    @State private var autoSaveSounds = true
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Text("Profile")
                    .font(.resDisplay)
                    .foregroundColor(.resText)
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.top, 28)
                    .padding(.bottom, 24)
                
                // User Card
                userCard
                    .padding(.horizontal, ResSpacing.screen)
                
                // Import Recordings Button
                Button(action: {
                    HapticManager.shared.buttonTap()
                    showingImportRecordings = true
                }) {
                    HStack(spacing: 16) {
                        Image(systemName: "square.and.arrow.down")
                            .font(.system(size: 20))
                            .foregroundColor(themeManager.selectedTheme.primaryColor)
                            .frame(width: 28, height: 28)
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Import Recordings")
                                .font(.resBodyMd)
                                .foregroundColor(.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                            Text("Bring in your existing recordings")
                                .font(.resCaption)
                                .foregroundColor(.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14))
                            .foregroundColor(.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 16)
                    .background(Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                    .overlay(
                        RoundedRectangle(cornerRadius: ResRadius.md)
                            .stroke(Color.themedBorder(theme: themeManager.selectedTheme, colorScheme: colorScheme), lineWidth: 1)
                    )
                    .cornerRadius(ResRadius.md)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                
                // My Affirmations Button
                Button(action: {
                    HapticManager.shared.buttonTap()
                    showingMyAffirmations = true
                }) {
                    HStack(spacing: 16) {
                        Image(systemName: "layers.fill")
                            .font(.system(size: 20))
                            .foregroundColor(themeManager.selectedTheme.primaryColor)
                            .frame(width: 28, height: 28)
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text("My Affirmations")
                                .font(.resBodyMd)
                                .foregroundColor(.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                            
                            let affirmationCount = Dictionary(grouping: appState.recordings.filter { $0.affirmationId != nil }) { $0.affirmationId! }.count
                            Text("\(affirmationCount) \(affirmationCount == 1 ? "affirmation" : "affirmations") · Multiple takes")
                                .font(.resCaption)
                                .foregroundColor(.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14))
                            .foregroundColor(.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 16)
                    .background(Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                    .overlay(
                        RoundedRectangle(cornerRadius: ResRadius.md)
                            .stroke(Color.themedBorder(theme: themeManager.selectedTheme, colorScheme: colorScheme), lineWidth: 1)
                    )
                    .cornerRadius(ResRadius.md)
                }
                .buttonStyle(PlainButtonStyle())
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                
                // Theme Settings Button
                Button(action: {
                    HapticManager.shared.buttonTap()
                    showingThemeSettings = true
                }) {
                    HStack(spacing: 16) {
                        // Theme preview
                        HStack(spacing: -8) {
                            Circle()
                                .fill(themeManager.selectedTheme.primaryColor)
                                .frame(width: 28, height: 28)
                            Circle()
                                .fill(themeManager.selectedTheme.secondaryColor)
                                .frame(width: 28, height: 28)
                        }
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Theme")
                                .font(.resBodyMd)
                                .foregroundColor(.themedText(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                            Text("\(themeManager.selectedTheme.icon) \(themeManager.selectedTheme.displayName) · \(themeManager.colorSchemeMode.displayName)")
                                .font(.resCaption)
                                .foregroundColor(.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14))
                            .foregroundColor(.themedTextMuted(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 16)
                    .background(Color.themedCard(theme: themeManager.selectedTheme, colorScheme: colorScheme))
                    .overlay(
                        RoundedRectangle(cornerRadius: ResRadius.md)
                            .stroke(Color.themedBorder(theme: themeManager.selectedTheme, colorScheme: colorScheme), lineWidth: 1)
                    )
                    .cornerRadius(ResRadius.md)
                }
                .buttonStyle(PlainButtonStyle())
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                
                // Playback Settings
                settingsGroup(
                    title: "Playback",
                    rows: [
                        SettingRow(
                            icon: "repeat",
                            label: "Default loop",
                            detail: "Loop until stopped"
                        ),
                        SettingRow(
                            icon: "clock",
                            label: "Playback timer",
                            detail: "No limit"
                        )
                    ]
                )
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 24)
                
                // Preferences
                settingsGroup(
                    title: "Preferences",
                    rows: [
                        SettingRow(
                            icon: "bell",
                            label: "Notifications",
                            detail: "Gentle daily invitation",
                            toggle: $notificationsEnabled
                        ),
                        SettingRow(
                            icon: "speaker.wave.2",
                            label: "Auto-save sounds",
                            detail: "Remember my ambient choices",
                            toggle: $autoSaveSounds
                        )
                    ]
                )
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 24)
                
                // Sign Out
                Button(action: {}) {
                    Text("Sign Out")
                        .font(.resBodySm)
                        .foregroundColor(.resTextSoft)
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: ResRadius.md)
                                .stroke(Color.resBorder, lineWidth: 1)
                        )
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 24)
            }
            .padding(.bottom, ResTabBar.height + 20)
        }
        .background(Color.themedBg(theme: themeManager.selectedTheme, colorScheme: colorScheme))
        .sheet(isPresented: $showingThemeSettings) {
            ThemeSettingsView()
                .environmentObject(themeManager)
        }
        .sheet(isPresented: $showingMyAffirmations) {
            MyAffirmationsView()
                .environmentObject(appState)
        }
        .sheet(isPresented: $showingImportRecordings) {
            ImportRecordingsView()
                .environmentObject(appState)
        }
    }
    
    var userCard: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.resBgWarm)
                    .frame(width: 52, height: 52)
                
                Text("K")
                    .font(.custom("CormorantGaramond-Italic", size: 22))
                    .foregroundColor(.resWarm)
            }
            
            VStack(alignment: .leading, spacing: 1) {
                Text("Kate")
                    .font(.resSerif17)
                    .foregroundColor(.resText)
                
                Text("kate@example.com")
                    .font(.resSemiboldSm)
                    .foregroundColor(.resTextMuted)
            }
            
            Spacer()
        }
        .padding(20)
        .background(Color.resCard)
        .overlay(
            RoundedRectangle(cornerRadius: ResRadius.lg)
                .stroke(Color.resBorder, lineWidth: 1)
        )
        .cornerRadius(ResRadius.lg)
    }
    

    func settingsGroup(title: String, rows: [SettingRow]) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.resMicro)
                .foregroundColor(.resTextMuted)
                .kerning(0.07)
            
            VStack(spacing: 0) {
                ForEach(Array(rows.enumerated()), id: \.offset) { index, row in
                    if index > 0 {
                        Rectangle()
                            .fill(Color.resBorder)
                            .frame(height: 1)
                            .padding(.leading, 48)
                    }
                    
                    if row.toggle != nil {
                        ToggleRow(
                            icon: row.icon,
                            label: row.label,
                            detail: row.detail,
                            isOn: row.toggle!
                        )
                        .padding(.horizontal, 16)
                    } else {
                        settingRowView(row: row)
                    }
                }
            }
            .background(Color.resCard)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.lg)
                    .stroke(Color.resBorder, lineWidth: 1)
            )
            .cornerRadius(ResRadius.lg)
        }
    }
    
    func settingRowView(row: SettingRow) -> some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 9)
                    .fill(Color.resBgDim)
                    .frame(width: 34, height: 34)
                
                Image(systemName: row.icon)
                    .font(.system(size: 15))
                    .foregroundColor(.resTextSoft)
            }
            
            VStack(alignment: .leading, spacing: 1) {
                Text(row.label)
                    .font(.resBodyMd)
                    .foregroundColor(.resText)
                
                if let detail = row.detail {
                    Text(detail)
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.resTextMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

// MARK: - Setting Row Model
struct SettingRow {
    let icon: String
    let label: String
    let detail: String?
    var toggle: Binding<Bool>? = nil
}

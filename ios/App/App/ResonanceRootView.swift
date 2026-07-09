import SwiftUI
import UIKit

/// Root view that manages app state and navigation between onboarding and main app
struct ResonanceRootView: View {
    @StateObject private var appState = AppState()
    @StateObject private var themeManager = ThemeManager()
    @Environment(\.colorScheme) var systemColorScheme
    
    var body: some View {
        Group {
            if appState.hasCompletedOnboarding {
                MainTabView()
                    .environmentObject(appState)
                    .environmentObject(themeManager)
            } else {
                OnboardingFlow()
                    .environmentObject(appState)
                    .environmentObject(themeManager)
            }
        }
        .preferredColorScheme(themeManager.preferredColorScheme(for: systemColorScheme))
        .onAppear {
            printAvailableFonts()
        }
    }
    
    func printAvailableFonts() {
        print("===== AVAILABLE FONTS =====")
        for family in UIFont.familyNames.sorted() {
            print("Family: \(family)")
            for name in UIFont.fontNames(forFamilyName: family) {
                print("  - \(name)")
            }
        }
        print("===========================")
    }
}

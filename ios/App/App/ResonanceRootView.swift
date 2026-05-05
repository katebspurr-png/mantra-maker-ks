import SwiftUI
import UIKit

/// Root view that manages app state and navigation between onboarding and main app
struct ResonanceRootView: View {
    @StateObject private var appState = AppState()
    
    var body: some View {
        Group {
            if appState.hasCompletedOnboarding {
                MainTabView()
                    .environmentObject(appState)
            } else {
                OnboardingFlow()
                    .environmentObject(appState)
            }
        }
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

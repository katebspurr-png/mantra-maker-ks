import SwiftUI

// Note: This app uses @UIApplicationMain in AppDelegate.swift
// To use this SwiftUI version, create a SceneDelegate or modify AppDelegate
struct ResonanceBreathApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            if appState.hasCompletedOnboarding {
                MainTabView()
                    .environmentObject(appState)
            } else {
                OnboardingFlow()
                    .environmentObject(appState)
            }
        }
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var hasCompletedOnboarding: Bool = false
    @Published var recordings: [Recording] = Recording.sampleData
    @Published var playlists: [Playlist] = Playlist.sampleData
    @Published var currentlyPlaying: Recording?
    @Published var showingImmersivePlayer: Bool = false
    
    func playRecording(_ recording: Recording) {
        currentlyPlaying = recording
        showingImmersivePlayer = true
    }
    
    func toggleFavorite(_ recording: Recording) {
        if let index = recordings.firstIndex(where: { $0.id == recording.id }) {
            recordings[index].isFavorite.toggle()
        }
    }
}

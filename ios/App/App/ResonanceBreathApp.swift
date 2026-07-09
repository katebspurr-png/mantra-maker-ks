import SwiftUI
import CryptoKit

// Note: This app uses @UIApplicationMain in AppDelegate.swift
// To use this SwiftUI version, create a SceneDelegate or modify AppDelegate
struct ResonanceBreathApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var themeManager = ThemeManager()
    @Environment(\.colorScheme) var systemColorScheme
    
    var body: some Scene {
        WindowGroup {
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
        }
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var hasCompletedOnboarding: Bool {
        didSet {
            UserDefaults.standard.set(hasCompletedOnboarding, forKey: "hasCompletedOnboarding")
        }
    }
    @Published var recordings: [Recording] = []
    @Published var playlists: [Playlist] = Playlist.sampleData
    @Published var currentlyPlaying: Recording?
    @Published var showingImmersivePlayer: Bool = false

    @Published private(set) var playbackQueue: [String] = []
    @Published private(set) var playbackQueueIndex: Int = 0
    @Published var isPlaylistLooping: Bool = false
    
    // Teleprompter WPM settings
    @Published var teleprompterWPM: Int = 120
    @Published var calibratedWPM: Int?
    @Published var calibratedAt: Date?
    
    let audioManager = AudioManager()
    
    init() {
        // Load onboarding status
        self.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
        
        // Load recordings from persistent storage
        loadRecordings()
        
        // Clean up any recordings that don't have audio files
        cleanupInvalidRecordings()
        
        // Load playlists
        loadPlaylists()
        
        // Load WPM settings
        loadWPMSettings()

        audioManager.onPlaybackFinished = { [weak self] in
            self?.handlePlaybackFinished()
        }
    }
    
    func playRecording(_ recording: Recording) {
        playQueue(recordingIds: [recording.id], startAtIndex: 0, loopPlaylist: false)
    }

    func playQueue(recordingIds: [String], startAtIndex: Int, loopPlaylist: Bool) {
        guard !recordingIds.isEmpty else { return }

        let clampedIndex = max(0, min(startAtIndex, recordingIds.count - 1))
        playbackQueue = recordingIds
        playbackQueueIndex = clampedIndex
        isPlaylistLooping = loopPlaylist

        if let recording = recordings.first(where: { $0.id == recordingIds[clampedIndex] }) {
            print("🎵 Playing recording: \(recording.title)")
            print("📁 Recording ID: \(recording.id)")
            currentlyPlaying = recording
            showingImmersivePlayer = true
        }

        audioManager.setPlaybackMode(.once)
        audioManager.setRepeatCount(1)
        audioManager.setPlaybackRate(audioManager.playbackRate)

        do {
            try audioManager.play(recordingId: recordingIds[clampedIndex])
        } catch {
            print("❌ Failed to play recording: \(error.localizedDescription)")
        }
    }

    func playPlaylist(playlistId: String, startAtIndex: Int = 0, loopPlaylist: Bool) {
        guard let playlist = playlists.first(where: { $0.id == playlistId }) else { return }
        let ids = playlist.recordingIds
        playQueue(recordingIds: ids, startAtIndex: startAtIndex, loopPlaylist: loopPlaylist)
    }

    func skipToNextInQueue() {
        guard !playbackQueue.isEmpty else { return }
        let nextIndex = playbackQueueIndex + 1
        if nextIndex < playbackQueue.count {
            playQueue(recordingIds: playbackQueue, startAtIndex: nextIndex, loopPlaylist: isPlaylistLooping)
            return
        }
        if isPlaylistLooping {
            playQueue(recordingIds: playbackQueue, startAtIndex: 0, loopPlaylist: true)
        }
    }

    func skipToPreviousInQueue() {
        guard !playbackQueue.isEmpty else { return }
        let previousIndex = playbackQueueIndex - 1
        if previousIndex >= 0 {
            playQueue(recordingIds: playbackQueue, startAtIndex: previousIndex, loopPlaylist: isPlaylistLooping)
            return
        }
        if isPlaylistLooping {
            playQueue(recordingIds: playbackQueue, startAtIndex: max(0, playbackQueue.count - 1), loopPlaylist: true)
        }
    }

    func stopPlaybackAndClearQueue() {
        audioManager.stop()
        playbackQueue = []
        playbackQueueIndex = 0
        isPlaylistLooping = false
        currentlyPlaying = nil
        showingImmersivePlayer = false
    }

    private func handlePlaybackFinished() {
        guard !playbackQueue.isEmpty else { return }
        guard playbackQueueIndex < playbackQueue.count else { return }

        skipToNextInQueue()

        if playbackQueueIndex == playbackQueue.count - 1, !isPlaylistLooping {
            playbackQueue = []
            playbackQueueIndex = 0
        }
    }
    
    func toggleFavorite(_ recording: Recording) {
        if let index = recordings.firstIndex(where: { $0.id == recording.id }) {
            recordings[index].isFavorite.toggle()
            saveRecordings()
        }
    }
    
    func addRecording(id: String, title: String, text: String, category: String? = nil, affirmationId: String? = nil, isBestTake: Bool = false) {
        // Check if file exists
        if !audioManager.recordingExists(recordingId: id) {
            print("❌ Recording file does not exist for id: \(id)")
            return
        }
        
        // Get duration from audio file
        guard let duration = audioManager.getRecordingDuration(recordingId: id) else {
            print("❌ Failed to get recording duration for id: \(id)")
            return
        }
        
        print("✅ Adding recording with duration: \(duration) seconds")
        
        // Generate affirmationId if not provided (hash of text for grouping)
        let finalAffirmationId = affirmationId ?? text.sha256Hash()
        
        let recording = Recording(
            id: id,
            title: title,
            text: text,
            duration: duration,
            createdAt: Date(),
            isFavorite: false,
            listenCount: 0,
            category: category,
            affirmationId: finalAffirmationId,
            isBestTake: isBestTake
        )
        
        recordings.insert(recording, at: 0) // Add to beginning
        saveRecordings()
        
        print("✅ Recording saved. Total recordings: \(recordings.count)")
    }
    
    func deleteRecording(_ recording: Recording) {
        // Delete audio file
        try? audioManager.deleteRecording(recordingId: recording.id)
        
        // Remove from list
        recordings.removeAll { $0.id == recording.id }
        saveRecordings()
    }
    
    func updateRecording(_ recording: Recording, title: String, category: String) {
        if let index = recordings.firstIndex(where: { $0.id == recording.id }) {
            recordings[index].title = title
            recordings[index].category = category
            saveRecordings()
        }
    }
    
    func incrementListenCount(for recording: Recording) {
        if let index = recordings.firstIndex(where: { $0.id == recording.id }) {
            recordings[index].listenCount += 1
            saveRecordings()
        }
    }
    
    // MARK: - Persistence
    
    private var recordingsFileURL: URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0].appendingPathComponent("recordings.json")
    }
    
    private func loadRecordings() {
        guard FileManager.default.fileExists(atPath: recordingsFileURL.path) else {
            // First launch - start with empty list (no sample data with fake audio files)
            print("📝 First launch - starting with empty recordings list")
            recordings = []
            return
        }
        
        do {
            let data = try Data(contentsOf: recordingsFileURL)
            recordings = try JSONDecoder().decode([Recording].self, from: data)
            print("✅ Loaded \(recordings.count) recordings from storage")
        } catch {
            print("❌ Failed to load recordings: \(error)")
            recordings = []
        }
    }
    
    func saveRecordings() {
        do {
            let data = try JSONEncoder().encode(recordings)
            try data.write(to: recordingsFileURL)
        } catch {
            print("Failed to save recordings: \(error)")
        }
    }
    
    private func cleanupInvalidRecordings() {
        let initialCount = recordings.count
        recordings.removeAll { recording in
            let hasFile = audioManager.recordingExists(recordingId: recording.id)
            if !hasFile {
                print("🗑️ Removing invalid recording: \(recording.title)")
            }
            return !hasFile
        }
        
        if initialCount != recordings.count {
            print("🧹 Cleaned up \(initialCount - recordings.count) invalid recordings")
            saveRecordings()
        }
    }
    
    // MARK: - Playlist Management
    
    func addPlaylist(_ playlist: Playlist) {
        playlists.append(playlist)
        savePlaylists()
    }
    
    func updatePlaylist(playlistId: String, name: String, recordingIds: [String]) {
        if let index = playlists.firstIndex(where: { $0.id == playlistId }) {
            playlists[index].name = name
            playlists[index].recordingIds = recordingIds
            savePlaylists()
        }
    }
    
    func deletePlaylist(playlistId: String) {
        playlists.removeAll { $0.id == playlistId }
        savePlaylists()
    }
    
    func addRecordingToPlaylist(playlistId: String, recordingId: String) {
        if let index = playlists.firstIndex(where: { $0.id == playlistId }) {
            if !playlists[index].recordingIds.contains(recordingId) {
                playlists[index].recordingIds.append(recordingId)
                savePlaylists()
            }
        }
    }
    
    func removeRecordingFromPlaylist(playlistId: String, recordingId: String) {
        if let index = playlists.firstIndex(where: { $0.id == playlistId }) {
            playlists[index].recordingIds.removeAll { $0 == recordingId }
            savePlaylists()
        }
    }
    
    private var playlistsFileURL: URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0].appendingPathComponent("playlists.json")
    }
    
    private func loadPlaylists() {
        guard FileManager.default.fileExists(atPath: playlistsFileURL.path) else {
            print("📝 No saved playlists - using sample data")
            playlists = Playlist.sampleData
            return
        }
        
        do {
            let data = try Data(contentsOf: playlistsFileURL)
            playlists = try JSONDecoder().decode([Playlist].self, from: data)
            print("✅ Loaded \(playlists.count) playlists from storage")
        } catch {
            print("❌ Failed to load playlists: \(error)")
            playlists = Playlist.sampleData
        }
    }
    
    private func savePlaylists() {
        do {
            let data = try JSONEncoder().encode(playlists)
            try data.write(to: playlistsFileURL)
        } catch {
            print("Failed to save playlists: \(error)")
        }
    }
    
    // MARK: - WPM Settings
    
    private func loadWPMSettings() {
        if let wpm = UserDefaults.standard.value(forKey: "teleprompter_wpm") as? Int {
            teleprompterWPM = wpm
        }
        if let calibrated = UserDefaults.standard.value(forKey: "teleprompter_calibrated_wpm") as? Int {
            calibratedWPM = calibrated
        }
        if let timestamp = UserDefaults.standard.object(forKey: "teleprompter_calibrated_at") as? Date {
            calibratedAt = timestamp
        }
    }
    
    func saveWPMSettings() {
        UserDefaults.standard.set(teleprompterWPM, forKey: "teleprompter_wpm")
        if let calibrated = calibratedWPM {
            UserDefaults.standard.set(calibrated, forKey: "teleprompter_calibrated_wpm")
        }
        if let timestamp = calibratedAt {
            UserDefaults.standard.set(timestamp, forKey: "teleprompter_calibrated_at")
        }
    }
    
    func calibrateWPM(_ wpm: Int) {
        calibratedWPM = wpm
        teleprompterWPM = wpm
        calibratedAt = Date()
        saveWPMSettings()
    }
    
    func toggleBestTake(_ recording: Recording) {
        if let index = recordings.firstIndex(where: { $0.id == recording.id }) {
            let newValue = !recordings[index].isBestTake
            
            // If marking as best take, unmark all other recordings with same affirmationId
            if newValue, let affirmationId = recording.affirmationId {
                for i in recordings.indices {
                    if recordings[i].affirmationId == affirmationId {
                        recordings[i].isBestTake = false
                    }
                }
            }
            
            recordings[index].isBestTake = newValue
            saveRecordings()
        }
    }
}

// MARK: - String Extension for Affirmation ID
extension String {
    func sha256Hash() -> String {
        let data = Data(self.utf8)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined().prefix(16).description
    }
}

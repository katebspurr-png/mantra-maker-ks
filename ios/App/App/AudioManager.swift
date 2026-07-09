// ─────────────────────────────────────────────────
// Resonance — Audio Manager
// Handles recording and playback of affirmations
// ─────────────────────────────────────────────────

import Foundation
import AVFoundation
import Combine
import MediaPlayer

class AudioManager: NSObject, ObservableObject {
    enum PlaybackMode: String, CaseIterable {
        case once
        case loop
        case repeatCount
        case duration
    }

    private enum PlaybackDefaults {
        static let rateKey = "playback_rate"
        static let modeKey = "playback_mode"
        static let repeatCountKey = "playback_repeatCount"
        static let durationSecondsKey = "playback_durationSeconds"
        static let backgroundEnabledKey = "ambient_enabled"
        static let ambientVolumeKey = "ambient_volume"
        static let duckingAmountKey = "ambient_duckingAmount"
        static let autosaveDefaultsKey = "playback_autosaveDefaults"
    }

    var onPlaybackFinished: (() -> Void)?
    // MARK: - Published Properties
    
    @Published var isRecording: Bool = false
    @Published var isPlaying: Bool = false
    @Published var currentTime: TimeInterval = 0
    @Published var duration: TimeInterval = 0
    @Published var isPlaybackLooping: Bool = false
    @Published var playbackRate: Float = 1.0
    @Published var playbackMode: PlaybackMode = .once
    @Published var repeatCount: Int = 1
    @Published var durationLimitSeconds: TimeInterval = 300
    @Published var isBackgroundSoundsEnabled: Bool = true
    @Published var ambientDuckingAmount: Float = 0.83
    @Published var autosavePlaybackDefaults: Bool = false
    @Published var recordingLevel: Float = 0 // For waveform visualization
    @Published var ambientVolume: Float = 0.3 // Ambient sound volume
    @Published var isAmbientPlaying: Bool = false
    @Published private(set) var ambientSoundPreferencesVersion: Int = 0
    
    private var normalAmbientVolume: Float = 0.3 // Store normal volume for ducking
    private var duckedAmbientVolume: Float = 0.1 // Lowered volume during playback
    private var durationModeTimer: Timer?
    
    // MARK: - Private Properties
    
    private var audioRecorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var ambientPlayer: AVAudioPlayer?
    private var recordingTimer: Timer?
    private var playbackTimer: Timer?
    private var levelTimer: Timer?
    
    private let audioSession = AVAudioSession.sharedInstance()
    
    // Now Playing metadata
    private var currentRecordingTitle: String?
    private var currentRecordingText: String?
    
    // MARK: - Initialization
    
    override init() {
        super.init()
        loadPlaybackDefaults()
        configureAudioSessionForBackgroundPlayback()
        setupRemoteControls()
        setupNotifications()
        updateDuckedAmbientVolume()
    }
    
    /// Configure audio session for background playback
    private func configureAudioSessionForBackgroundPlayback() {
        do {
            // Set category to .playback with .spokenAudio mode for optimal voice content
            try audioSession.setCategory(.playback, mode: .spokenAudio, options: [])
            
            // Activate the session
            try audioSession.setActive(true)
            
            print("✅ Audio session configured for background playback")
            print("   Category: \(audioSession.category.rawValue)")
            print("   Mode: \(audioSession.mode.rawValue)")
        } catch {
            print("❌ Failed to configure audio session: \(error)")
        }
    }
    
    private func setupNotifications() {
        // Listen for interruptions (like phone calls)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )
        
        // Listen for route changes (like unplugging headphones)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRouteChange),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
        
        // Listen for app lifecycle events
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppWillResignActive),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }
    
    @objc private func handleAudioInterruption(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
            return
        }
        
        switch type {
        case .began:
            print("🔇 Audio interruption began")
            pause()
        case .ended:
            guard let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt else { return }
            let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
            if options.contains(.shouldResume) {
                print("🔊 Audio interruption ended - resuming")
                resume()
            }
        @unknown default:
            break
        }
    }
    
    @objc private func handleRouteChange(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
            return
        }
        
        switch reason {
        case .oldDeviceUnavailable:
            print("🎧 Audio route changed - device unavailable")
            pause()
        default:
            break
        }
    }
    
    @objc private func handleAppWillResignActive(notification: Notification) {
        print("📱 App will resign active - ensuring audio session is configured for background")
        // Ensure audio session is active for background playback
        if isPlaying || isAmbientPlaying {
            do {
                try audioSession.setActive(true, options: [])
                print("✅ Audio session activated for background playback")
            } catch {
                print("❌ Failed to activate audio session for background: \(error)")
            }
        }
    }
    
    @objc private func handleAppDidBecomeActive(notification: Notification) {
        print("📱 App did become active - syncing playback state")
        // Sync UI state with actual player state
        if let player = audioPlayer {
            isPlaying = player.isPlaying
            currentTime = player.currentTime
            
            // Restart timer if playing
            if player.isPlaying && playbackTimer == nil {
                startPlaybackTimer()
            }
        }
        
        if let ambientPlayer = ambientPlayer {
            isAmbientPlaying = ambientPlayer.isPlaying
        }
    }
    
    private func setupRemoteControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Play command
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.resume()
            return .success
        }
        
        // Pause command
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.pause()
            return .success
        }
        
        // Skip forward/backward
        commandCenter.skipForwardCommand.preferredIntervals = [15]
        commandCenter.skipForwardCommand.addTarget { [weak self] event in
            guard let self = self,
                  let command = event.command as? MPSkipIntervalCommand,
                  let player = self.audioPlayer else { return .commandFailed }
            
            let newTime = min(player.currentTime + command.preferredIntervals[0].doubleValue, player.duration)
            self.seek(to: newTime)
            return .success
        }
        
        commandCenter.skipBackwardCommand.preferredIntervals = [15]
        commandCenter.skipBackwardCommand.addTarget { [weak self] event in
            guard let self = self,
                  let command = event.command as? MPSkipIntervalCommand,
                  let player = self.audioPlayer else { return .commandFailed }
            
            let newTime = max(player.currentTime - command.preferredIntervals[0].doubleValue, 0)
            self.seek(to: newTime)
            return .success
        }
        
        // Enable/disable commands
        commandCenter.playCommand.isEnabled = true
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.skipForwardCommand.isEnabled = true
        commandCenter.skipBackwardCommand.isEnabled = true
    }
    
    // MARK: - File Management
    
    private var recordingsDirectory: URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        let documentsDirectory = paths[0]
        let recordingsDir = documentsDirectory.appendingPathComponent("Recordings")
        
        // Create directory if it doesn't exist
        if !FileManager.default.fileExists(atPath: recordingsDir.path) {
            try? FileManager.default.createDirectory(at: recordingsDir, withIntermediateDirectories: true)
        }
        
        return recordingsDir
    }
    
    func fileURL(for recordingId: String) -> URL {
        return recordingsDirectory.appendingPathComponent("\(recordingId).m4a")
    }
    
    // MARK: - Recording Setup
    
    func setupRecorder(for recordingId: String) throws {
        // Configure audio session for recording
        try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
        try audioSession.setActive(true)
        
        let fileURL = fileURL(for: recordingId)
        
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100.0,
            AVNumberOfChannelsKey: 2,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        audioRecorder = try AVAudioRecorder(url: fileURL, settings: settings)
        audioRecorder?.delegate = self
        audioRecorder?.isMeteringEnabled = true
        audioRecorder?.prepareToRecord()
    }
    
    // MARK: - Recording Controls
    
    func startRecording(for recordingId: String) throws {
        try setupRecorder(for: recordingId)
        
        guard let recorder = audioRecorder else {
            throw AudioError.recorderNotSetup
        }
        
        recorder.record()
        isRecording = true
        currentTime = 0
        
        // Start timer to update recording time
        recordingTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            guard let self = self, let recorder = self.audioRecorder else { return }
            self.currentTime = recorder.currentTime
        }
        
        // Start timer to monitor audio levels for waveform
        levelTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            guard let self = self, let recorder = self.audioRecorder else { return }
            recorder.updateMeters()
            let averagePower = recorder.averagePower(forChannel: 0)
            // Convert decibels to 0-1 range (approximate)
            let normalized = pow(10, averagePower / 20)
            self.recordingLevel = normalized
        }
    }
    
    func stopRecording() {
        guard let recorder = audioRecorder else { return }
        
        let fileURL = recorder.url
        recorder.stop()
        
        isRecording = false
        recordingTimer?.invalidate()
        levelTimer?.invalidate()
        recordingLevel = 0
        
        // Deactivate audio session with option to allow other audio
        try? audioSession.setActive(false, options: .notifyOthersOnDeactivation)
        
        // Verify file was created
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            if FileManager.default.fileExists(atPath: fileURL.path) {
                do {
                    let attributes = try FileManager.default.attributesOfItem(atPath: fileURL.path)
                    let fileSize = attributes[.size] as? Int64 ?? 0
                    print("✅ Recording saved at: \(fileURL.path)")
                    print("📊 File size: \(fileSize) bytes")
                } catch {
                    print("❌ Error checking file: \(error)")
                }
            } else {
                print("❌ Recording file not found after stopping")
            }
        }
    }
    
    func pauseRecording() {
        audioRecorder?.pause()
        isRecording = false
        recordingTimer?.invalidate()
        levelTimer?.invalidate()
    }
    
    func resumeRecording() {
        audioRecorder?.record()
        isRecording = true
        
        recordingTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            guard let self = self, let recorder = self.audioRecorder else { return }
            self.currentTime = recorder.currentTime
        }
        
        levelTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            guard let self = self, let recorder = self.audioRecorder else { return }
            recorder.updateMeters()
            let averagePower = recorder.averagePower(forChannel: 0)
            let normalized = pow(10, averagePower / 20)
            self.recordingLevel = normalized
        }
    }
    
    // MARK: - Playback Defaults

    private func loadPlaybackDefaults() {
        autosavePlaybackDefaults = UserDefaults.standard.bool(forKey: PlaybackDefaults.autosaveDefaultsKey)

        let savedRate = UserDefaults.standard.float(forKey: PlaybackDefaults.rateKey)
        if savedRate > 0 { playbackRate = savedRate }

        if let rawMode = UserDefaults.standard.string(forKey: PlaybackDefaults.modeKey),
           let mode = PlaybackMode(rawValue: rawMode) {
            playbackMode = mode
        }

        let savedRepeat = UserDefaults.standard.integer(forKey: PlaybackDefaults.repeatCountKey)
        if savedRepeat > 0 { repeatCount = savedRepeat }

        let savedDuration = UserDefaults.standard.double(forKey: PlaybackDefaults.durationSecondsKey)
        if savedDuration > 0 { durationLimitSeconds = savedDuration }

        if UserDefaults.standard.object(forKey: PlaybackDefaults.backgroundEnabledKey) != nil {
            isBackgroundSoundsEnabled = UserDefaults.standard.bool(forKey: PlaybackDefaults.backgroundEnabledKey)
        }

        let savedAmbientVol = UserDefaults.standard.float(forKey: PlaybackDefaults.ambientVolumeKey)
        if savedAmbientVol > 0 { ambientVolume = savedAmbientVol }
        normalAmbientVolume = ambientVolume

        let savedDucking = UserDefaults.standard.float(forKey: PlaybackDefaults.duckingAmountKey)
        if savedDucking > 0 { ambientDuckingAmount = savedDucking }
    }

    func savePlaybackDefaults() {
        UserDefaults.standard.set(autosavePlaybackDefaults, forKey: PlaybackDefaults.autosaveDefaultsKey)
        UserDefaults.standard.set(playbackRate, forKey: PlaybackDefaults.rateKey)
        UserDefaults.standard.set(playbackMode.rawValue, forKey: PlaybackDefaults.modeKey)
        UserDefaults.standard.set(repeatCount, forKey: PlaybackDefaults.repeatCountKey)
        UserDefaults.standard.set(durationLimitSeconds, forKey: PlaybackDefaults.durationSecondsKey)
        UserDefaults.standard.set(isBackgroundSoundsEnabled, forKey: PlaybackDefaults.backgroundEnabledKey)
        UserDefaults.standard.set(ambientVolume, forKey: PlaybackDefaults.ambientVolumeKey)
        UserDefaults.standard.set(ambientDuckingAmount, forKey: PlaybackDefaults.duckingAmountKey)
    }

    func setAutosavePlaybackDefaults(_ enabled: Bool) {
        autosavePlaybackDefaults = enabled
        UserDefaults.standard.set(enabled, forKey: PlaybackDefaults.autosaveDefaultsKey)
    }

    func setPlaybackRate(_ rate: Float) {
        playbackRate = max(0.5, min(2.0, rate))
        applyPlaybackRateIfPossible()
        if autosavePlaybackDefaults {
            UserDefaults.standard.set(playbackRate, forKey: PlaybackDefaults.rateKey)
        }
    }

    func setPlaybackMode(_ mode: PlaybackMode) {
        playbackMode = mode
        applyPlaybackModeIfPossible()
        if autosavePlaybackDefaults {
            UserDefaults.standard.set(playbackMode.rawValue, forKey: PlaybackDefaults.modeKey)
        }
    }

    func setRepeatCount(_ count: Int) {
        repeatCount = max(1, count)
        applyPlaybackModeIfPossible()
        if autosavePlaybackDefaults {
            UserDefaults.standard.set(repeatCount, forKey: PlaybackDefaults.repeatCountKey)
        }
    }

    func setDurationLimitSeconds(_ seconds: TimeInterval) {
        durationLimitSeconds = max(5, seconds)
        if autosavePlaybackDefaults {
            UserDefaults.standard.set(durationLimitSeconds, forKey: PlaybackDefaults.durationSecondsKey)
        }
    }

    func setBackgroundSoundsEnabled(_ enabled: Bool) {
        isBackgroundSoundsEnabled = enabled
        if !enabled {
            stopAmbientSound()
        }
        if autosavePlaybackDefaults {
            UserDefaults.standard.set(enabled, forKey: PlaybackDefaults.backgroundEnabledKey)
        }
    }

    func setAmbientDuckingAmount(_ amount: Float) {
        ambientDuckingAmount = max(0, min(1, amount))
        updateDuckedAmbientVolume()
        if autosavePlaybackDefaults {
            UserDefaults.standard.set(ambientDuckingAmount, forKey: PlaybackDefaults.duckingAmountKey)
        }
    }

    private func updateDuckedAmbientVolume() {
        duckedAmbientVolume = normalAmbientVolume * (1 - ambientDuckingAmount)
    }

    private func applyPlaybackRateIfPossible() {
        audioPlayer?.enableRate = true
        audioPlayer?.rate = playbackRate
    }

    private func applyPlaybackModeIfPossible() {
        durationModeTimer?.invalidate()
        durationModeTimer = nil

        switch playbackMode {
        case .once:
            audioPlayer?.numberOfLoops = 0
        case .loop:
            audioPlayer?.numberOfLoops = -1
        case .repeatCount:
            audioPlayer?.numberOfLoops = max(0, repeatCount - 1)
        case .duration:
            audioPlayer?.numberOfLoops = -1
        }
    }

    private func startDurationModeTimerIfNeeded() {
        guard playbackMode == .duration else { return }
        durationModeTimer?.invalidate()
        durationModeTimer = Timer.scheduledTimer(withTimeInterval: durationLimitSeconds, repeats: false) { [weak self] _ in
            guard let self else { return }
            self.stop()
        }
        RunLoop.main.add(durationModeTimer!, forMode: .common)
    }

    // MARK: - Playback Setup
    
    func setupPlayer(for recordingId: String) throws {
        let fileURL = fileURL(for: recordingId)
        
        print("🎧 Setting up player for: \(recordingId)")
        print("📁 File path: \(fileURL.path)")
        
        // Check if file exists
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            print("❌ File does not exist!")
            throw AudioError.fileNotFound
        }
        
        print("✅ File exists")
        
        // Ensure audio session is active (already configured in init)
        // Only reconfigure if we need to mix with ambient sound
        if isAmbientPlaying {
            try audioSession.setCategory(.playback, mode: .spokenAudio, options: [.mixWithOthers])
        } else {
            try audioSession.setCategory(.playback, mode: .spokenAudio, options: [])
        }
        try audioSession.setActive(true)
        
        print("✅ Audio session active - category: \(audioSession.category.rawValue)")
        
        audioPlayer = try AVAudioPlayer(contentsOf: fileURL)
        audioPlayer?.delegate = self
        audioPlayer?.enableRate = true
        audioPlayer?.rate = playbackRate
        applyPlaybackModeIfPossible()
        audioPlayer?.prepareToPlay()
        
        duration = audioPlayer?.duration ?? 0
        print("✅ Player setup complete - duration: \(duration)s")
    }
    
    // MARK: - Playback Controls
    
    func play(recordingId: String) throws {
        print("▶️ Attempting to play recording: \(recordingId)")
        
        // Stop any current playback
        if isPlaying {
            print("⏹️ Stopping current playback")
            stop()
        }
        
        try setupPlayer(for: recordingId)
        
        guard let player = audioPlayer else {
            print("❌ Player not setup")
            throw AudioError.playerNotSetup
        }
        
        print("✅ Starting playback - duration: \(player.duration)s")
        
        // Ensure audio session is active for background playback
        do {
            try audioSession.setActive(true)
            print("✅ Audio session activated for playback")
        } catch {
            print("❌ Failed to activate audio session: \(error)")
        }
        
        // Duck ambient audio if playing
        if isAmbientPlaying {
            duckAmbientAudio()
        }
        
        // Start playback
        let success = player.play()
        print("🔊 Audio player play() returned: \(success)")
        print("🔊 Audio player isPlaying: \(player.isPlaying)")
        
        isPlaying = player.isPlaying
        
        // Haptic feedback for playback start
        HapticManager.shared.playbackStart()
        
        // Update Now Playing info
        updateNowPlayingInfo()
        
        // Start playback timer
        startPlaybackTimer()
        startDurationModeTimerIfNeeded()
    }
    
    private func startPlaybackTimer() {
        // Invalidate existing timer
        playbackTimer?.invalidate()
        
        // Create timer on main RunLoop with common mode for background execution
        playbackTimer = Timer(timeInterval: 0.1, repeats: true) { [weak self] _ in
            guard let self = self, let player = self.audioPlayer else { return }
            
            // Update current time
            DispatchQueue.main.async {
                self.currentTime = player.currentTime
            }
            
            // Update Now Playing info periodically (every 5 seconds)
            if Int(player.currentTime) % 5 == 0 {
                DispatchQueue.main.async {
                    self.updateNowPlayingInfo()
                }
            }
            
            // Auto-stop when finished
            if !player.isPlaying {
                DispatchQueue.main.async {
                    self.stop()
                }
            }
        }
        
        // Add to RunLoop with .common mode to ensure it fires in background
        RunLoop.main.add(playbackTimer!, forMode: .common)
    }
    
    func setPlaybackLooping(_ enabled: Bool) {
        isPlaybackLooping = enabled
        setPlaybackMode(enabled ? .loop : .once)
    }
    
    func pause() {
        durationModeTimer?.invalidate()
        durationModeTimer = nil
        audioPlayer?.pause()
        isPlaying = false
        playbackTimer?.invalidate()
        
        // Restore ambient volume when pausing
        restoreAmbientAudio()
        
        updateNowPlayingInfo()
        
        // Haptic feedback for pause
        HapticManager.shared.playbackStop()
    }
    
    func resume() {
        audioPlayer?.play()
        isPlaying = true
        updateNowPlayingInfo()
        
        // Haptic feedback for resume
        HapticManager.shared.playbackStart()
        
        // Use the shared timer method
        startPlaybackTimer()
    }
    
    func stop() {
        durationModeTimer?.invalidate()
        durationModeTimer = nil
        audioPlayer?.stop()
        audioPlayer?.currentTime = 0
        isPlaying = false
        currentTime = 0
        playbackTimer?.invalidate()
        
        // Restore ambient volume if it was ducked
        restoreAmbientAudio()
        
        // Stop ambient sound as well
        stopAmbientSound()
        
        // Clear Now Playing info
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        
        // Deactivate audio session with option to allow other audio
        try? audioSession.setActive(false, options: .notifyOthersOnDeactivation)
    }
    
    func seek(to time: TimeInterval) {
        audioPlayer?.currentTime = time
        currentTime = time
        updateNowPlayingInfo()
    }
    
    // MARK: - Ambient Sound Controls
    
    private enum AmbientSoundDefaults {
        static let favoriteIdsKey = "ambientSound_favoriteIds"
        static let lastUsedPrefix = "ambientSound_lastUsed_"
    }
    
    func isAmbientSoundFavorite(_ sound: AmbientSound) -> Bool {
        favoriteAmbientSoundIds().contains(sound.id)
    }
    
    func toggleAmbientSoundFavorite(_ sound: AmbientSound) {
        var favorites = favoriteAmbientSoundIds()
        if favorites.contains(sound.id) {
            favorites.remove(sound.id)
        } else {
            favorites.insert(sound.id)
        }
        UserDefaults.standard.set(Array(favorites), forKey: AmbientSoundDefaults.favoriteIdsKey)
        ambientSoundPreferencesVersion += 1
    }
    
    func ambientSoundLastUsedAt(_ sound: AmbientSound) -> Date? {
        let key = AmbientSoundDefaults.lastUsedPrefix + sound.id
        let timeInterval = UserDefaults.standard.double(forKey: key)
        guard timeInterval > 0 else { return nil }
        return Date(timeIntervalSince1970: timeInterval)
    }
    
    private func markAmbientSoundUsed(_ sound: AmbientSound, at date: Date = Date()) {
        let key = AmbientSoundDefaults.lastUsedPrefix + sound.id
        UserDefaults.standard.set(date.timeIntervalSince1970, forKey: key)
        ambientSoundPreferencesVersion += 1
    }
    
    func orderedAmbientSoundsForDisplay(_ sounds: [AmbientSound]) -> [AmbientSound] {
        let noneSound = sounds.first(where: { $0.id == "none" || $0.fileName.isEmpty })
        let otherSounds = sounds.filter { !($0.id == "none" || $0.fileName.isEmpty) }
        
        let favorites = favoriteAmbientSoundIds()
        let favoriteSounds = otherSounds
            .filter { favorites.contains($0.id) }
            .sorted { (lhs, rhs) in
                let lhsDate = ambientSoundLastUsedAt(lhs) ?? .distantPast
                let rhsDate = ambientSoundLastUsedAt(rhs) ?? .distantPast
                if lhsDate != rhsDate { return lhsDate > rhsDate }
                return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
            }
        
        let recentSounds = otherSounds
            .filter { !favorites.contains($0.id) }
            .filter { ambientSoundLastUsedAt($0) != nil }
            .sorted { (lhs, rhs) in
                (ambientSoundLastUsedAt(lhs) ?? .distantPast) > (ambientSoundLastUsedAt(rhs) ?? .distantPast)
            }
        
        let excludedIds = Set(favoriteSounds.map(\.id) + recentSounds.map(\.id))
        let remainingSounds = otherSounds.filter { !excludedIds.contains($0.id) }
        
        var ordered: [AmbientSound] = []
        if let noneSound {
            ordered.append(noneSound)
        }
        ordered.append(contentsOf: favoriteSounds)
        ordered.append(contentsOf: recentSounds)
        ordered.append(contentsOf: remainingSounds)
        return ordered
    }
    
    private func favoriteAmbientSoundIds() -> Set<String> {
        let ids = UserDefaults.standard.stringArray(forKey: AmbientSoundDefaults.favoriteIdsKey) ?? []
        return Set(ids)
    }
    
    func playAmbientSound(_ sound: AmbientSound) {
        guard isBackgroundSoundsEnabled else { return }
        guard let url = sound.fileURL else {
            print("❌ Ambient sound file not found: \(sound.fileName)")
            return
        }
        
        do {
            // Stop existing ambient sound
            stopAmbientSound()
            
            // Create ambient player
            ambientPlayer = try AVAudioPlayer(contentsOf: url)
            ambientPlayer?.numberOfLoops = -1 // Loop indefinitely
            ambientPlayer?.volume = ambientVolume
            ambientPlayer?.prepareToPlay()
            
            // Configure audio session to mix with main playback
            // This allows both the affirmation and ambient sound to play together
            try audioSession.setCategory(.playback, mode: .spokenAudio, options: [.mixWithOthers])
            try audioSession.setActive(true)
            
            let success = ambientPlayer?.play() ?? false
            isAmbientPlaying = success
            if success {
                markAmbientSoundUsed(sound)
            }
            print("✅ Ambient sound \(success ? "playing" : "failed to play"): \(sound.name)")
        } catch {
            print("❌ Failed to play ambient sound: \(error)")
            isAmbientPlaying = false
        }
    }
    
    func stopAmbientSound() {
        ambientPlayer?.stop()
        ambientPlayer = nil
        isAmbientPlaying = false
        print("⏹️ Ambient sound stopped")
    }
    
    func setAmbientVolume(_ volume: Float) {
        let clampedVolume = max(0, min(1, volume))
        ambientVolume = clampedVolume
        normalAmbientVolume = clampedVolume // Update the normal volume when user adjusts
        updateDuckedAmbientVolume()
        ambientPlayer?.volume = ambientVolume

        if autosavePlaybackDefaults {
            UserDefaults.standard.set(ambientVolume, forKey: PlaybackDefaults.ambientVolumeKey)
        }
    }
    
    // MARK: - Audio Ducking
    
    private func duckAmbientAudio() {
        guard isAmbientPlaying else { return }
        
        // Smoothly lower ambient volume
        UIView.animate(withDuration: 0.3) {
            self.ambientPlayer?.volume = self.duckedAmbientVolume
        }
        
        print("🔉 Ducked ambient audio to \(duckedAmbientVolume)")
    }
    
    private func restoreAmbientAudio() {
        guard isAmbientPlaying else { return }
        
        // Smoothly restore ambient volume
        UIView.animate(withDuration: 0.3) {
            self.ambientPlayer?.volume = self.normalAmbientVolume
        }
        
        print("🔊 Restored ambient audio to \(normalAmbientVolume)")
    }
    
    // MARK: - Now Playing Info
    
    func updateNowPlayingInfo() {
        guard let player = audioPlayer else { return }
        
        var nowPlayingInfo = [String: Any]()
        nowPlayingInfo[MPMediaItemPropertyTitle] = currentRecordingTitle ?? "Affirmation"
        nowPlayingInfo[MPMediaItemPropertyArtist] = "Resonance"
        
        if let text = currentRecordingText {
            nowPlayingInfo[MPMediaItemPropertyComments] = text
        }
        
        nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = player.duration
        nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = player.currentTime
        nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = isPlaying ? 1.0 : 0.0
        
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }
    
    func setNowPlayingMetadata(title: String, text: String) {
        currentRecordingTitle = title
        currentRecordingText = text
        updateNowPlayingInfo()
    }
    
    // MARK: - File Operations
    
    func deleteRecording(recordingId: String) throws {
        let fileURL = fileURL(for: recordingId)
        
        if FileManager.default.fileExists(atPath: fileURL.path) {
            try FileManager.default.removeItem(at: fileURL)
        }
    }
    
    func recordingExists(recordingId: String) -> Bool {
        let fileURL = fileURL(for: recordingId)
        return FileManager.default.fileExists(atPath: fileURL.path)
    }
    
    func getRecordingDuration(recordingId: String) -> TimeInterval? {
        let fileURL = fileURL(for: recordingId)
        
        print("📁 Checking file at: \(fileURL.path)")
        
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            print("❌ File does not exist at path")
            return nil
        }
        
        do {
            let attributes = try FileManager.default.attributesOfItem(atPath: fileURL.path)
            let fileSize = attributes[.size] as? Int64 ?? 0
            print("📊 File size: \(fileSize) bytes")
            
            let player = try AVAudioPlayer(contentsOf: fileURL)
            print("✅ Duration: \(player.duration) seconds")
            return player.duration
        } catch {
            print("❌ Error getting duration: \(error.localizedDescription)")
            return nil
        }
    }
    
    // MARK: - Permission Handling
    
    func requestRecordingPermission(completion: @escaping (Bool) -> Void) {
        audioSession.requestRecordPermission { granted in
            DispatchQueue.main.async {
                completion(granted)
            }
        }
    }
    
    func checkRecordingPermission() -> AVAudioSession.RecordPermission {
        return audioSession.recordPermission
    }
}

// MARK: - AVAudioRecorderDelegate

extension AudioManager: AVAudioRecorderDelegate {
    func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        isRecording = false
        recordingTimer?.invalidate()
        levelTimer?.invalidate()
        recordingLevel = 0
        
        if flag {
            print("Recording finished successfully at: \(recorder.url)")
        } else {
            print("Recording failed")
        }
    }
    
    func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        print("Recording encode error: \(error?.localizedDescription ?? "Unknown error")")
        isRecording = false
        recordingTimer?.invalidate()
        levelTimer?.invalidate()
    }
}

// MARK: - AVAudioPlayerDelegate

extension AudioManager: AVAudioPlayerDelegate {
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        isPlaying = false
        currentTime = 0
        playbackTimer?.invalidate()

        if flag {
            print("Playback finished successfully")
        }

        DispatchQueue.main.async {
            self.onPlaybackFinished?()
        }
    }
    
    func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        print("Playback decode error: \(error?.localizedDescription ?? "Unknown error")")
        isPlaying = false
        playbackTimer?.invalidate()
    }
}

// MARK: - Error Types

enum AudioError: LocalizedError {
    case recorderNotSetup
    case playerNotSetup
    case fileNotFound
    case permissionDenied
    
    var errorDescription: String? {
        switch self {
        case .recorderNotSetup:
            return "Audio recorder is not set up"
        case .playerNotSetup:
            return "Audio player is not set up"
        case .fileNotFound:
            return "Audio file not found"
        case .permissionDenied:
            return "Microphone permission denied"
        }
    }
}

// MARK: - Helper Extensions

extension TimeInterval {
    /// Formats time as MM:SS
    var formattedTime: String {
        let minutes = Int(self) / 60
        let seconds = Int(self) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

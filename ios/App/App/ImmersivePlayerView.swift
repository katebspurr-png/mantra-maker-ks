import SwiftUI

struct ImmersivePlayerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    
    private var audioManager: AudioManager {
        appState.audioManager
    }

    private var currentRecording: Recording? {
        appState.currentlyPlaying
    }

    @State private var showingAmbientSelector = false
    @State private var showingPlaybackOptions = false
    @State private var showingFeelingCapture = false
    @State private var selectedAmbient: AmbientSound?
    
    var progress: Double {
        guard audioManager.duration > 0 else { return 0 }
        return audioManager.currentTime / audioManager.duration
    }
    
    var body: some View {
        if let recording = currentRecording {
            content(recording: recording)
        } else {
            Color.clear
                .onAppear { dismiss() }
        }
    }

    private func content(recording: Recording) -> some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(hex: "#1C1610"),
                    Color(hex: "#141009"),
                    Color(hex: "#0F0C07")
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Ambient glows
            AmbientOrb(color: .resWarm, size: 300, delay: 0)
                .position(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height * 0.25)
            
            AmbientOrb(color: .resSage, size: 180, delay: 4)
                .position(x: UIScreen.main.bounds.width * 0.25, y: UIScreen.main.bounds.height * 0.40)
            
            VStack {
                // Close and Share buttons
                HStack {
                    Button(action: {
                        HapticManager.shared.buttonTap()
                        ShareManager.shared.shareRecordingWithText(recording, audioManager: audioManager)
                    }) {
                        ZStack {
                            Circle()
                                .fill(Color.resDarkText.opacity(0.06))
                                .frame(width: 36, height: 36)
                            
                            Image(systemName: "square.and.arrow.up")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.resDarkText.opacity(0.4))
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        HapticManager.shared.buttonTap()
                        // Show feeling capture if session was long enough (≥ 1 loop, ~10 seconds)
                        if audioManager.currentTime >= 10 {
                            showingFeelingCapture = true
                        } else {
                            dismiss()
                        }
                    }) {
                        ZStack {
                            Circle()
                                .fill(Color.resDarkText.opacity(0.06))
                                .frame(width: 36, height: 36)
                            
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.resDarkText.opacity(0.4))
                        }
                    }
                }
                .padding(.horizontal, 22)
                .padding(.top, 16)
                
                Spacer()
                
                // Affirmation content
                VStack(spacing: 28) {
                    Text(recording.title.uppercased())
                        .font(.resMicro)
                        .foregroundColor(.resDarkMuted)
                        .kerning(0.1)
                    
                    Text("\"\(recording.text)\"")
                        .font(.custom("CormorantGaramond-LightItalic", size: 28))
                        .foregroundColor(.resDarkText.opacity(0.92))
                        .lineSpacing(10)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 36)
                
                Spacer()
                
                // Controls
                VStack(spacing: 32) {
                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.resDarkText.opacity(0.08))
                                .frame(height: 1)
                            
                            LinearGradient(
                                colors: [
                                    Color.resWarm.opacity(0.5),
                                    Color.resWarm.opacity(0.75)
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .frame(width: geometry.size.width * progress, height: 1)
                        }
                        .contentShape(Rectangle())
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { value in
                                    HapticManager.shared.selection()
                                    let newProgress = max(0, min(1, value.location.x / geometry.size.width))
                                    let newTime = newProgress * audioManager.duration
                                    audioManager.seek(to: newTime)
                                }
                        )
                    }
                    .frame(height: 20)  // Increase tap target
                    
                    // Playback controls
                    HStack(spacing: 44) {
                        Button(action: {
                            HapticManager.shared.toggle()
                            audioManager.setPlaybackLooping(!audioManager.isPlaybackLooping)
                        }) {
                            Image(systemName: "repeat")
                                .font(.system(size: 20))
                                .foregroundColor(.resDarkText.opacity(audioManager.isPlaybackLooping ? 1.0 : 0.6))
                        }
                        .opacity(audioManager.isPlaybackLooping ? 1.0 : 0.5)
                        
                        Button(action: {
                            HapticManager.shared.buttonTap()
                            showingPlaybackOptions = true
                        }) {
                            Image(systemName: "slider.horizontal.3")
                                .font(.system(size: 20))
                                .foregroundColor(.resDarkText.opacity(0.7))
                        }
                        
                        Button(action: { 
                            if audioManager.isPlaying {
                                audioManager.pause()
                            } else {
                                if audioManager.currentTime > 0 {
                                    audioManager.resume()
                                } else {
                                    do {
                                        try audioManager.play(recordingId: recording.id)
                                    } catch {
                                        print("Failed to play recording: \(error.localizedDescription)")
                                    }
                                }
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.resDarkText.opacity(0.08))
                                    .background(.ultraThinMaterial.opacity(0.3))
                                    .frame(width: 64, height: 64)
                                
                                Image(systemName: audioManager.isPlaying ? "pause.fill" : "play.fill")
                                    .font(.system(size: 22))
                                    .foregroundColor(.resDarkText.opacity(0.9))
                                    .offset(x: audioManager.isPlaying ? 0 : 2)
                            }
                        }
                        
                        Button(action: {
                            HapticManager.shared.buttonTap()
                            showingAmbientSelector = true
                        }) {
                            Image(systemName: audioManager.isAmbientPlaying ? "speaker.wave.2.fill" : "speaker.wave.2")
                                .font(.system(size: 20))
                                .foregroundColor(.resDarkText.opacity(audioManager.isAmbientPlaying ? 1.0 : 0.6))
                        }
                        .opacity(audioManager.isAmbientPlaying ? 1.0 : 0.4)
                    }

                    if appState.playbackQueue.count > 1 {
                        HStack(spacing: 18) {
                            Button(action: {
                                HapticManager.shared.buttonTap()
                                appState.skipToPreviousInQueue()
                            }) {
                                Image(systemName: "backward.fill")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.resDarkText.opacity(0.7))
                            }

                            Text("\(appState.playbackQueueIndex + 1)/\(appState.playbackQueue.count)")
                                .font(.resCaption)
                                .foregroundColor(.resDarkMuted)

                            Button(action: {
                                HapticManager.shared.buttonTap()
                                appState.skipToNextInQueue()
                            }) {
                                Image(systemName: "forward.fill")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.resDarkText.opacity(0.7))
                            }
                        }
                        .padding(.top, 10)
                    }
                }
                .padding(.horizontal, 36)
                .padding(.bottom, 48)
            }
        }
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.height > 100 {
                        audioManager.stop()
                        dismiss()
                    }
                }
        )
        .onAppear {
            // Auto-play when view appears
            print("🎬 ImmersivePlayerView appeared for recording: \(recording.title)")
            print("📁 Recording ID: \(recording.id)")
            
            // Set Now Playing metadata
            audioManager.setNowPlayingMetadata(title: recording.title, text: recording.text)
            
            if appState.currentlyPlaying?.id != recording.id || !audioManager.isPlaying {
                do {
                    try audioManager.play(recordingId: recording.id)
                    print("✅ Playback started")
                } catch {
                    print("❌ Failed to play recording: \(error.localizedDescription)")
                }
            }
        }
        .onDisappear {
            // Stop playback when view disappears
            audioManager.stop()
        }
        .sheet(isPresented: $showingAmbientSelector) {
            AmbientSoundSelector(
                selectedAmbient: $selectedAmbient,
                audioManager: audioManager
            )
        }
        .sheet(isPresented: $showingPlaybackOptions) {
            PlaybackOptionsSheet(
                audioManager: audioManager,
                selectedAmbient: $selectedAmbient,
                isPlayingQueue: appState.playbackQueue.count > 1,
                onOpenAmbientSelector: {
                    showingPlaybackOptions = false
                    showingAmbientSelector = true
                },
                onStopPlayback: {
                    appState.stopPlaybackAndClearQueue()
                }
            )
        }
        .fullScreenCover(isPresented: $showingFeelingCapture, onDismiss: {
            dismiss()
        }) {
            if let recording = currentRecording {
                FeelingCaptureView(
                    recording: recording,
                    playlist: nil
                )
                .environmentObject(appState)
            }
        }
    }
}

// MARK: - Ambient Sound Selector
struct AmbientSoundSelector: View {
    @Environment(\.dismiss) var dismiss
    @Binding var selectedAmbient: AmbientSound?
    @ObservedObject var audioManager: AudioManager
    
    private var orderedAmbientSounds: [AmbientSound] {
        _ = audioManager.ambientSoundPreferencesVersion
        return audioManager.orderedAmbientSoundsForDisplay(AmbientSound.sampleData)
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 16) {
                    Text("Ambient Sounds")
                        .font(.resDisplay)
                        .foregroundColor(.resText)
                    
                    Text("Add a calming background sound to enhance your meditation.")
                        .font(.resBodySm)
                        .foregroundColor(.resTextSoft)
                        .lineSpacing(4)
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                .padding(.bottom, 24)
                
                // Volume slider (if ambient is playing)
                if audioManager.isAmbientPlaying {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("VOLUME")
                                .font(.resMicro)
                                .foregroundColor(.resTextSoft)
                                .kerning(0.07)
                            Spacer()
                            Text("\(Int(audioManager.ambientVolume * 100))%")
                                .font(.resCaption)
                                .foregroundColor(.resTextMuted)
                        }
                        
                        HStack(spacing: 12) {
                            Image(systemName: "speaker.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.resTextMuted)
                            
                            Slider(value: Binding(
                                get: { audioManager.ambientVolume },
                                set: { audioManager.setAmbientVolume($0) }
                            ), in: 0...1)
                            .accentColor(.resSage)
                            
                            Image(systemName: "speaker.wave.3.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.resTextMuted)
                        }
                    }
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.vertical, 20)
                    .background(Color.resBgWarm)
                }
                
                // Sound options
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(orderedAmbientSounds) { sound in
                            AmbientSoundRow(
                                sound: sound,
                                isSelected: selectedAmbient?.id == sound.id,
                                isPlaying: audioManager.isAmbientPlaying && selectedAmbient?.id == sound.id,
                                isFavorite: audioManager.isAmbientSoundFavorite(sound),
                                onTap: {
                                    HapticManager.shared.buttonTap()
                                    if sound.id == "none" || sound.fileName.isEmpty {
                                        audioManager.stopAmbientSound()
                                        selectedAmbient = nil
                                    } else {
                                        selectedAmbient = sound
                                        audioManager.playAmbientSound(sound)
                                    }
                                    dismiss()
                                },
                                onToggleFavorite: {
                                    guard !(sound.id == "none" || sound.fileName.isEmpty) else { return }
                                    HapticManager.shared.selection()
                                    audioManager.toggleAmbientSoundFavorite(sound)
                                }
                            )
                            
                            if sound.id != orderedAmbientSounds.last?.id {
                                Rectangle()
                                    .fill(Color.resBorder)
                                    .frame(height: 1)
                                    .padding(.leading, ResSpacing.screen)
                            }
                        }
                    }
                }
                .padding(.top, 12)
            }
            .background(Color.resBg)
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Ambient Sound Row
struct AmbientSoundRow: View {
    let sound: AmbientSound
    let isSelected: Bool
    let isPlaying: Bool
    let isFavorite: Bool
    let onTap: () -> Void
    let onToggleFavorite: () -> Void
    
    private var canFavorite: Bool {
        !(sound.id == "none" || sound.fileName.isEmpty)
    }
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(isSelected ? Color.resSageSoft : Color.resBgDim)
                    .frame(width: 48, height: 48)
                
                Image(systemName: sound.icon)
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? .resSage : .resTextMuted)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(sound.name)
                    .font(.resBodyMd)
                    .foregroundColor(.resText)
                
                if isPlaying {
                    Text("Playing")
                        .font(.resCaption)
                        .foregroundColor(.resSage)
                }
            }
            
            Spacer()
            
            if canFavorite {
                Button(action: onToggleFavorite) {
                    Image(systemName: isFavorite ? "star.fill" : "star")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(isFavorite ? .resWarm : .resTextMuted)
                }
                .buttonStyle(.plain)
                .padding(.trailing, 2)
            }
            
            if isSelected {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.resSage)
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, 16)
        .background(Color.resBg)
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
    }
}

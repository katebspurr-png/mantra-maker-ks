import SwiftUI

struct ImmersivePlayerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @StateObject private var audioManager = AudioManager()
    
    let recording: Recording
    @State private var isLooping = false
    @State private var showingAmbientSelector = false
    @State private var selectedAmbient: AmbientSound?
    
    var progress: Double {
        guard audioManager.duration > 0 else { return 0 }
        return audioManager.currentTime / audioManager.duration
    }
    
    var body: some View {
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
                        dismiss()
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
                            isLooping.toggle()
                        }) {
                            Image(systemName: "repeat")
                                .font(.system(size: 20))
                                .foregroundColor(.resDarkText.opacity(isLooping ? 1.0 : 0.6))
                        }
                        .opacity(isLooping ? 1.0 : 0.5)
                        
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
            
            do {
                try audioManager.play(recordingId: recording.id)
                print("✅ Playback started")
            } catch {
                print("❌ Failed to play recording: \(error.localizedDescription)")
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
    }
}

// MARK: - Ambient Sound Selector
struct AmbientSoundSelector: View {
    @Environment(\.dismiss) var dismiss
    @Binding var selectedAmbient: AmbientSound?
    @ObservedObject var audioManager: AudioManager
    
    let ambientSounds = AmbientSound.sampleData
    
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
                        ForEach(ambientSounds) { sound in
                            AmbientSoundRow(
                                sound: sound,
                                isSelected: selectedAmbient?.id == sound.id,
                                isPlaying: audioManager.isAmbientPlaying && selectedAmbient?.id == sound.id
                            ) {
                                if sound.name == "None" {
                                    audioManager.stopAmbientSound()
                                    selectedAmbient = nil
                                } else {
                                    selectedAmbient = sound
                                    audioManager.playAmbientSound(sound)
                                }
                                dismiss()
                            }
                            
                            if sound.id != ambientSounds.last?.id {
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
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
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
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(.resSage)
                }
            }
            .padding(.horizontal, ResSpacing.screen)
            .padding(.vertical, 16)
            .background(Color.resBg)
        }
        .buttonStyle(.plain)
    }
}

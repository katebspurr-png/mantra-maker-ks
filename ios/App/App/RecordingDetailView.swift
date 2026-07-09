// ─────────────────────────────────────────────────
// Resonance — Recording Detail View
// Full recording detail with playback, editing, and analysis
// ─────────────────────────────────────────────────

import SwiftUI

struct RecordingDetailView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var themeManager: ThemeManager

    private var audioManager: AudioManager {
        appState.audioManager
    }
    
    let recording: Recording
    
    @State private var isEditingTitle = false
    @State private var editedTitle = ""
    @State private var showingDeleteAlert = false
    @State private var showingShareSheet = false
    @State private var selectedAmbient: AmbientSound?
    @State private var showingAmbientSelector = false
    
    var isPlaying: Bool {
        audioManager.isPlaying
    }
    
    var progress: Double {
        guard audioManager.duration > 0 else { return 0 }
        return audioManager.currentTime / audioManager.duration
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header Section
                VStack(alignment: .leading, spacing: 16) {
                    // Title
                    if isEditingTitle {
                        HStack(spacing: 12) {
                            TextField("Title", text: $editedTitle)
                                .font(.resBodyMd)
                                .foregroundColor(.resText)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .background(Color.resCard)
                                .overlay(
                                    RoundedRectangle(cornerRadius: ResRadius.md)
                                        .stroke(Color.resBorder, lineWidth: 1)
                                )
                                .cornerRadius(ResRadius.md)
                            
                            Button(action: saveTitle) {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 16))
                                    .foregroundColor(.resSage)
                            }
                            
                            Button(action: {
                                isEditingTitle = false
                                editedTitle = recording.title
                            }) {
                                Image(systemName: "xmark")
                                    .font(.system(size: 16))
                                    .foregroundColor(.resTextMuted)
                            }
                        }
                    } else {
                        HStack(alignment: .top, spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(recording.title)
                                    .font(.custom("CormorantGaramond-Italic", size: 24))
                                    .foregroundColor(.resText)
                                
                                Text(recording.createdAt, style: .date)
                                    .font(.resCaption)
                                    .foregroundColor(.resTextMuted)
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                HapticManager.shared.buttonTap()
                                editedTitle = recording.title
                                isEditingTitle = true
                            }) {
                                Image(systemName: "pencil")
                                    .font(.system(size: 14))
                                    .foregroundColor(.resTextMuted)
                            }
                        }
                    }
                    
                    // Category & Duration
                    HStack(spacing: 12) {
                        if let category = recording.category {
                            HStack(spacing: 4) {
                                Image(systemName: "tag.fill")
                                    .font(.system(size: 10))
                                Text(category)
                                    .font(.resMicro)
                            }
                            .foregroundColor(.resSage)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.resSageSoft)
                            .cornerRadius(ResRadius.lg)
                        }
                        
                        Text(recording.durationFormatted)
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                    }
                    
                    // Affirmation Text
                    if !recording.text.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("AFFIRMATION")
                                .font(.resMicro)
                                .foregroundColor(.resTextMuted)
                                .kerning(0.07)
                            
                            Text("\"\(recording.text)\"")
                                .font(.resSerif18)
                                .foregroundColor(.resText)
                                .lineSpacing(6)
                                .padding(16)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.resBgWarm)
                                .cornerRadius(ResRadius.md)
                        }
                        .padding(.top, 8)
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 24)
                .padding(.bottom, 32)
                
                // Player Controls
                VStack(spacing: 24) {
                    // Play Button
                    Button(action: handlePlayPause) {
                        ZStack {
                            Circle()
                                .fill(Color.resSage)
                                .frame(width: 80, height: 80)
                            
                            Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.white)
                                .offset(x: isPlaying ? 0 : 3)
                        }
                    }
                    
                    // Progress Bar
                    VStack(spacing: 8) {
                        GeometryReader { geometry in
                            ZStack(alignment: .leading) {
                                Rectangle()
                                    .fill(Color.resBgDim)
                                    .frame(height: 4)
                                    .cornerRadius(2)
                                
                                Rectangle()
                                    .fill(Color.resSage)
                                    .frame(width: geometry.size.width * progress, height: 4)
                                    .cornerRadius(2)
                            }
                            .contentShape(Rectangle())
                            .gesture(
                                DragGesture(minimumDistance: 0)
                                    .onChanged { value in
                                        let newProgress = max(0, min(1, value.location.x / geometry.size.width))
                                        let newTime = newProgress * audioManager.duration
                                        audioManager.seek(to: newTime)
                                        HapticManager.shared.selection()
                                    }
                            )
                        }
                        .frame(height: 20)
                        
                        HStack {
                            Text(formatTime(audioManager.currentTime))
                                .font(.resCaption)
                                .foregroundColor(.resTextMuted)
                            
                            Spacer()
                            
                            Text(formatTime(audioManager.duration))
                                .font(.resCaption)
                                .foregroundColor(.resTextMuted)
                        }
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.bottom, 32)
                
                // Settings Sections
                VStack(spacing: 0) {
                    // Ambient Sound
                    sectionDivider()
                    
                    Button(action: {
                        HapticManager.shared.buttonTap()
                        showingAmbientSelector = true
                    }) {
                        HStack(spacing: 16) {
                            Image(systemName: audioManager.isAmbientPlaying ? "speaker.wave.2.fill" : "speaker.wave.2")
                                .font(.system(size: 18))
                                .foregroundColor(.resTextSoft)
                                .frame(width: 24)
                            
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Ambient Sound")
                                    .font(.resBodyMd)
                                    .foregroundColor(.resText)
                                
                                if let ambient = selectedAmbient {
                                    Text(ambient.name)
                                        .font(.resCaption)
                                        .foregroundColor(.resTextMuted)
                                } else {
                                    Text("None")
                                        .font(.resCaption)
                                        .foregroundColor(.resTextMuted)
                                }
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14))
                                .foregroundColor(.resTextMuted)
                        }
                        .padding(.horizontal, ResSpacing.screen)
                        .padding(.vertical, 16)
                        .background(Color.resBg)
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    sectionDivider()
                    
                    // Tone Analysis Section
                    VStack(spacing: 0) {
                        ToneAnalysisView(recording: recording)
                            .padding(.horizontal, ResSpacing.screen)
                            .padding(.vertical, 24)
                    }
                    .background(Color.resBg)
                    
                    sectionDivider()
                    
                    // Actions Section
                    VStack(spacing: 0) {
                        // Share
                        Button(action: {
                            HapticManager.shared.buttonTap()
                            ShareManager.shared.shareRecordingWithText(recording, audioManager: appState.audioManager)
                        }) {
                            actionRow(icon: "square.and.arrow.up", label: "Share Recording", color: .resTextSoft)
                        }
                        
                        Hairline()
                            .padding(.leading, 56)
                        
                        // Favorite
                        Button(action: {
                            HapticManager.shared.soft()
                            appState.toggleFavorite(recording)
                        }) {
                            actionRow(
                                icon: recording.isFavorite ? "heart.fill" : "heart",
                                label: recording.isFavorite ? "Remove from Favorites" : "Add to Favorites",
                                color: recording.isFavorite ? .resWarm : .resTextSoft
                            )
                        }
                        
                        // Best Take (only show if recording has affirmationId)
                        if recording.affirmationId != nil {
                            Divider()
                                .padding(.leading, 56)
                            
                            Button(action: {
                                HapticManager.shared.soft()
                                appState.toggleBestTake(recording)
                            }) {
                                actionRow(
                                    icon: recording.isBestTake ? "star.fill" : "star",
                                    label: recording.isBestTake ? "Remove Best Take" : "Mark as Best Take",
                                    color: recording.isBestTake ? Color(hex: "#F59E0B") : .resTextSoft
                                )
                            }
                        }
                        
                        Hairline()
                            .padding(.leading, 56)
                        
                        // Delete
                        Button(action: {
                            HapticManager.shared.warning()
                            showingDeleteAlert = true
                        }) {
                            actionRow(icon: "trash", label: "Delete Recording", color: Color(hex: "#DC2626"))
                        }
                    }
                    .background(Color.resBg)
                }
            }
            .padding(.bottom, 40)
        }
        .background(Color.resBg)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: {
                    HapticManager.shared.buttonTap()
                    dismiss()
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20))
                        .foregroundColor(.resTextSoft)
                }
            }
            
            ToolbarItem(placement: .principal) {
                Text("Recording")
                    .font(.resSerif16)
                    .foregroundColor(.resText)
            }
        }
        .alert("Delete Recording", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {
                HapticManager.shared.buttonTap()
            }
            Button("Delete", role: .destructive) {
                HapticManager.shared.delete()
                appState.deleteRecording(recording)
                dismiss()
            }
        } message: {
            Text("Are you sure you want to delete \"\(recording.title)\"? This action cannot be undone.")
        }
        .sheet(isPresented: $showingAmbientSelector) {
            AmbientSoundSelector(
                selectedAmbient: $selectedAmbient,
                audioManager: audioManager
            )
        }
        .onAppear {
            editedTitle = recording.title
            setupPlayer()
        }
        .onDisappear {
            audioManager.stop()
        }
    }
    
    // MARK: - Helper Views
    
    func sectionDivider() -> some View {
        Hairline()
    }
    
    func actionRow(icon: String, label: String, color: Color) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
                .frame(width: 24)
            
            Text(label)
                .font(.resBody)
                .foregroundColor(color)
            
            Spacer()
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, 16)
    }
    
    // MARK: - Actions
    
    func setupPlayer() {
        do {
            try audioManager.setupPlayer(for: recording.id)
        } catch {
            print("❌ Failed to setup player: \(error)")
        }
    }
    
    func handlePlayPause() {
        HapticManager.shared.buttonTap()
        
        if isPlaying {
            audioManager.pause()
        } else {
            if audioManager.currentTime > 0 {
                audioManager.resume()
            } else {
                do {
                    try audioManager.play(recordingId: recording.id)
                } catch {
                    print("❌ Failed to play: \(error)")
                }
            }
        }
    }
    
    func saveTitle() {
        guard !editedTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }
        
        HapticManager.shared.confirm()
        appState.updateRecording(recording, title: editedTitle, category: recording.category ?? "")
        isEditingTitle = false
    }
    
    func formatTime(_ seconds: TimeInterval) -> String {
        let mins = Int(seconds) / 60
        let secs = Int(seconds) % 60
        return String(format: "%d:%02d", mins, secs)
    }
}

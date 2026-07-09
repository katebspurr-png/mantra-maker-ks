import SwiftUI

struct AffirmationDetailView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let group: AffirmationGroup
    
    @State private var showingRecordView = false
    
    var body: some View {
        ZStack {
            Color.resBg.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Affirmation text card
                    VStack(alignment: .leading, spacing: 12) {
                        Text(group.text)
                            .font(.resSerif18)
                            .foregroundColor(.resText)
                            .lineSpacing(4)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(20)
                    .background(Color.resCard)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 2)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    
                    // Record New Take button
                    Button(action: {
                        HapticManager.shared.buttonTap()
                        showingRecordView = true
                    }) {
                        HStack(spacing: 10) {
                            Image(systemName: "mic.fill")
                                .font(.system(size: 18))
                            Text("Record New Take")
                                .font(.resBodyMd.weight(.semibold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.resSage)
                        .cornerRadius(16)
                    }
                    .padding(.horizontal, 20)
                    
                    // Takes section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Your Takes (\(group.totalTakes))")
                            .font(.resSemibold)
                            .foregroundColor(.resText)
                            .padding(.horizontal, 20)
                        
                        LazyVStack(spacing: 12) {
                            ForEach(group.recordings) { recording in
                                TakeCard(recording: recording, isPlaying: isRecordingPlaying(recording))
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    
                    // Progress section (if multiple takes)
                    if group.totalTakes > 1 {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 8) {
                                Image(systemName: "chart.line.uptrend.xyaxis")
                                    .font(.system(size: 16))
                                    .foregroundColor(.resSage)
                                Text("Progress Over Time")
                                    .font(.resBodyMd.weight(.semibold))
                                    .foregroundColor(.resText)
                            }
                            
                            Text("You've recorded \(group.totalTakes) takes of this affirmation.")
                                .font(.resBodySm)
                                .foregroundColor(.resTextMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(20)
                        .background(Color.resCard)
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 2)
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.bottom, 100)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("Affirmation Practice")
                    .font(.resSemibold)
                    .foregroundColor(.resText)
            }
        }
        .sheet(isPresented: $showingRecordView) {
            RecordView(prefilledText: group.text, affirmationId: group.id)
                .environmentObject(appState)
        }
    }
    
    private func isRecordingPlaying(_ recording: Recording) -> Bool {
        return appState.currentlyPlaying?.id == recording.id && appState.audioManager.isPlaying
    }
}

// MARK: - Take Card
struct TakeCard: View {
    @EnvironmentObject var appState: AppState
    let recording: Recording
    let isPlaying: Bool
    
    @State private var showingDetail = false
    
    var body: some View {
        Button(action: {
            HapticManager.shared.buttonTap()
            showingDetail = true
        }) {
            HStack(spacing: 16) {
                // Play button
                Button(action: {
                    handlePlayPause()
                }) {
                    ZStack {
                        Circle()
                            .fill(isPlaying ? Color.resSage : Color.resCard)
                            .frame(width: 48, height: 48)
                            .overlay(
                                Circle()
                                    .stroke(Color.resSage, lineWidth: isPlaying ? 0 : 2)
                            )
                        
                        Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 18))
                            .foregroundColor(isPlaying ? .white : .resSage)
                    }
                }
                .buttonStyle(.plain)
                
                // Recording info
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        Text(recording.createdAt.formatted(date: .abbreviated, time: .omitted))
                            .font(.resBodyMd.weight(.medium))
                            .foregroundColor(.resText)
                        
                        if recording.isBestTake {
                            Image(systemName: "star.fill")
                                .font(.system(size: 12))
                                .foregroundColor(Color(hex: "#F59E0B"))
                        }
                    }
                    
                    HStack(spacing: 12) {
                        Text(recording.durationFormatted)
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                        
                        if recording.listenCount > 0 {
                            HStack(spacing: 4) {
                                Image(systemName: "play.circle.fill")
                                    .font(.system(size: 10))
                                Text("\(recording.listenCount)")
                                    .font(.resCaption)
                            }
                            .foregroundColor(.resTextMuted)
                        }
                    }
                }
                
                Spacer()
                
                // Best take badge or chevron
                if recording.isBestTake {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 10))
                        Text("Best")
                            .font(.resCaption.weight(.medium))
                    }
                    .foregroundColor(Color(hex: "#F59E0B"))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(hex: "#F59E0B").opacity(0.1))
                    .cornerRadius(12)
                } else {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14))
                        .foregroundColor(.resTextMuted)
                }
            }
            .padding(16)
            .background(Color.resCard)
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showingDetail) {
            NavigationView {
                RecordingDetailView(recording: recording)
                    .environmentObject(appState)
            }
        }
    }
    
    private func handlePlayPause() {
        HapticManager.shared.playbackStart()
        
        if appState.currentlyPlaying?.id == recording.id {
            if appState.audioManager.isPlaying {
                appState.audioManager.pause()
            } else {
                appState.audioManager.resume()
            }
        } else {
            appState.playRecording(recording)
            
            // Update listen count
            if var updatedRecording = appState.recordings.first(where: { $0.id == recording.id }) {
                updatedRecording.listenCount += 1
                if let index = appState.recordings.firstIndex(where: { $0.id == recording.id }) {
                    appState.recordings[index] = updatedRecording
                }
            }
        }
    }
}

// MARK: - Preview
#Preview {
    let sampleGroup = AffirmationGroup(
        affirmationId: "aff1",
        recordings: Array(Recording.sampleData.filter { $0.affirmationId == "aff1" })
    )
    
    return NavigationView {
        AffirmationDetailView(group: sampleGroup)
            .environmentObject(AppState())
    }
}

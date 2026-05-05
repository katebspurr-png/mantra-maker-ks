import SwiftUI

struct CreatePlaylistView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var playlistName = ""
    @State private var selectedRecordings: Set<String> = []
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Name Input
                VStack(alignment: .leading, spacing: 12) {
                    Text("Playlist Name")
                        .font(.resSemibold)
                        .foregroundColor(.resText)
                    
                    TextField("Morning Motivation", text: $playlistName)
                        .font(.resBodyMd)
                        .padding(16)
                        .background(Color.resCard)
                        .cornerRadius(ResRadius.md)
                        .overlay(
                            RoundedRectangle(cornerRadius: ResRadius.md)
                                .stroke(Color.resBorder, lineWidth: 1)
                        )
                }
                .padding(ResSpacing.screen)
                .padding(.top, 8)
                
                // Recordings List
                ScrollView {
                    VStack(spacing: 0) {
                        if appState.recordings.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "music.note.list")
                                    .font(.system(size: 40))
                                    .foregroundColor(.resTextMuted)
                                
                                Text("No recordings yet")
                                    .font(.resBodyMd)
                                    .foregroundColor(.resTextMuted)
                                
                                Text("Record some affirmations first")
                                    .font(.resCaption)
                                    .foregroundColor(.resTextMuted)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, 60)
                        } else {
                            ForEach(appState.recordings) { recording in
                                RecordingSelectRow(
                                    recording: recording,
                                    isSelected: selectedRecordings.contains(recording.id)
                                ) {
                                    if selectedRecordings.contains(recording.id) {
                                        selectedRecordings.remove(recording.id)
                                    } else {
                                        selectedRecordings.insert(recording.id)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.bottom, 100)
                }
            }
            .background(Color.resBg)
            .navigationTitle("New Playlist")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        createPlaylist()
                    }
                    .disabled(playlistName.isEmpty)
                }
            }
        }
    }
    
    private func createPlaylist() {
        let playlist = Playlist(
            name: playlistName,
            recordingIds: Array(selectedRecordings)
        )
        appState.addPlaylist(playlist)
        dismiss()
    }
}

// MARK: - Recording Select Row
struct RecordingSelectRow: View {
    let recording: Recording
    let isSelected: Bool
    let onToggle: () -> Void
    
    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 14) {
                // Checkbox
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isSelected ? Color.resSage : Color.resBorder, lineWidth: 2)
                        .frame(width: 24, height: 24)
                    
                    if isSelected {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.resSage)
                    }
                }
                
                // Recording info
                VStack(alignment: .leading, spacing: 4) {
                    Text(recording.title)
                        .font(.resBodyMd)
                        .foregroundColor(.resText)
                        .lineLimit(1)
                    
                    HStack(spacing: 8) {
                        Text(recording.durationFormatted)
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                        
                        if let category = recording.category {
                            Text("·")
                                .foregroundColor(.resTextMuted)
                            Text(category)
                                .font(.resCaption)
                                .foregroundColor(.resTextMuted)
                        }
                    }
                }
                
                Spacer()
            }
            .padding(.horizontal, ResSpacing.screen)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

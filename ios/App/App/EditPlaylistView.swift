import SwiftUI

struct EditPlaylistView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    let playlist: Playlist
    @State private var playlistName: String
    @State private var selectedRecordings: Set<String>
    
    init(playlist: Playlist) {
        self.playlist = playlist
        _playlistName = State(initialValue: playlist.name)
        _selectedRecordings = State(initialValue: Set(playlist.recordingIds))
    }
    
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
            .navigationTitle("Edit Playlist")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveChanges()
                    }
                    .disabled(playlistName.isEmpty)
                }
            }
        }
    }
    
    private func saveChanges() {
        appState.updatePlaylist(
            playlistId: playlist.id,
            name: playlistName,
            recordingIds: Array(selectedRecordings)
        )
        dismiss()
    }
}

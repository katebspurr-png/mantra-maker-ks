import SwiftUI

struct PlaylistDetailView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    let playlistId: String
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    @State private var loopPlaylist = false
    
    var playlist: Playlist? {
        appState.playlists.first { $0.id == playlistId }
    }
    
    var playlistRecordings: [Recording] {
        guard let playlist = playlist else { return [] }
        return appState.recordings.filter { playlist.recordingIds.contains($0.id) }
    }
    
    var body: some View {
        if let playlist = playlist {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text(playlist.name)
                                .font(.resDisplay)
                                .foregroundColor(.resText)
                            
                            Spacer()
                            
                            Menu {
                                Button {
                                    showingEditSheet = true
                                } label: {
                                    Label("Edit Playlist", systemImage: "pencil")
                                }
                                
                                Button(role: .destructive) {
                                    showingDeleteAlert = true
                                } label: {
                                    Label("Delete Playlist", systemImage: "trash")
                                }
                            } label: {
                                Image(systemName: "ellipsis.circle")
                                    .font(.system(size: 20))
                                    .foregroundColor(.resText)
                            }
                        }
                        
                        Text("\(playlistRecordings.count) affirmations · \(playlist.durationFormatted(from: playlistRecordings))")
                            .font(.resBodySm)
                            .foregroundColor(.resTextMuted)
                    }
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.top, 28)
                    .padding(.bottom, 20)
                    
                    // Play All Button
                    if !playlistRecordings.isEmpty {
                        VStack(spacing: 12) {
                            Button(action: playAll) {
                            HStack(spacing: 12) {
                                Image(systemName: "play.fill")
                                    .font(.system(size: 16))
                                Text("Play All")
                                    .font(.resBodyMd.weight(.semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.resSage)
                            .cornerRadius(ResRadius.md)
                        }

                            Toggle(isOn: $loopPlaylist) {
                                HStack(spacing: 8) {
                                    Image(systemName: "repeat")
                                        .font(.system(size: 14))
                                        .foregroundColor(.resTextSoft)
                                    Text("Loop playlist")
                                        .font(.resBodySm)
                                        .foregroundColor(.resTextSoft)
                                }
                            }
                            .toggleStyle(SwitchToggleStyle(tint: .resSage))
                            .padding(.horizontal, ResSpacing.screen)
                        }
                        .padding(.bottom, 24)
                    }
                    
                    // Recordings List
                    VStack(spacing: 0) {
                        if playlistRecordings.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "music.note.list")
                                    .font(.system(size: 40))
                                    .foregroundColor(.resTextMuted)
                                
                                Text("No recordings in this playlist")
                                    .font(.resBodyMd)
                                    .foregroundColor(.resTextMuted)
                                
                                Button("Add Recordings") {
                                    showingEditSheet = true
                                }
                                .font(.resBodySm)
                                .foregroundColor(.resSage)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, 60)
                        } else {
                            ForEach(Array(playlistRecordings.enumerated()), id: \.element.id) { index, recording in
                                PlaylistRecordingRow(
                                    recording: recording,
                                    index: index + 1
                                ) {
                                    appState.playPlaylist(playlistId: playlistId, startAtIndex: index, loopPlaylist: loopPlaylist)
                                } onRemove: {
                                    removeRecording(recording)
                                }
                                
                                if index < playlistRecordings.count - 1 {
                                    Rectangle()
                                        .fill(Color.resBorder)
                                        .frame(height: 1)
                                        .padding(.leading, ResSpacing.screen + 50)
                                }
                            }
                        }
                    }
                }
                .padding(.bottom, 100)
            }
            .background(Color.resBg)
            .sheet(isPresented: $showingEditSheet) {
                EditPlaylistView(playlist: playlist)
            }
            .alert("Delete Playlist", isPresented: $showingDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    deletePlaylist()
                }
            } message: {
                Text("This will delete the playlist but not the recordings.")
            }
        } else {
            Text("Playlist not found")
                .foregroundColor(.resTextMuted)
        }
    }
    
    private func playAll() {
        appState.playPlaylist(playlistId: playlistId, startAtIndex: 0, loopPlaylist: loopPlaylist)
    }
    
    private func removeRecording(_ recording: Recording) {
        appState.removeRecordingFromPlaylist(playlistId: playlistId, recordingId: recording.id)
    }
    
    private func deletePlaylist() {
        appState.deletePlaylist(playlistId: playlistId)
        dismiss()
    }
}

// MARK: - Playlist Recording Row
struct PlaylistRecordingRow: View {
    let recording: Recording
    let index: Int
    let onPlay: () -> Void
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 14) {
            // Index number
            Text("\(index)")
                .font(.resBodySm)
                .foregroundColor(.resTextMuted)
                .frame(width: 30, alignment: .trailing)
            
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
            
            // Actions
            HStack(spacing: 8) {
                Button(action: onRemove) {
                    Image(systemName: "minus.circle")
                        .font(.system(size: 18))
                        .foregroundColor(.resTextMuted)
                }
                
                SmallPlayButton(size: 34, action: onPlay)
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, 12)
    }
}

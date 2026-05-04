import SwiftUI

struct PlaylistsView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingNewPlaylist = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack(alignment: .bottom) {
                    Text("Playlists")
                        .font(.resDisplay)
                        .foregroundColor(.resText)
                    
                    Spacer()
                    
                    Button(action: { showingNewPlaylist = true }) {
                        HStack(spacing: 5) {
                            Image(systemName: "plus")
                                .font(.system(size: 14))
                            Text("New")
                                .font(.resSemiboldSm)
                        }
                        .foregroundColor(.resBg)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(Color.resText)
                        .cornerRadius(20)
                    }
                    .padding(.bottom, 4)
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                .padding(.bottom, 20)
                
                // Playlist rows
                VStack(spacing: 0) {
                    ForEach(Array(appState.playlists.enumerated()), id: \.element.id) { index, playlist in
                        PlaylistRow(playlist: playlist)
                        
                        if index < appState.playlists.count - 1 {
                            Rectangle()
                                .fill(Color.resBorder)
                                .frame(height: 1)
                                .padding(.leading, ResSpacing.screen)
                        }
                    }
                }
                
                // Create CTA
                Button(action: { showingNewPlaylist = true }) {
                    HStack(spacing: 7) {
                        Image(systemName: "plus")
                            .font(.system(size: 15))
                        Text("Create a Playlist")
                            .font(.resBodySm)
                    }
                    .foregroundColor(.resTextMuted)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: ResRadius.md)
                            .strokeBorder(
                                Color.resBorder,
                                style: StrokeStyle(lineWidth: 1.5, dash: [5])
                            )
                    )
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 12)
            }
            .padding(.bottom, ResTabBar.height + 20)
        }
        .background(Color.resBg)
        .sheet(isPresented: $showingNewPlaylist) {
            Text("Create New Playlist")
                .padding()
        }
    }
}

// MARK: - Playlist Row
struct PlaylistRow: View {
    @EnvironmentObject var appState: AppState
    let playlist: Playlist
    
    var body: some View {
        HStack(spacing: 14) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.resBgWarm)
                    .frame(width: 40, height: 40)
                
                Image(systemName: "list.bullet")
                    .font(.system(size: 16))
                    .foregroundColor(.resWarm)
            }
            
            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(playlist.name)
                    .font(.resSerif16)
                    .foregroundColor(.resText)
                
                Text("\(playlist.count) affirmations · \(playlist.durationFormatted)")
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
            }
            
            Spacer()
            
            // Play button
            SmallPlayButton(size: 34) {
                if let firstRecording = playlist.recordings.first {
                    appState.playRecording(firstRecording)
                }
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, 18)
    }
}

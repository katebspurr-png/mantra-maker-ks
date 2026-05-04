import SwiftUI

struct LibraryView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedSegment = 0
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    
    let categories = ["All", "confidence", "calm", "abundance", "clarity"]
    
    var filteredRecordings: [Recording] {
        var recordings = appState.recordings
        
        if selectedCategory != "All" {
            recordings = recordings.filter { $0.category == selectedCategory }
        }
        
        if !searchText.isEmpty {
            recordings = recordings.filter { $0.title.localizedCaseInsensitiveContains(searchText) }
        }
        
        return recordings
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                stickyHeader
                
                // Recordings List
                recordingsList
            }
            .padding(.bottom, ResTabBar.height + 20)
        }
        .background(Color.resBg)
    }
    
    var stickyHeader: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Library")
                .font(.resDisplay)
                .foregroundColor(.resText)
                .padding(.bottom, 6)
            
            // Segmented Control
            HStack(spacing: 0) {
                segmentButton(title: "My Recordings", index: 0)
                segmentButton(title: "Suggestions", index: 1)
            }
            .frame(height: 44)
            .background(Color.resBgDim)
            .cornerRadius(10)
            
            // Search Bar
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 16))
                    .foregroundColor(.resTextMuted)
                
                TextField("Search...", text: $searchText)
                    .font(.resBodySm)
                    .foregroundColor(.resText)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .background(Color.resCard)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.md)
                    .stroke(Color.resBorder, lineWidth: 1)
            )
            .cornerRadius(ResRadius.md)
            
            // Category Filters
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(categories, id: \.self) { category in
                        CategoryChip(category, isActive: selectedCategory == category) {
                            selectedCategory = category
                        }
                    }
                }
            }
            .padding(.bottom, 14)
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.top, 28)
        .background(
            Color.resBg.opacity(0.95)
                .background(.ultraThinMaterial)
        )
    }
    
    func segmentButton(title: String, index: Int) -> some View {
        Button(action: { selectedSegment = index }) {
            Text(title)
                .font(.resBodyMd)
                .foregroundColor(selectedSegment == index ? .resText : .resTextSoft)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(
                    selectedSegment == index ?
                    Color.resCard : Color.clear
                )
                .cornerRadius(10)
                .shadow(
                    color: selectedSegment == index ? .black.opacity(0.05) : .clear,
                    radius: 3,
                    x: 0,
                    y: 1
                )
        }
    }
    
    var recordingsList: some View {
        VStack(spacing: 0) {
            ForEach(Array(filteredRecordings.enumerated()), id: \.element.id) { index, recording in
                RecordingRow(recording: recording)
                
                if index < filteredRecordings.count - 1 {
                    Rectangle()
                        .fill(Color.resBorder)
                        .frame(height: 1)
                        .padding(.leading, ResSpacing.screen)
                }
            }
        }
    }
}

// MARK: - Recording Row
struct RecordingRow: View {
    @EnvironmentObject var appState: AppState
    let recording: Recording
    
    var body: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text(recording.title)
                    .font(.resSerif16)
                    .foregroundColor(.resText)
                    .lineLimit(1)
                
                HStack(spacing: 8) {
                    Text(recording.durationFormatted)
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                    
                    if let category = recording.category {
                        Text(category)
                            .font(.custom("PlusJakartaSans-Medium", size: 11))
                            .foregroundColor(.resSage)
                    }
                }
            }
            
            Spacer()
            
            HStack(spacing: 10) {
                Button(action: { appState.toggleFavorite(recording) }) {
                    Image(systemName: recording.isFavorite ? "heart.fill" : "heart")
                        .font(.system(size: 18))
                        .foregroundColor(recording.isFavorite ? .resWarm : .resTextMuted)
                }
                
                SmallPlayButton {
                    appState.playRecording(recording)
                }
                
                Button(action: {}) {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 15))
                        .foregroundColor(.resTextMuted)
                        .rotationEffect(.degrees(90))
                }
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, ResSpacing.row)
    }
}

import SwiftUI

struct LibraryView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedSegment = 0
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    
    let categories = ["All", "confidence", "calm", "abundance", "clarity"]
    
    var filteredRecordings: [Recording] {
        var recordings = appState.recordings
        
        // Filter by category
        if selectedCategory != "All" {
            recordings = recordings.filter { $0.category == selectedCategory }
        }
        
        // Filter by search text - search in title, text content, and category
        if !searchText.isEmpty {
            recordings = recordings.filter { recording in
                // Search in title
                let titleMatch = recording.title.localizedCaseInsensitiveContains(searchText)
                
                // Search in affirmation text
                let textMatch = recording.text.localizedCaseInsensitiveContains(searchText)
                
                // Search in category
                let categoryMatch = recording.category?.localizedCaseInsensitiveContains(searchText) ?? false
                
                return titleMatch || textMatch || categoryMatch
            }
        }
        
        return recordings
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                stickyHeader
                
                // Content based on selected segment
                if selectedSegment == 0 {
                    recordingsList
                } else {
                    suggestionsList
                }
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
                
                TextField("Search recordings...", text: $searchText)
                    .font(.resBodySm)
                    .foregroundColor(.resText)
                
                if !searchText.isEmpty {
                    Button(action: {
                        searchText = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.resTextMuted)
                    }
                }
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
            if filteredRecordings.isEmpty {
                // Empty state
                VStack(spacing: 12) {
                    Image(systemName: searchText.isEmpty ? "mic.slash" : "magnifyingglass")
                        .font(.system(size: 40))
                        .foregroundColor(.resTextMuted)
                    
                    Text(searchText.isEmpty ? "No recordings yet" : "No recordings found")
                        .font(.resBodyMd)
                        .foregroundColor(.resTextSoft)
                    
                    if searchText.isEmpty {
                        Text("Tap the Record button to create your first affirmation")
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                    } else {
                        Text("Try a different search term")
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 60)
            } else {
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
    
    var suggestionsList: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Filter by category
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(categories, id: \.self) { category in
                        CategoryChip(category, isActive: selectedCategory == category) {
                            selectedCategory = category
                        }
                    }
                }
            }
            .padding(.horizontal, ResSpacing.screen)
            .padding(.top, 20)
            .padding(.bottom, 14)
            
            // Suggestions list with filtering
            let filteredSuggestions = Suggestion.sampleData
                .filter { suggestion in
                    // Filter by category
                    let categoryMatch = selectedCategory == "All" || suggestion.category == selectedCategory
                    
                    // Filter by search text
                    if !searchText.isEmpty {
                        let textMatch = suggestion.text.localizedCaseInsensitiveContains(searchText)
                        let themeMatch = suggestion.theme.localizedCaseInsensitiveContains(searchText)
                        let categorySearchMatch = suggestion.category.localizedCaseInsensitiveContains(searchText)
                        return categoryMatch && (textMatch || themeMatch || categorySearchMatch)
                    }
                    
                    return categoryMatch
                }
            
            if filteredSuggestions.isEmpty {
                // Empty state
                VStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 40))
                        .foregroundColor(.resTextMuted)
                    
                    Text("No suggestions found")
                        .font(.resBodyMd)
                        .foregroundColor(.resTextSoft)
                    
                    if !searchText.isEmpty {
                        Text("Try a different search term")
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 60)
            } else {
                ForEach(filteredSuggestions) { suggestion in
                    SuggestionRow(suggestion: suggestion)
                    
                    if suggestion.id != filteredSuggestions.last?.id {
                        Rectangle()
                            .fill(Color.resBorder)
                            .frame(height: 1)
                            .padding(.horizontal, ResSpacing.screen)
                    }
                }
            }
        }
    }
}

// MARK: - Suggestion Row
struct SuggestionRow: View {
    let suggestion: Suggestion
    @State private var showingRecordSheet = false
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Theme tag
            HStack {
                Text(suggestion.theme.uppercased())
                    .font(.resMicro)
                    .foregroundColor(.resWarm)
                    .kerning(0.07)
                Spacer()
            }
            
            // Suggestion text
            Text("\"\(suggestion.text)\"")
                .font(.resSerif19)
                .foregroundColor(.resText)
                .lineSpacing(6)
            
            // Action buttons
            HStack(spacing: 12) {
                Button(action: {
                    showingRecordSheet = true
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 13))
                        Text("Record")
                            .font(.resSemiboldSm)
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.resText)
                    .cornerRadius(ResRadius.pill)
                }
                
                Button(action: {
                    HapticManager.shared.buttonTap()
                    // Copy to clipboard
                    UIPasteboard.general.string = suggestion.text
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "doc.on.doc")
                            .font(.system(size: 13))
                        Text("Copy")
                            .font(.resSemiboldSm)
                    }
                    .foregroundColor(.resTextSoft)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: ResRadius.pill)
                            .stroke(Color.resBorder, lineWidth: 1)
                    )
                }
                
                Button(action: {
                    HapticManager.shared.buttonTap()
                    ShareManager.shared.shareText(suggestion.text)
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 13))
                        Text("Share")
                            .font(.resSemiboldSm)
                    }
                    .foregroundColor(.resTextSoft)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: ResRadius.pill)
                            .stroke(Color.resBorder, lineWidth: 1)
                    )
                }
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, 20)
        .sheet(isPresented: $showingRecordSheet) {
            RecordViewWithText(affirmationText: suggestion.text)
                .environmentObject(appState)
        }
    }
}

// MARK: - Record View With Text
struct RecordViewWithText: View {
    let affirmationText: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        RecordView(prefilledText: affirmationText)
    }
}

// MARK: - Recording Row
struct RecordingRow: View {
    @EnvironmentObject var appState: AppState
    let recording: Recording
    @State private var showingDeleteAlert = false
    @State private var showingEditSheet = false
    @State private var showingDetail = false
    
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
                Button(action: {
                    HapticManager.shared.soft()
                    appState.toggleFavorite(recording)
                }) {
                    Image(systemName: recording.isFavorite ? "heart.fill" : "heart")
                        .font(.system(size: 18))
                        .foregroundColor(recording.isFavorite ? .resWarm : .resTextMuted)
                }
                
                SmallPlayButton {
                    HapticManager.shared.buttonTap()
                    appState.playRecording(recording)
                }
                
                Button(action: {
                    HapticManager.shared.buttonTap()
                    showingEditSheet = true
                }) {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 15))
                        .foregroundColor(.resTextMuted)
                        .rotationEffect(.degrees(90))
                }
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, ResSpacing.row)
        .contentShape(Rectangle())
        .onTapGesture {
            HapticManager.shared.buttonTap()
            showingDetail = true
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button(role: .destructive) {
                showingDeleteAlert = true
            } label: {
                Label("Delete", systemImage: "trash")
            }
            
            Button {
                showingEditSheet = true
            } label: {
                Label("Edit", systemImage: "pencil")
            }
            .tint(.resSage)
            
            Button {
                HapticManager.shared.buttonTap()
                ShareManager.shared.shareRecordingWithText(recording, audioManager: appState.audioManager)
            } label: {
                Label("Share", systemImage: "square.and.arrow.up")
            }
            .tint(.blue)
        }
        .alert("Delete Recording", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {
                HapticManager.shared.buttonTap()
            }
            Button("Delete", role: .destructive) {
                HapticManager.shared.delete()
                appState.deleteRecording(recording)
            }
        } message: {
            Text("Are you sure you want to delete \"\(recording.title)\"? This action cannot be undone.")
        }
        .sheet(isPresented: $showingEditSheet) {
            EditRecordingSheet(recording: recording)
                .environmentObject(appState)
        }
        .sheet(isPresented: $showingDetail) {
            NavigationView {
                RecordingDetailView(recording: recording)
                    .environmentObject(appState)
            }
        }
    }
}

// MARK: - Edit Recording Sheet
struct EditRecordingSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let recording: Recording
    
    @State private var title: String
    @State private var selectedCategory: String
    
    init(recording: Recording) {
        self.recording = recording
        self._title = State(initialValue: recording.title)
        self._selectedCategory = State(initialValue: recording.category ?? "confidence")
    }
    
    let categories = ["confidence", "calm", "abundance", "clarity"]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 16) {
                    Text("Edit Recording")
                        .font(.resDisplay)
                        .foregroundColor(.resText)
                    
                    // Title field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("TITLE")
                            .font(.resMicro)
                            .foregroundColor(.resTextSoft)
                            .kerning(0.07)
                        
                        TextField("Recording title", text: $title)
                            .font(.resBodyMd)
                            .foregroundColor(.resText)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(Color.resCard)
                            .overlay(
                                RoundedRectangle(cornerRadius: ResRadius.md)
                                    .stroke(Color.resBorder, lineWidth: 1)
                            )
                            .cornerRadius(ResRadius.md)
                    }
                    
                    // Category selector
                    VStack(alignment: .leading, spacing: 8) {
                        Text("CATEGORY")
                            .font(.resMicro)
                            .foregroundColor(.resTextSoft)
                            .kerning(0.07)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(categories, id: \.self) { category in
                                    CategoryChip(category, isActive: selectedCategory == category) {
                                        selectedCategory = category
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                .padding(.bottom, 24)
                
                Spacer()
                
                // Bottom buttons
                VStack(spacing: 12) {
                    Button(action: {
                        HapticManager.shared.confirm()
                        appState.updateRecording(recording, title: title, category: selectedCategory)
                        dismiss()
                    }) {
                        Text("Save Changes")
                            .font(.resSemibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.resText)
                            .cornerRadius(ResRadius.md)
                    }
                    
                    Button(action: { dismiss() }) {
                        Text("Cancel")
                            .font(.resBodyMd)
                            .foregroundColor(.resTextSoft)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.bottom, 30)
            }
            .background(Color.resBg)
            .navigationBarHidden(true)
        }
    }
}

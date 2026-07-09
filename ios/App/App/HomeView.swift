import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var expandedSections: Set<String> = ["thought-transformer"]
    @State private var todaySuggestion = ""
    @State private var suggestionCategory = "confidence"
    @State private var showingRecordSheet = false
    @State private var showingThoughtTransformer = false
    @State private var showingRecordWithSuggestion = false
    @State private var showingReflections = false
    
    var currentRecording: Recording? {
        appState.recordings.first
    }
    
    var favoriteRecordings: [Recording] {
        appState.recordings.filter { $0.isFavorite }
    }
    
    var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<12: return "GOOD MORNING"
        case 12..<17: return "GOOD AFTERNOON"
        default: return "GOOD EVENING"
        }
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                stickyHeader
                
                // Your Practice Section
                if let recording = currentRecording {
                    yourPracticeSection(recording: recording)
                }
                
                // Divider
                Rectangle()
                    .fill(Color.resBorder)
                    .frame(height: 1)
                    .padding(.top, 36)
                
                // Record Button
                recordButton
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.top, 32)
                
                // Try Today Section
                tryTodaySection
                    .padding(.top, 32)
                
                // Collapsible Sections
                collapsibleSections
                    .padding(.top, 32)
            }
            .padding(.bottom, ResTabBar.height + 20)
        }
        .background(Color.resBg)
        .sheet(isPresented: $showingRecordSheet) {
            RecordView()
                .environmentObject(appState)
        }
        .sheet(isPresented: $showingThoughtTransformer) {
            ThoughtTransformerView()
                .environmentObject(appState)
        }
        .sheet(isPresented: $showingRecordWithSuggestion) {
            RecordView(prefillText: todaySuggestion)
                .environmentObject(appState)
        }
        .sheet(isPresented: $showingReflections) {
            ReflectionsView()
                .environmentObject(appState)
        }
        .onAppear {
            if todaySuggestion.isEmpty {
                generateNewSuggestion()
            }
        }
    }
    
    private func generateNewSuggestion() {
        // Personalize based on user's most common categories
        let categoryCount = Dictionary(grouping: appState.recordings.compactMap { $0.category }) { $0 }
            .mapValues { $0.count }
        
        let mostCommonCategory = categoryCount.max(by: { $0.value < $1.value })?.key ?? "confidence"
        
        // Get suggestions for this category
        let categorySuggestions = Suggestion.sampleData.filter { $0.category == mostCommonCategory }
        
        if let suggestion = categorySuggestions.randomElement() {
            withAnimation {
                todaySuggestion = suggestion.text
                suggestionCategory = suggestion.category
            }
        } else {
            // Fallback to random suggestion
            if let suggestion = Suggestion.sampleData.randomElement() {
                withAnimation {
                    todaySuggestion = suggestion.text
                    suggestionCategory = suggestion.category
                }
            }
        }
        
        HapticManager.shared.buttonTap()
    }
    
    var stickyHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting)
                .font(.custom("PlusJakartaSans-SemiBold", size: 13))
                .foregroundColor(.resTextMuted)
                .kerning(0.04)
            
            Text("Kate")
                .font(.resDisplay)
                .foregroundColor(.resText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, ResSpacing.screen)
        .padding(.top, 28)
        .padding(.bottom, 40)
        .background(
            Color.resBg.opacity(0.96)
                .background(.ultraThinMaterial)
        )
    }
    
    func yourPracticeSection(recording: Recording) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            EyebrowLabel("Your practice", color: .resSage)
            
            AffirmationQuoteView(text: "\"\(recording.text)\"", size: .large)
            
            HStack(spacing: 14) {
                PlayButtonCircle(size: 52) {
                    appState.playRecording(recording)
                }
                
                VStack(alignment: .leading, spacing: 1) {
                    Text(recording.title)
                        .font(.resBodyMd)
                        .foregroundColor(.resText)
                        .lineLimit(1)
                    
                    Text("Listened \(recording.listenCount) times")
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                }
            }
            .padding(.top, 6)
        }
        .padding(.horizontal, ResSpacing.screen)
    }
    
    var recordButton: some View {
        Button(action: { showingRecordSheet = true }) {
            HStack(spacing: 9) {
                Image(systemName: "mic")
                    .font(.system(size: 16))
                    .foregroundColor(.resTextSoft)
                
                Text("Record a New Affirmation")
                    .font(.resBodyMd)
                    .foregroundColor(.resTextSoft)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.md)
                    .stroke(Color.resBorder, lineWidth: 1.5)
            )
        }
    }
    
    var tryTodaySection: some View {
        WarmBlock {
            VStack(alignment: .leading, spacing: 16) {
                EyebrowLabel("Try today", color: .resWarm)
                
                AffirmationQuoteView(text: "\"\(todaySuggestion)\"", size: .medium)
                
                HStack {
                    HStack(spacing: 8) {
                        Text(suggestionCategory.capitalized)
                            .font(.resCaption)
                            .foregroundColor(.resWarm)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 3)
                            .background(Color.resWarmSoft)
                            .cornerRadius(12)
                        
                        Button(action: generateNewSuggestion) {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 13))
                                .foregroundColor(.resTextMuted)
                                .padding(4)
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: { showingRecordWithSuggestion = true }) {
                        HStack(spacing: 6) {
                            Image(systemName: "mic")
                                .font(.system(size: 12))
                            Text("Record")
                                .font(.resSemiboldSm)
                        }
                        .foregroundColor(.resWarm)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.resWarm.opacity(0.5), lineWidth: 1)
                        )
                    }
                }
                .padding(.top, 2)
            }
        }
    }
    
    var collapsibleSections: some View {
        VStack(spacing: 0) {
            CollapsibleSection(
                title: "Thought Transformer",
                subtitle: nil,
                isExpanded: .constant(expandedSections.contains("thought-transformer"))
            ) {
                AnyView(
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Turn a limiting belief into a powerful mantra.")
                            .font(.resBodySm)
                            .foregroundColor(.resTextSoft)
                            .lineSpacing(4)
                        
                        Button(action: { showingThoughtTransformer = true }) {
                            HStack(spacing: 5) {
                                Text("Transform a Thought")
                                    .font(.resBodyMd)
                                    .foregroundColor(.resSage)
                                
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 13))
                                    .foregroundColor(.resSage)
                            }
                        }
                    }
                )
            }
            
            CollapsibleSection(
                title: "Favorites",
                subtitle: favoriteRecordings.isEmpty ? nil : "\(favoriteRecordings.count) recording\(favoriteRecordings.count == 1 ? "" : "s")",
                isExpanded: Binding(
                    get: { expandedSections.contains("favorites") },
                    set: { isExpanded in
                        if isExpanded {
                            expandedSections.insert("favorites")
                        } else {
                            expandedSections.remove("favorites")
                        }
                    }
                )
            ) {
                if favoriteRecordings.isEmpty {
                    AnyView(
                        Text("Tap the heart icon on any recording to add it to your favorites.")
                            .font(.resBodySm)
                            .foregroundColor(.resTextMuted)
                            .lineSpacing(4)
                    )
                } else {
                    AnyView(
                        VStack(spacing: 0) {
                            ForEach(favoriteRecordings.prefix(5)) { recording in
                                FavoriteRecordingRow(recording: recording)
                                
                                if recording.id != favoriteRecordings.prefix(5).last?.id {
                                    Rectangle()
                                        .fill(Color.resBorder)
                                        .frame(height: 1)
                                }
                            }
                        }
                    )
                }
            }
            
            CollapsibleSection(
                title: "How it's been",
                subtitle: nil,
                isExpanded: Binding(
                    get: { expandedSections.contains("reflections") },
                    set: { isExpanded in
                        if isExpanded {
                            expandedSections.insert("reflections")
                        } else {
                            expandedSections.remove("reflections")
                        }
                    }
                )
            ) {
                AnyView(reflectionsContent)
            }
        }
    }
    
    private var reflectionsContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            if appState.reflections.isEmpty {
                // Empty state
                Text("After you listen, you can leave a word about how you feel. It gathers here.")
                    .font(.custom("PlusJakartaSans-Regular", size: 13))
                    .foregroundColor(.resTextSoft)
                    .lineSpacing(3)
            } else {
                // Show recent words
                Text("Words you've left after listening, lately:")
                    .font(.resBodySm)
                    .foregroundColor(.resTextSoft)
                
                let recentWords = appState.getRecentReflectionWords(limit: 3)
                Text(recentWords.joined(separator: " · "))
                    .font(.custom("CormorantGaramond-LightItalic", size: 24))
                    .foregroundColor(.resText)
                    .lineSpacing(10)  // 1.9 line-height ≈ 10pt extra at 24pt
                    .padding(.vertical, 4)
                
                // Link to full page
                Button(action: { showingReflections = true }) {
                    HStack(spacing: 5) {
                        Text("See your reflections")
                            .font(.resBodyMd)
                            .foregroundColor(.resSage)
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 13))
                            .foregroundColor(.resSage)
                    }
                }
            }
        }
    }
}

// MARK: - Favorite Recording Row
struct FavoriteRecordingRow: View {
    let recording: Recording
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Button(action: {
            appState.playRecording(recording)
        }) {
            HStack(spacing: 12) {
                // Play button
                ZStack {
                    Circle()
                        .fill(Color.resSageSoft)
                        .frame(width: 36, height: 36)
                    
                    Image(systemName: "play.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.resSage)
                        .offset(x: 1)
                }
                
                // Recording info
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
                
                // Heart icon
                Image(systemName: "heart.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.resWarm)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}

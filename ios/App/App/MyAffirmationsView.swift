import SwiftUI

// MARK: - Affirmation Group Model
struct AffirmationGroup: Identifiable {
    let id: String  // affirmationId
    let text: String
    var recordings: [Recording]
    var bestTake: Recording?
    var latestRecording: Recording
    var totalTakes: Int {
        recordings.count
    }
    
    init(affirmationId: String, recordings: [Recording]) {
        self.id = affirmationId
        self.recordings = recordings.sorted { $0.createdAt > $1.createdAt }
        self.text = recordings.first?.text ?? ""
        self.bestTake = recordings.first(where: { $0.isBestTake })
        self.latestRecording = self.recordings.first ?? recordings[0]
    }
}

// MARK: - My Affirmations View
struct MyAffirmationsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var searchText = ""
    
    // Group recordings by affirmationId
    private var affirmationGroups: [AffirmationGroup] {
        let recordingsWithAffirmationId = appState.recordings.filter { $0.affirmationId != nil }
        
        // Group by affirmationId
        let grouped = Dictionary(grouping: recordingsWithAffirmationId) { $0.affirmationId! }
        
        // Convert to AffirmationGroup array and sort by latest recording date
        return grouped.map { AffirmationGroup(affirmationId: $0.key, recordings: $0.value) }
            .sorted { $0.latestRecording.createdAt > $1.latestRecording.createdAt }
    }
    
    // Filter by search
    private var filteredGroups: [AffirmationGroup] {
        if searchText.isEmpty {
            return affirmationGroups
        }
        let searchLower = searchText.lowercased()
        return affirmationGroups.filter {
            $0.text.lowercased().contains(searchLower) ||
            $0.latestRecording.title.lowercased().contains(searchLower)
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.resBg.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Search bar
                        HStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.resTextMuted)
                                .font(.system(size: 16))
                            
                            TextField("Search affirmations...", text: $searchText)
                                .font(.resBodyMd)
                                .foregroundColor(.resText)
                            
                            if !searchText.isEmpty {
                                Button(action: {
                                    searchText = ""
                                    HapticManager.shared.light()
                                }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.resTextMuted)
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color.resCard)
                        .cornerRadius(12)
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                        
                        // Groups list
                        if filteredGroups.isEmpty {
                            emptyStateView
                        } else {
                            LazyVStack(spacing: 12) {
                                ForEach(filteredGroups) { group in
                                    NavigationLink(destination: AffirmationDetailView(group: group)) {
                                        AffirmationGroupCard(group: group)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                    .padding(.bottom, 100)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("My Affirmations")
                        .font(.resSemibold)
                        .foregroundColor(.resText)
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        HapticManager.shared.buttonTap()
                        dismiss()
                    }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.resText)
                            .font(.system(size: 16, weight: .medium))
                    }
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "layers.fill")
                .font(.system(size: 56))
                .foregroundColor(Color.resTextMuted.opacity(0.5))
            
            Text(affirmationGroups.isEmpty ? "No affirmation recordings yet" : "No affirmations match your search")
                .font(.resBody)
                .foregroundColor(.resTextMuted)
                .multilineTextAlignment(.center)
            
            if affirmationGroups.isEmpty {
                Button(action: {
                    HapticManager.shared.buttonTap()
                    dismiss()
                }) {
                    Text("Record Your First Affirmation")
                        .font(.resBodyMd.weight(.medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(Color.resSage)
                        .cornerRadius(12)
                }
            }
        }
        .padding(.top, 80)
    }
}

// MARK: - Affirmation Group Card
struct AffirmationGroupCard: View {
    let group: AffirmationGroup
    
    var body: some View {
        HStack(spacing: 16) {
            // Left content
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Text(group.text)
                        .font(.resBodyMd.weight(.medium))
                        .foregroundColor(.resText)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    
                    if group.bestTake != nil {
                        Image(systemName: "star.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "#F59E0B"))
                    }
                }
                
                Text("\(group.totalTakes) \(group.totalTakes == 1 ? "take" : "takes")")
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
            }
            
            Spacer()
            
            // Take count badge
            HStack(spacing: 4) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 10))
                    .foregroundColor(.resTextMuted)
                
                Text("\(group.totalTakes)")
                    .font(Font.resCaption.weight(.medium))
                    .foregroundColor(.resTextMuted)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.resTextMuted.opacity(0.1))
            .cornerRadius(12)
        }
        .padding(16)
        .background(Color.resCard)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 2)
    }
}

// MARK: - Preview
#Preview {
    MyAffirmationsView()
        .environmentObject(AppState())
}

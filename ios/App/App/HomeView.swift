import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var expandedSections: Set<String> = ["thought-transformer"]
    @State private var todaySuggestion = "I am worthy of success and I embrace challenges as opportunities."
    
    var currentRecording: Recording? {
        appState.recordings.first
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
    }
    
    var stickyHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("GOOD MORNING")
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
        Button(action: {}) {
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
                        Text("Confidence")
                            .font(.resCaption)
                            .foregroundColor(.resWarm)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 3)
                            .background(Color.resWarmSoft)
                            .cornerRadius(12)
                        
                        Button(action: {}) {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 13))
                                .foregroundColor(.resTextMuted)
                                .padding(4)
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: {}) {
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
                        
                        Button(action: {}) {
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
                subtitle: nil,
                isExpanded: .constant(false)
            )
            
            CollapsibleSection(
                title: "How it's been",
                subtitle: nil,
                isExpanded: .constant(false)
            )
        }
    }
}

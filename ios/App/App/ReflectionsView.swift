import SwiftUI

struct ReflectionsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var reflectionToDelete: Reflection?
    @State private var showingDeleteConfirmation = false
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            Color.resBg.ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(.resText)
                    }
                    
                    Spacer()
                    
                    Text("How it's been")
                        .font(.custom("CormorantGaramond-LightItalic", size: 17))
                        .foregroundColor(.resText)
                    
                    Spacer()
                    
                    // Invisible spacer for centering
                    Image(systemName: "chevron.left")
                        .font(.system(size: 17, weight: .medium))
                        .opacity(0)
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 62)
                .padding(.bottom, 20)
                
                if appState.reflections.isEmpty {
                    emptyState
                } else {
                    reflectionsList
                }
            }
        }
        .confirmationDialog("Delete this reflection?", isPresented: $showingDeleteConfirmation, presenting: reflectionToDelete) { reflection in
            Button("Delete", role: .destructive) {
                appState.deleteReflection(reflection)
            }
            Button("Cancel", role: .cancel) {}
        }
    }
    
    private var emptyState: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Intro
            Text("A quiet record of how practice has felt — in your words, only when you choose to leave them.")
                .font(.resBody)
                .foregroundColor(.resTextSoft)
                .lineSpacing(4.5)  // 1.65 line-height ≈ 4.5 extra spacing at 15pt
            
            Spacer()
            
            // Footer card
            footerCard
        }
        .padding(.horizontal, ResSpacing.screen)
    }
    
    private var reflectionsList: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Intro
                Text("A quiet record of how practice has felt — in your words, only when you choose to leave them.")
                    .font(.resBody)
                    .foregroundColor(.resTextSoft)
                    .lineSpacing(4.5)
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.bottom, 32)
                
                // Grouped reflections
                let groupedReflections = groupReflections()
                
                if !groupedReflections.thisWeek.isEmpty {
                    sectionHeader("THIS WEEK")
                    ForEach(groupedReflections.thisWeek) { reflection in
                        reflectionRow(reflection)
                    }
                }
                
                if !groupedReflections.earlier.isEmpty {
                    sectionHeader("EARLIER")
                        .padding(.top, groupedReflections.thisWeek.isEmpty ? 0 : 24)
                    ForEach(groupedReflections.earlier) { reflection in
                        reflectionRow(reflection)
                    }
                }
                
                // Footer card
                footerCard
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.top, 32)
                    .padding(.bottom, 40)
            }
        }
    }
    
    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.custom("PlusJakartaSans-SemiBold", size: 11))
            .kerning(0.99)  // 0.09em at 11pt
            .foregroundColor(.resSage)
            .padding(.horizontal, ResSpacing.screen)
            .padding(.bottom, 12)
    }
    
    private func reflectionRow(_ reflection: Reflection) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Day word
            Text(reflection.displayDay())
                .font(.resCaption)
                .foregroundColor(.resTextMuted)
            
            // Feeling word in curly quotes
            Text("\u{201C}\(reflection.word)\u{201D}")
                .font(.resFeelingWord)
                .foregroundColor(.resText)
            
            // Context
            Text("after \(reflection.sourceTitle)")
                .font(.custom("PlusJakartaSans-Regular", size: 13))
                .foregroundColor(.resTextSoft)
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.vertical, 18)
        .background(
            VStack {
                Spacer()
                Hairline()
            }
        )
        .contentShape(Rectangle())
        .onLongPressGesture {
            reflectionToDelete = reflection
            showingDeleteConfirmation = true
            HapticManager.shared.soft()
        }
    }
    
    private var footerCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("This page holds only what you choose to add. Nothing is counted, scored, or tracked automatically.")
                .font(.custom("PlusJakartaSans-Regular", size: 13))
                .foregroundColor(.resTextSoft)
                .lineSpacing(3)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.resBgDim)
        .cornerRadius(ResRadius.lg)
    }
    
    private func groupReflections() -> (thisWeek: [Reflection], earlier: [Reflection]) {
        var thisWeek: [Reflection] = []
        var earlier: [Reflection] = []
        
        for reflection in appState.reflections {
            if reflection.isThisWeek() {
                thisWeek.append(reflection)
            } else {
                earlier.append(reflection)
            }
        }
        
        return (thisWeek, earlier)
    }
}

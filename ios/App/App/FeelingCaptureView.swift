import SwiftUI

struct FeelingCaptureView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    let recording: Recording?
    let playlist: Playlist?
    
    @State private var selectedWord: String? = nil
    @State private var customWord: String = ""
    @State private var showingCustomInput: Bool = false
    
    private let suggestedWords = ["lighter", "steadier", "calm", "tender", "strong"]
    
    var body: some View {
        ZStack {
            // Dark gradient background (same as immersive player)
            LinearGradient(
                colors: [
                    Color(hex: "#1C1610"),
                    Color(hex: "#141009"),
                    Color(hex: "#0F0C07")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .overlay(
                // Soft terracotta radial glow
                RadialGradient(
                    colors: [
                        Color.resWarm.opacity(0.15),
                        Color.clear
                    ],
                    center: .center,
                    startRadius: 0,
                    endRadius: 400
                )
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                Spacer()
                
                // Content
                VStack(spacing: 24) {
                    // Eyebrow
                    Text("A MOMENT BEFORE YOU GO")
                        .font(.custom("PlusJakartaSans-SemiBold", size: 11))
                        .kerning(1.1)  // 0.1em
                        .foregroundColor(Color.white.opacity(0.3))
                    
                    // Title
                    Text("How do you feel right now?")
                        .font(.custom("CormorantGaramond-LightItalic", size: 27))
                        .foregroundColor(Color(hex: "#FAF4EC").opacity(0.92))
                        .multilineTextAlignment(.center)
                    
                    // Word chips or custom input
                    if showingCustomInput {
                        customInputField
                    } else {
                        wordChips
                    }
                    
                    // Toggle to custom input
                    if !showingCustomInput {
                        Button(action: { showingCustomInput = true }) {
                            Text("or write your own…")
                                .font(.resBodySm)
                                .foregroundColor(Color.white.opacity(0.35))
                        }
                    }
                }
                .frame(maxWidth: 300)
                
                Spacer()
                
                // Actions
                VStack(spacing: 12) {
                    // Primary: Keep this
                    Button(action: saveReflection) {
                        Text("Keep this")
                            .font(.resBodyMd)
                            .foregroundColor(Color(hex: "#1C1610"))
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(Color(hex: "#FAF4EC").opacity(0.92))
                            .cornerRadius(ResRadius.md)
                    }
                    .disabled(!canSave)
                    .opacity(canSave ? 1 : 0.5)
                    
                    // Skip
                    Button(action: { dismiss() }) {
                        Text("Skip")
                            .font(.resBodySm)
                            .foregroundColor(Color.white.opacity(0.4))
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.bottom, 56)
            }
        }
    }
    
    private var wordChips: some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                wordChip("lighter")
                wordChip("steadier")
            }
            HStack(spacing: 10) {
                wordChip("calm")
                wordChip("tender")
                wordChip("strong")
            }
        }
    }
    
    private func wordChip(_ word: String) -> some View {
        Button(action: { selectWord(word) }) {
            Text(word)
                .font(.custom("CormorantGaramond-LightItalic", size: 16))
                .foregroundColor(
                    selectedWord == word ?
                        Color(hex: "#FAEBDE").opacity(0.95) :
                        Color(hex: "#FAF4EC").opacity(0.6)
                )
                .padding(.horizontal, 20)
                .padding(.vertical, 11)
                .background(
                    selectedWord == word ?
                        Color.resWarm.opacity(0.22) :
                        Color.white.opacity(0.05)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(
                            selectedWord == word ?
                                Color.resWarm.opacity(0.55) :
                                Color.white.opacity(0.1),
                            lineWidth: 1
                        )
                )
                .cornerRadius(24)
        }
    }
    
    private var customInputField: some View {
        VStack(spacing: 12) {
            TextField("", text: $customWord)
                .font(.custom("CormorantGaramond-LightItalic", size: 16))
                .foregroundColor(Color(hex: "#FAF4EC").opacity(0.92))
                .multilineTextAlignment(.center)
                .frame(maxWidth: 300)
                .padding(.horizontal, 20)
                .padding(.vertical, 11)
                .background(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
                .cornerRadius(24)
                .onChange(of: customWord) { _ in
                    // Limit to ~24 chars
                    if customWord.count > 24 {
                        customWord = String(customWord.prefix(24))
                    }
                    // Clear chip selection when typing
                    selectedWord = nil
                }
            
            Button(action: { showingCustomInput = false; customWord = "" }) {
                Text("← back to suggestions")
                    .font(.resBodySm)
                    .foregroundColor(Color.white.opacity(0.35))
            }
        }
    }
    
    private var canSave: Bool {
        if let selected = selectedWord, !selected.isEmpty {
            return true
        }
        return !customWord.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private func selectWord(_ word: String) {
        if selectedWord == word {
            selectedWord = nil
        } else {
            selectedWord = word
            customWord = ""
            showingCustomInput = false
        }
    }
    
    private func saveReflection() {
        let word = selectedWord ?? customWord.trimmingCharacters(in: .whitespaces)
        guard !word.isEmpty else { return }
        
        // Determine source
        if let recording = recording {
            appState.addReflection(
                word: word,
                sourceType: .affirmation,
                sourceId: recording.id,
                sourceTitle: recording.title
            )
        } else if let playlist = playlist {
            appState.addReflection(
                word: word,
                sourceType: .playlist,
                sourceId: playlist.id,
                sourceTitle: playlist.name
            )
        }
        
        HapticManager.shared.soft()
        dismiss()
    }
}

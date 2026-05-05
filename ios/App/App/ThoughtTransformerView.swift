import SwiftUI

struct ThoughtTransformerView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var limitingBelief = ""
    @State private var transformedAffirmation = ""
    @State private var isTransforming = false
    @State private var showingRecordSheet = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Thought Transformer")
                            .font(.resDisplay)
                            .foregroundColor(.resText)
                        
                        Text("Turn a limiting belief into a powerful mantra")
                            .font(.resBodySm)
                            .foregroundColor(.resTextMuted)
                            .lineSpacing(4)
                    }
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.top, 8)
                    
                    // Input Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("What's holding you back?")
                            .font(.resSemibold)
                            .foregroundColor(.resText)
                        
                        ZStack(alignment: .topLeading) {
                            TextEditor(text: $limitingBelief)
                                .font(.resBodyMd)
                                .foregroundColor(.resText)
                                .padding(12)
                                .frame(minHeight: 120)
                                .background(Color.resCard)
                                .cornerRadius(ResRadius.md)
                                .overlay(
                                    RoundedRectangle(cornerRadius: ResRadius.md)
                                        .stroke(Color.resBorder, lineWidth: 1)
                                )
                            
                            if limitingBelief.isEmpty {
                                Text("I'm not good enough at...")
                                    .font(.resBodyMd)
                                    .foregroundColor(.resTextMuted)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 20)
                                    .allowsHitTesting(false)
                            }
                        }
                        
                        Text("Examples: \"I'm not smart enough\", \"I always fail\", \"Nobody listens to me\"")
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                            .lineSpacing(3)
                    }
                    .padding(.horizontal, ResSpacing.screen)
                    
                    // Transform Button
                    Button(action: transformThought) {
                        HStack(spacing: 12) {
                            if isTransforming {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                Text("Transforming...")
                            } else {
                                Image(systemName: "wand.and.stars")
                                    .font(.system(size: 16))
                                Text("Transform")
                            }
                        }
                        .font(.resBodyMd.weight(.semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(limitingBelief.isEmpty ? Color.resTextMuted : Color.resSage)
                        .cornerRadius(ResRadius.md)
                    }
                    .disabled(limitingBelief.isEmpty || isTransforming)
                    .padding(.horizontal, ResSpacing.screen)
                    
                    // Result Section
                    if !transformedAffirmation.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            Divider()
                                .padding(.vertical, 8)
                            
                            VStack(alignment: .leading, spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "sparkles")
                                        .font(.system(size: 16))
                                        .foregroundColor(.resSage)
                                    
                                    Text("Your Empowering Affirmation")
                                        .font(.resSemibold)
                                        .foregroundColor(.resText)
                                }
                                
                                Text(transformedAffirmation)
                                    .font(.resSerif18)
                                    .foregroundColor(.resText)
                                    .lineSpacing(6)
                                    .padding(20)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(Color.resBgWarm)
                                    .cornerRadius(ResRadius.md)
                            }
                            
                            // Actions
                            HStack(spacing: 12) {
                                Button(action: { showingRecordSheet = true }) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "mic.fill")
                                            .font(.system(size: 14))
                                        Text("Record This")
                                            .font(.resBodySm.weight(.semibold))
                                    }
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Color.resSage)
                                    .cornerRadius(ResRadius.md)
                                }
                                
                                Button(action: copyToClipboard) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "doc.on.doc")
                                            .font(.system(size: 14))
                                        Text("Copy")
                                            .font(.resBodySm.weight(.semibold))
                                    }
                                    .foregroundColor(.resText)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Color.resCard)
                                    .cornerRadius(ResRadius.md)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: ResRadius.md)
                                            .stroke(Color.resBorder, lineWidth: 1)
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, ResSpacing.screen)
                    }
                }
                .padding(.bottom, 100)
            }
            .background(Color.resBg)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showingRecordSheet) {
                RecordView(prefillText: transformedAffirmation)
                    .environmentObject(appState)
            }
        }
    }
    
    private func transformThought() {
        isTransforming = true
        
        // Simulate AI transformation with realistic delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            transformedAffirmation = generateAffirmation(from: limitingBelief)
            isTransforming = false
            HapticManager.shared.success()
        }
    }
    
    private func generateAffirmation(from belief: String) -> String {
        let lowercased = belief.lowercased()
        
        // Pattern matching for common limiting beliefs
        if lowercased.contains("not good enough") || lowercased.contains("not smart enough") {
            return "I am constantly growing and my abilities expand every day. I am more than capable of achieving my goals."
        } else if lowercased.contains("always fail") || lowercased.contains("can't succeed") {
            return "Every setback is a setup for my next success. I learn, adapt, and thrive through challenges."
        } else if lowercased.contains("nobody listens") || lowercased.contains("don't listen") {
            return "My voice matters and my perspective brings value. I speak with clarity and others listen with respect."
        } else if lowercased.contains("not worthy") || lowercased.contains("don't deserve") {
            return "I am inherently worthy of love, success, and abundance. My worthiness is not something I earn—it simply is."
        } else if lowercased.contains("too old") || lowercased.contains("too late") {
            return "Every moment is the perfect time to begin. My experience is an asset, and my potential is limitless."
        } else if lowercased.contains("not creative") || lowercased.contains("not talented") {
            return "Creativity flows through me naturally. I trust my unique perspective and the gifts I bring to the world."
        } else if lowercased.contains("can't change") || lowercased.contains("stuck") {
            return "I am constantly evolving. Change is my natural state, and I embrace the transformation happening within me."
        } else {
            // Generic positive transformation
            return "I release limiting beliefs and embrace my unlimited potential. I am capable, worthy, and destined for great things."
        }
    }
    
    private func copyToClipboard() {
        UIPasteboard.general.string = transformedAffirmation
        HapticManager.shared.success()
    }
}

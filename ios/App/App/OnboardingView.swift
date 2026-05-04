import SwiftUI

struct OnboardingFlow: View {
    @EnvironmentObject var appState: AppState
    @State private var currentStep = 0
    
    var body: some View {
        TabView(selection: $currentStep) {
            OnboardingVibeView(
                currentStep: $currentStep,
                onComplete: { appState.hasCompletedOnboarding = true }
            )
            .tag(0)
            
            OnboardingIntentionView(
                currentStep: $currentStep,
                onComplete: { appState.hasCompletedOnboarding = true }
            )
            .tag(1)
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .ignoresSafeArea()
    }
}

// MARK: - Step 1: Vibe
struct OnboardingVibeView: View {
    @Binding var currentStep: Int
    let onComplete: () -> Void
    
    @State private var selectedVibe: String? = "grounded"
    
    let vibes: [(id: String, title: String, subtitle: String, icon: String)] = [
        ("focused", "Focused", "Clean, disciplined, minimal.", "circle"),
        ("grounded", "Grounded", "Calm, steady, spacious.", "leaf"),
        ("energized", "Energized", "Forward-moving, confident, sharp.", "bolt.fill")
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // Progress dots
            ProgressDots(currentStep: 0, totalSteps: 6)
                .padding(.top, 36)
                .padding(.bottom, 4)
            
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    EyebrowLabel("Welcome", color: .resSage)
                        .padding(.bottom, 16)
                    
                    Text("How should this space feel?")
                        .font(.custom("CormorantGaramond-LightItalic", size: 34))
                        .foregroundColor(.resText)
                        .lineSpacing(4)
                        .padding(.bottom, 10)
                    
                    Text("Choose the tone that supports the way you work.")
                        .font(.resBody)
                        .foregroundColor(.resTextMuted)
                        .lineSpacing(4)
                        .padding(.bottom, 32)
                    
                    VStack(spacing: 10) {
                        ForEach(vibes, id: \.id) { vibe in
                            OnboardingOptionCard(
                                title: vibe.title,
                                subtitle: vibe.subtitle,
                                icon: vibe.icon,
                                isSelected: selectedVibe == vibe.id
                            ) {
                                selectedVibe = vibe.id
                            }
                        }
                    }
                }
                .padding(.horizontal, 28)
                .padding(.top, 28)
            }
            
            Spacer()
            
            Button(action: { currentStep = 1 }) {
                Text("Continue")
                    .font(.custom("PlusJakartaSans-Medium", size: 16))
                    .foregroundColor(.resBg)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(selectedVibe != nil ? Color.resText : Color.resText.opacity(0.4))
                    .cornerRadius(ResRadius.md)
            }
            .disabled(selectedVibe == nil)
            .padding(.horizontal, 26)
            .padding(.bottom, 44)
        }
        .background(Color.resBg)
    }
}

// MARK: - Step 2: Intention
struct OnboardingIntentionView: View {
    @Binding var currentStep: Int
    let onComplete: () -> Void
    
    @State private var selectedIntention: String? = "confidence"
    
    let intentions: [(id: String, emoji: String, title: String)] = [
        ("confidence", "🌱", "Build Confidence"),
        ("calm", "🌊", "Find Calm"),
        ("self-love", "💛", "Practice Self-Love"),
        ("focus", "🎯", "Sharpen Focus"),
        ("healing", "🦋", "Support Healing"),
        ("exploring", "✨", "Just Exploring")
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // Progress dots
            ProgressDots(currentStep: 1, totalSteps: 6)
                .padding(.top, 36)
                .padding(.bottom, 4)
            
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Text("What brings you here?")
                        .font(.custom("CormorantGaramond-LightItalic", size: 34))
                        .foregroundColor(.resText)
                        .lineSpacing(4)
                        .padding(.bottom, 10)
                    
                    Text("There's no wrong answer. This shapes your experience.")
                        .font(.resBody)
                        .foregroundColor(.resTextMuted)
                        .lineSpacing(4)
                        .padding(.bottom, 32)
                    
                    VStack(spacing: 8) {
                        ForEach(intentions, id: \.id) { intention in
                            OnboardingIntentionCard(
                                emoji: intention.emoji,
                                title: intention.title,
                                isSelected: selectedIntention == intention.id
                            ) {
                                selectedIntention = intention.id
                            }
                        }
                    }
                }
                .padding(.horizontal, 28)
                .padding(.top, 28)
            }
            
            Spacer()
            
            Button(action: onComplete) {
                Text("Continue")
                    .font(.custom("PlusJakartaSans-Medium", size: 16))
                    .foregroundColor(.resBg)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(selectedIntention != nil ? Color.resText : Color.resText.opacity(0.4))
                    .cornerRadius(ResRadius.md)
            }
            .disabled(selectedIntention == nil)
            .padding(.horizontal, 26)
            .padding(.bottom, 44)
        }
        .background(Color.resBg)
    }
}

// MARK: - Progress Dots
struct ProgressDots: View {
    let currentStep: Int
    let totalSteps: Int
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<totalSteps, id: \.self) { index in
                RoundedRectangle(cornerRadius: 3)
                    .fill(
                        index == currentStep ? Color.resSage.opacity(0.8) :
                        index < currentStep ? Color.resSage.opacity(0.3) :
                        Color.resBorder
                    )
                    .frame(width: index == currentStep ? 24 : 5, height: 5)
                    .animation(.easeInOut(duration: 0.4), value: currentStep)
            }
        }
    }
}

// MARK: - Onboarding Option Card
struct OnboardingOptionCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(isSelected ? Color.resSageSoft : Color.resBgDim)
                        .frame(width: 42, height: 42)
                    
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(isSelected ? .resSage : .resTextMuted)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.custom("CormorantGaramond-Italic", size: 16))
                        .fontWeight(isSelected ? .medium : .regular)
                        .foregroundColor(isSelected ? .resText : .resTextSoft)
                    
                    Text(subtitle)
                        .font(.resSemiboldSm)
                        .foregroundColor(.resTextMuted)
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.resSage)
                }
            }
            .padding(18)
            .background(Color.resCard)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.lg)
                    .stroke(
                        isSelected ? Color.resSage.opacity(0.4) : Color.resBorder,
                        lineWidth: 1.5
                    )
            )
            .cornerRadius(ResRadius.lg)
            .shadow(
                color: isSelected ? Color.resSage.opacity(0.1) : .clear,
                radius: isSelected ? 8 : 0,
                x: 0,
                y: 2
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Intention Card
struct OnboardingIntentionCard: View {
    let emoji: String
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Text(emoji)
                    .font(.system(size: 22))
                
                Text(title)
                    .font(.custom("CormorantGaramond-Italic", size: 16))
                    .fontWeight(isSelected ? .medium : .regular)
                    .foregroundColor(isSelected ? .resText : .resTextSoft)
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.resSage)
                }
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(Color.resCard)
            .overlay(
                RoundedRectangle(cornerRadius: ResRadius.lg)
                    .stroke(
                        isSelected ? Color.resSage.opacity(0.4) : Color.resBorder,
                        lineWidth: 1.5
                    )
            )
            .cornerRadius(ResRadius.lg)
            .shadow(
                color: isSelected ? Color.resSage.opacity(0.1) : .clear,
                radius: isSelected ? 7 : 0,
                x: 0,
                y: 2
            )
        }
        .buttonStyle(.plain)
    }
}

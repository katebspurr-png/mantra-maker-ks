import SwiftUI

struct RecordView: View {
    @Environment(\.dismiss) var dismiss
    @State private var isRecording = false
    @State private var hasRecorded = false
    @State private var affirmationText = "I am a highly sought-after professional whose expertise enriches any team I join."
    @State private var showTeleprompter = true
    @State private var showKaraoke = true
    
    var body: some View {
        NavigationView {
            Group {
                if hasRecorded {
                    RecordSaveView(
                        affirmationText: affirmationText,
                        onSave: {
                            dismiss()
                        },
                        onTryAgain: {
                            hasRecorded = false
                        },
                        onDiscard: {
                            dismiss()
                        }
                    )
                } else {
                    RecordReadyView(
                        affirmationText: $affirmationText,
                        isRecording: $isRecording,
                        showTeleprompter: $showTeleprompter,
                        showKaraoke: $showKaraoke,
                        onRecordComplete: {
                            hasRecorded = true
                        }
                    )
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 20))
                            .foregroundColor(.resTextSoft)
                    }
                }
                
                ToolbarItem(placement: .principal) {
                    Text(hasRecorded ? "Save Affirmation" : "New Affirmation")
                        .font(.resSerif17)
                        .foregroundColor(.resText)
                }
            }
        }
    }
}

// MARK: - Record Ready View
struct RecordReadyView: View {
    @Binding var affirmationText: String
    @Binding var isRecording: Bool
    @Binding var showTeleprompter: Bool
    @Binding var showKaraoke: Bool
    let onRecordComplete: () -> Void
    
    @State private var showingEditSheet = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Affirmation Text Block
                VStack(alignment: .leading, spacing: 14) {
                    Text(attributedText)
                        .font(.resAffirmationSm)
                        .foregroundColor(.resText)
                        .lineSpacing(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    Button(action: { showingEditSheet = true }) {
                        Text("Edit text")
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                    }
                }
                .padding(.horizontal, 22)
                .padding(.vertical, 26)
                .frame(maxWidth: .infinity)
                .background(Color.resBgWarm)
                .cornerRadius(ResRadius.lg)
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 24)
                
                // Microphone Button
                VStack(spacing: 16) {
                    ZStack {
                        BreathingRing(diameter: 130, color: .resSage, delay: 0)
                        BreathingRing(diameter: 108, color: .resSage, delay: 1)
                        
                        Button(action: {
                            isRecording.toggle()
                            if !isRecording {
                                // Simulate recording completion
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                    onRecordComplete()
                                }
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .stroke(Color.resText, lineWidth: 2)
                                    .frame(width: 88, height: 88)
                                
                                Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                                    .font(.system(size: 34))
                                    .foregroundColor(.resText)
                            }
                        }
                    }
                    .frame(width: 130, height: 130)
                    
                    Text(isRecording ? "Recording..." : "Tap to begin")
                        .font(.resSemiboldSm)
                        .foregroundColor(.resTextMuted)
                        .kerning(0.02)
                }
                .padding(.top, 48)
                
                // Settings
                VStack(spacing: 0) {
                    Rectangle()
                        .fill(Color.resBorder)
                        .frame(height: 1)
                        .padding(.top, 40)
                    
                    HStack(spacing: 24) {
                        ToggleButton(label: "Teleprompter", isOn: $showTeleprompter)
                        ToggleButton(label: "Karaoke", isOn: $showKaraoke)
                    }
                    .padding(.top, 20)
                }
                .padding(.horizontal, ResSpacing.screen)
            }
            .padding(.bottom, 40)
        }
        .background(Color.resBg)
        .sheet(isPresented: $showingEditSheet) {
            TextEditor(text: $affirmationText)
                .padding()
        }
    }
    
    var attributedText: AttributedString {
        var attributed = AttributedString(affirmationText)
        if let firstWordRange = attributed.range(of: affirmationText.split(separator: " ").first.map(String.init) ?? "") {
            attributed[firstWordRange].backgroundColor = Color.resWarm.opacity(0.2)
        }
        return attributed
    }
}

// MARK: - Toggle Button
struct ToggleButton: View {
    let label: String
    @Binding var isOn: Bool
    
    var body: some View {
        Button(action: { isOn.toggle() }) {
            HStack(spacing: 7) {
                ZStack {
                    RoundedRectangle(cornerRadius: 9)
                        .fill(isOn ? Color.resSage : Color.resBorder)
                        .frame(width: 30, height: 17)
                    
                    Circle()
                        .fill(Color.white)
                        .frame(width: 11, height: 11)
                        .offset(x: isOn ? 6 : -6)
                        .animation(.easeInOut(duration: 0.2), value: isOn)
                }
                
                Text(label)
                    .font(.resSemiboldSm)
                    .foregroundColor(.resTextSoft)
            }
        }
    }
}

// MARK: - Record Save View
struct RecordSaveView: View {
    let affirmationText: String
    let onSave: () -> Void
    let onTryAgain: () -> Void
    let onDiscard: () -> Void
    
    @State private var title = "I am a highly sought-after pr..."
    @State private var selectedPlayback = 2 // Loop until I stop
    
    let playbackOptions = ["Play once", "Loop 3 times", "Loop until I stop"]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Waveform Player
                waveformPlayer
                    .padding(.top, 20)
                
                // Affirmation Review
                VStack(alignment: .leading, spacing: 10) {
                    EyebrowLabel("Your affirmation", color: .resWarm)
                    
                    AffirmationQuoteView(text: affirmationText, size: .small)
                        .font(.resSerif19)
                }
                .padding(.horizontal, 22)
                .padding(.vertical, 20)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.resBgWarm)
                .cornerRadius(ResRadius.lg)
                
                // Settings Card
                VStack(alignment: .leading, spacing: 12) {
                    Text("TITLE")
                        .font(.resMicro)
                        .foregroundColor(.resTextMuted)
                        .kerning(0.07)
                    
                    Text(title)
                        .font(.resBody)
                        .foregroundColor(.resText)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.resBgDim)
                        .cornerRadius(ResRadius.md)
                    
                    Text("PLAYBACK")
                        .font(.resMicro)
                        .foregroundColor(.resTextMuted)
                        .kerning(0.07)
                        .padding(.top, 8)
                    
                    VStack(spacing: 0) {
                        ForEach(Array(playbackOptions.enumerated()), id: \.offset) { index, option in
                            if index > 0 {
                                Rectangle()
                                    .fill(Color.resBorder)
                                    .frame(height: 1)
                            }
                            
                            RadioButton(
                                label: option,
                                isSelected: selectedPlayback == index,
                                action: { selectedPlayback = index }
                            )
                            .padding(.vertical, 11)
                        }
                    }
                }
                .padding(.horizontal, 22)
                .padding(.vertical, 20)
                .background(Color.resCard)
                .overlay(
                    RoundedRectangle(cornerRadius: ResRadius.lg)
                        .stroke(Color.resBorder, lineWidth: 1)
                )
                .cornerRadius(ResRadius.lg)
                
                // Action Buttons
                VStack(spacing: 10) {
                    Button(action: onSave) {
                        Text("Save Recording")
                            .font(.resSemibold)
                            .foregroundColor(.resBg)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(Color.resText)
                            .cornerRadius(ResRadius.md)
                    }
                    
                    Button(action: onTryAgain) {
                        HStack(spacing: 7) {
                            Image(systemName: "arrow.counterclockwise")
                                .font(.system(size: 14))
                            Text("Try Again")
                                .font(.resBodySm)
                        }
                        .foregroundColor(.resTextSoft)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: ResRadius.md)
                                .stroke(Color.resBorder, lineWidth: 1)
                        )
                    }
                    
                    Button(action: onDiscard) {
                        HStack(spacing: 7) {
                            Image(systemName: "trash")
                                .font(.system(size: 14))
                            Text("Discard")
                                .font(.resBodySm)
                        }
                        .foregroundColor(.resWarm.opacity(0.6))
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                    }
                }
            }
            .padding(.horizontal, ResSpacing.screen)
            .padding(.bottom, 32)
        }
        .background(Color.resBg)
    }
    
    var waveformPlayer: some View {
        HStack(spacing: 12) {
            Button(action: {}) {
                ZStack {
                    Circle()
                        .fill(Color.resText)
                        .frame(width: 38, height: 38)
                    
                    Image(systemName: "play.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.white)
                        .offset(x: 1)
                }
            }
            
            WaveformBar()
            
            Text("0:16")
                .font(.resCaption)
                .foregroundColor(.resTextMuted)
                .monospacedDigit()
        }
        .padding(18)
        .background(Color.resCard)
        .overlay(
            RoundedRectangle(cornerRadius: ResRadius.lg)
                .stroke(Color.resBorder, lineWidth: 1)
        )
        .cornerRadius(ResRadius.lg)
    }
}

// MARK: - Radio Button
struct RadioButton: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .stroke(isSelected ? Color.resSage : Color.resBorder, lineWidth: 2)
                        .frame(width: 18, height: 18)
                    
                    if isSelected {
                        Circle()
                            .fill(Color.resSage)
                            .frame(width: 8, height: 8)
                    }
                }
                
                Text(label)
                    .font(.resBodySm)
                    .foregroundColor(isSelected ? .resText : .resTextSoft)
                
                Spacer()
            }
        }
    }
}

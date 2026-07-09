import SwiftUI

struct ToneAnalysisView: View {
    let recording: Recording
    @State private var analysis: ToneAnalysis?
    @State private var isAnalyzing = false
    @State private var isLoading = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack(spacing: 8) {
                Image(systemName: "sparkles")
                    .font(.system(size: 14))
                    .foregroundColor(.resSage)
                
                Text("Tone Analysis")
                    .font(.resSemibold)
                    .foregroundColor(.resText)
                
                Spacer()
                
                if analysis == nil && !isAnalyzing {
                    Button(action: runAnalysis) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 12))
                            Text("Run Analysis")
                                .font(.resCaption.weight(.medium))
                        }
                        .foregroundColor(.resSage)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.resSageSoft)
                        .cornerRadius(8)
                    }
                }
            }
            
            if isLoading {
                // Loading state
                VStack(spacing: 12) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .resSage))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
                .background(Color.resBgWarm)
                .cornerRadius(12)
            } else if isAnalyzing {
                // Analyzing state
                VStack(spacing: 12) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .resSage))
                    Text("Analyzing your tone and delivery...")
                        .font(.resBodySm)
                        .foregroundColor(.resTextMuted)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
                .background(Color.resBgWarm)
                .cornerRadius(12)
            } else if let analysis = analysis {
                // Analysis results
                VStack(spacing: 16) {
                    // Score bars
                    VStack(spacing: 16) {
                        ScoreBar(label: "Conviction", score: analysis.convictionScore)
                        ScoreBar(label: "Sincerity", score: analysis.sincerityScore)
                    }
                    .padding(16)
                    .background(Color.resBgWarm)
                    .cornerRadius(12)
                    
                    // Summary
                    VStack(alignment: .leading, spacing: 8) {
                        Text(analysis.summary)
                            .font(.resBodySm)
                            .foregroundColor(.resText)
                            .lineSpacing(4)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(Color.resBgWarm)
                    .cornerRadius(12)
                    
                    // Strengths
                    if !analysis.strengths.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 6) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(hex: "#10B981"))
                                Text("Strengths")
                                    .font(.resBodySm.weight(.medium))
                                    .foregroundColor(Color(hex: "#10B981"))
                            }
                            
                            VStack(alignment: .leading, spacing: 6) {
                                ForEach(analysis.strengths, id: \.self) { strength in
                                    HStack(alignment: .top, spacing: 8) {
                                        Text("•")
                                            .foregroundColor(Color(hex: "#10B981"))
                                        Text(strength)
                                            .font(.resBodySm)
                                            .foregroundColor(.resTextSoft)
                                    }
                                }
                            }
                        }
                    }
                    
                    // Improvements
                    if !analysis.improvements.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 6) {
                                Image(systemName: "chart.line.uptrend.xyaxis")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color(hex: "#F59E0B"))
                                Text("Areas to Grow")
                                    .font(.resBodySm.weight(.medium))
                                    .foregroundColor(Color(hex: "#F59E0B"))
                            }
                            
                            VStack(alignment: .leading, spacing: 6) {
                                ForEach(analysis.improvements, id: \.self) { improvement in
                                    HStack(alignment: .top, spacing: 8) {
                                        Text("•")
                                            .foregroundColor(Color(hex: "#F59E0B"))
                                        Text(improvement)
                                            .font(.resBodySm)
                                            .foregroundColor(.resTextSoft)
                                    }
                                }
                            }
                        }
                    }
                    
                    // Practice Exercise
                    if let exercise = analysis.practiceExercise {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 6) {
                                Image(systemName: "lightbulb.fill")
                                    .font(.system(size: 14))
                                    .foregroundColor(.resSage)
                                Text("Practice Exercise")
                                    .font(.resBodySm.weight(.medium))
                                    .foregroundColor(.resSage)
                            }
                            
                            Text(exercise)
                                .font(.resBodySm)
                                .foregroundColor(.resText)
                                .lineSpacing(4)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(Color.resSageSoft.opacity(0.5))
                        .cornerRadius(12)
                    }
                    
                    // Re-analyze button
                    Button(action: runAnalysis) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 14))
                            Text("Re-run Analysis")
                                .font(.resBodySm.weight(.medium))
                        }
                        .foregroundColor(.resTextSoft)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.resCard)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.resBorder, lineWidth: 1)
                        )
                        .cornerRadius(12)
                    }
                    
                    // Timestamp
                    Text("Analyzed on \(analysis.createdAt.formatted(date: .abbreviated, time: .omitted))")
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                        .frame(maxWidth: .infinity)
                }
            } else {
                // Empty state
                VStack(spacing: 12) {
                    Text("Get AI feedback on your conviction and sincerity when speaking this affirmation.")
                        .font(.resBodySm)
                        .foregroundColor(.resTextMuted)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            }
        }
        .onAppear {
            loadAnalysis()
        }
    }
    
    private func loadAnalysis() {
        // Check if we have a saved analysis for this recording
        if let saved = loadSavedAnalysis(for: recording.id) {
            analysis = saved
        }
        isLoading = false
    }
    
    private func runAnalysis() {
        HapticManager.shared.buttonTap()
        isAnalyzing = true
        
        // Simulate AI analysis with a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            // Generate mock analysis based on recording
            let mockAnalysis = generateMockAnalysis(for: recording)
            analysis = mockAnalysis
            saveAnalysis(mockAnalysis)
            isAnalyzing = false
            HapticManager.shared.success()
        }
    }
    
    // MARK: - Mock Analysis Generator
    
    private func generateMockAnalysis(for recording: Recording) -> ToneAnalysis {
        // Use UUID to generate a stable seed value
        let uuidString = recording.id
        var seedValue = 0
        for char in uuidString.unicodeScalars {
            seedValue = seedValue &+ Int(char.value)
        }
        let seed = abs(seedValue)
        
        // Generate scores (60-95 range for demo)
        let conviction = 60 + (seed % 35)
        let sincerity = 65 + ((seed * 7) % 30)
        
        // Single summary based on seed
        let summaryOptions = [
            "Your delivery shows genuine emotion and strong vocal presence. The pacing feels natural, allowing each word to land with intention.",
            "There's a warm authenticity in your tone. Consider emphasizing key phrases slightly more to deepen the emotional impact.",
            "You speak with clarity and conviction. Your voice conveys confidence, and the affirmation feels personally meaningful.",
            "Your delivery is steady and grounded. There's room to explore more emotional range to enhance the connection with the words.",
        ]
        let summary = summaryOptions[seed % 4]
        
        // Select strengths
        let strengthOptions = [
            "Clear, confident vocal tone",
            "Natural pacing and rhythm",
            "Genuine emotional connection",
            "Strong emphasis on key words",
            "Steady, grounded delivery",
        ]
        let strengths = [
            strengthOptions[seed % 5],
            strengthOptions[(seed + 1) % 5],
            strengthOptions[(seed + 2) % 5]
        ]
        
        // Select improvements
        let improvementOptions = [
            "Try varying your pitch for emotional emphasis",
            "Pause slightly longer between phrases",
            "Explore softer, more intimate moments",
            "Experiment with breathing techniques",
        ]
        let improvements = [
            improvementOptions[seed % 4],
            improvementOptions[(seed + 1) % 4]
        ]
        
        // Select exercise
        let exerciseOptions = [
            "Record this affirmation again with your eyes closed, focusing entirely on the feeling behind the words.",
            "Try saying this affirmation while placing your hand on your heart. Notice how it changes your delivery.",
            "Practice emphasizing different words each time you say it, and notice which feels most powerful.",
        ]
        let exercise = exerciseOptions[seed % 3]
        
        return ToneAnalysis(
            id: UUID().uuidString,
            recordingId: recording.id,
            createdAt: Date(),
            sincerityScore: sincerity,
            convictionScore: conviction,
            summary: summary,
            strengths: strengths,
            improvements: improvements,
            practiceExercise: exercise
        )
    }
    
    // MARK: - Persistence
    
    private func saveAnalysis(_ analysis: ToneAnalysis) {
        let key = "tone_analysis_\(recording.id)"
        if let encoded = try? JSONEncoder().encode(analysis) {
            UserDefaults.standard.set(encoded, forKey: key)
        }
    }
    
    private func loadSavedAnalysis(for recordingId: String) -> ToneAnalysis? {
        let key = "tone_analysis_\(recordingId)"
        guard let data = UserDefaults.standard.data(forKey: key),
              let analysis = try? JSONDecoder().decode(ToneAnalysis.self, from: data) else {
            return nil
        }
        return analysis
    }
}

// MARK: - Score Bar Component
struct ScoreBar: View {
    let label: String
    let score: Int
    
    private var scoreColor: Color {
        if score >= 71 { return Color(hex: "#10B981") }
        if score >= 41 { return Color(hex: "#F59E0B") }
        return Color(hex: "#EF4444")
    }
    
    private var scoreLabel: String {
        if score >= 71 { return "High" }
        if score >= 41 { return "Moderate" }
        return "Building"
    }
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(label)
                    .font(.resBodySm.weight(.medium))
                    .foregroundColor(.resText)
                
                Spacer()
                
                Text("\(score)/100 · \(scoreLabel)")
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.resTextMuted.opacity(0.15))
                        .frame(height: 8)
                        .cornerRadius(4)
                    
                    Rectangle()
                        .fill(scoreColor)
                        .frame(width: geometry.size.width * CGFloat(score) / 100, height: 8)
                        .cornerRadius(4)
                        .animation(.easeInOut(duration: 0.5), value: score)
                }
            }
            .frame(height: 8)
        }
    }
}

// MARK: - Preview
#Preview {
    ToneAnalysisView(recording: Recording.sampleData[0])
        .padding()
        .background(Color.resBg)
}

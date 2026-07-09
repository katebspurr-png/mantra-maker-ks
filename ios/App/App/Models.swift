import Foundation

// MARK: - Recording Model
struct Recording: Identifiable, Codable {
    let id: String
    var title: String
    let text: String
    let duration: TimeInterval
    let createdAt: Date
    var isFavorite: Bool
    var listenCount: Int
    var category: String?
    var affirmationId: String?  // Groups recordings by same affirmation text
    var isBestTake: Bool        // User's favorite version of this affirmation
    
    var durationFormatted: String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Playlist Model
struct Playlist: Identifiable, Codable {
    let id: String
    var name: String
    var recordingIds: [String]  // Store IDs instead of full recordings for Codable
    
    // Transient property - not stored
    var recordings: [Recording] {
        get { [] }  // Will be computed from AppState
        set { }
    }
    
    var count: Int { recordingIds.count }
    
    func totalDuration(from recordings: [Recording]) -> TimeInterval {
        recordings.filter { recordingIds.contains($0.id) }.reduce(0) { $0 + $1.duration }
    }
    
    func durationFormatted(from recordings: [Recording]) -> String {
        let total = totalDuration(from: recordings)
        let minutes = Int(total) / 60
        let seconds = Int(total) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
    
    init(id: String = UUID().uuidString, name: String, recordingIds: [String] = []) {
        self.id = id
        self.name = name
        self.recordingIds = recordingIds
    }
}

// MARK: - Suggestion Model
struct Suggestion: Identifiable {
    let id: String
    let text: String
    let category: String
    let theme: String
    
    init(id: String = UUID().uuidString, text: String, category: String, theme: String) {
        self.id = id
        self.text = text
        self.category = category
        self.theme = theme
    }
}

// MARK: - Ambient Sound Model
struct AmbientSound: Identifiable {
    let id: String
    let name: String
    let fileName: String
    let icon: String
    
    var fileURL: URL? {
        Bundle.main.url(forResource: fileName, withExtension: "mp3")
    }
    
    init(id: String = UUID().uuidString, name: String, fileName: String, icon: String) {
        self.id = id
        self.name = name
        self.fileName = fileName
        self.icon = icon
    }
}

// MARK: - Tone Analysis Model
struct ToneAnalysis: Identifiable, Codable {
    let id: String
    let recordingId: String
    let createdAt: Date
    let sincerityScore: Int      // 0-100
    let convictionScore: Int     // 0-100
    let summary: String
    let strengths: [String]
    let improvements: [String]
    let practiceExercise: String?
    
    var averageScore: Int {
        (sincerityScore + convictionScore) / 2
    }
    
    var scoreLevel: String {
        let avg = averageScore
        if avg >= 71 { return "High" }
        if avg >= 41 { return "Moderate" }
        return "Building"
    }
    
    init(id: String = UUID().uuidString, recordingId: String, createdAt: Date = Date(), sincerityScore: Int, convictionScore: Int, summary: String, strengths: [String], improvements: [String], practiceExercise: String? = nil) {
        self.id = id
        self.recordingId = recordingId
        self.createdAt = createdAt
        self.sincerityScore = sincerityScore
        self.convictionScore = convictionScore
        self.summary = summary
        self.strengths = strengths
        self.improvements = improvements
        self.practiceExercise = practiceExercise
    }
}

// MARK: - Sample Data
extension Recording {
    static let sampleData: [Recording] = [
        Recording(
            id: "1",
            title: "I am a highly sought-after professional...",
            text: "I am a highly sought-after professional whose expertise enriches any team I join.",
            duration: 74,
            createdAt: Date(),
            isFavorite: true,
            listenCount: 12,
            category: "confidence",
            affirmationId: "aff1",
            isBestTake: true
        ),
        Recording(
            id: "2",
            title: "I am ready to accept the fact that good things...",
            text: "I am ready to accept the fact that good things happen to me.",
            duration: 16,
            createdAt: Date().addingTimeInterval(-86400),
            isFavorite: false,
            listenCount: 3,
            category: "abundance",
            affirmationId: "aff2",
            isBestTake: false
        ),
        Recording(
            id: "3",
            title: "Today I move forward with grace and intention.",
            text: "Today I move forward with grace and intention.",
            duration: 21,
            createdAt: Date().addingTimeInterval(-172800),
            isFavorite: false,
            listenCount: 5,
            category: "clarity",
            affirmationId: "aff3",
            isBestTake: false
        ),
        Recording(
            id: "4",
            title: "Today I will take a step toward my dreams.",
            text: "Today I will take a step toward my dreams.",
            duration: 16,
            createdAt: Date().addingTimeInterval(-259200),
            isFavorite: false,
            listenCount: 2,
            category: "confidence",
            affirmationId: "aff4",
            isBestTake: false
        ),
        Recording(
            id: "5",
            title: "I let go of what I cannot control.",
            text: "I let go of what I cannot control.",
            duration: 18,
            createdAt: Date().addingTimeInterval(-345600),
            isFavorite: false,
            listenCount: 8,
            category: "calm",
            affirmationId: "aff5",
            isBestTake: false
        ),
        Recording(
            id: "6",
            title: "Affirmation — 12/14/2025",
            text: "I am capable of great things.",
            duration: 11,
            createdAt: Date().addingTimeInterval(-432000),
            isFavorite: false,
            listenCount: 1,
            category: nil,
            affirmationId: "aff6",
            isBestTake: false
        ),
        // Additional takes of same affirmations
        Recording(
            id: "7",
            title: "I am a highly sought-after professional... (Take 2)",
            text: "I am a highly sought-after professional whose expertise enriches any team I join.",
            duration: 68,
            createdAt: Date().addingTimeInterval(-518400),
            isFavorite: false,
            listenCount: 4,
            category: "confidence",
            affirmationId: "aff1",
            isBestTake: false
        ),
        Recording(
            id: "8",
            title: "I am a highly sought-after professional... (Take 3)",
            text: "I am a highly sought-after professional whose expertise enriches any team I join.",
            duration: 71,
            createdAt: Date().addingTimeInterval(-604800),
            isFavorite: false,
            listenCount: 2,
            category: "confidence",
            affirmationId: "aff1",
            isBestTake: false
        ),
    ]
}

extension Playlist {
    static let sampleData: [Playlist] = []
}

extension Suggestion {
    static let sampleData: [Suggestion] = [
        // Confidence
        Suggestion(text: "I trust my abilities and make confident decisions.", category: "confidence", theme: "Self-trust"),
        Suggestion(text: "My voice matters and I speak my truth with courage.", category: "confidence", theme: "Self-expression"),
        Suggestion(text: "I am capable of achieving great things.", category: "confidence", theme: "Achievement"),
        Suggestion(text: "I embrace challenges as opportunities for growth.", category: "confidence", theme: "Growth mindset"),
        
        // Calm
        Suggestion(text: "I release what I cannot control and find peace in this moment.", category: "calm", theme: "Letting go"),
        Suggestion(text: "My breath anchors me to the present moment.", category: "calm", theme: "Presence"),
        Suggestion(text: "I choose peace over worry, calm over chaos.", category: "calm", theme: "Inner peace"),
        Suggestion(text: "I am safe, I am grounded, I am at peace.", category: "calm", theme: "Safety"),
        
        // Abundance
        Suggestion(text: "Opportunities flow to me effortlessly and abundantly.", category: "abundance", theme: "Opportunity"),
        Suggestion(text: "I am worthy of all the good things life has to offer.", category: "abundance", theme: "Worthiness"),
        Suggestion(text: "I attract success and prosperity in all areas of my life.", category: "abundance", theme: "Prosperity"),
        Suggestion(text: "There is more than enough for everyone, including me.", category: "abundance", theme: "Sufficiency"),
        
        // Clarity
        Suggestion(text: "I trust my intuition to guide me toward the right path.", category: "clarity", theme: "Intuition"),
        Suggestion(text: "My mind is clear and I make decisions with ease.", category: "clarity", theme: "Decision-making"),
        Suggestion(text: "I see my next steps clearly and move forward with confidence.", category: "clarity", theme: "Direction"),
        Suggestion(text: "I release confusion and welcome clarity into my life.", category: "clarity", theme: "Mental clarity"),
        
        // Self-love
        Suggestion(text: "I am enough exactly as I am in this moment.", category: "confidence", theme: "Self-acceptance"),
        Suggestion(text: "I treat myself with the same kindness I offer others.", category: "calm", theme: "Self-compassion"),
        Suggestion(text: "My worth is inherent and does not depend on external validation.", category: "confidence", theme: "Self-worth"),
        
        // Growth
        Suggestion(text: "Every experience teaches me something valuable.", category: "clarity", theme: "Learning"),
        Suggestion(text: "I am constantly evolving into my best self.", category: "confidence", theme: "Evolution"),
        Suggestion(text: "I welcome change as a catalyst for transformation.", category: "clarity", theme: "Change"),
    ]
}

extension AmbientSound {
    static let sampleData: [AmbientSound] = [
        // Use stable IDs so favorites/recents can persist across app launches.
        AmbientSound(id: "none", name: "None", fileName: "", icon: "speaker.slash"),
        AmbientSound(id: "rain", name: "Rain", fileName: "rain", icon: "cloud.rain.fill"),
        AmbientSound(id: "ocean", name: "Ocean Waves", fileName: "ocean", icon: "water.waves"),
        AmbientSound(id: "piano", name: "Soft Piano", fileName: "piano", icon: "music.note"),
        AmbientSound(id: "arnor", name: "Arnor", fileName: "Arnor(chosic.com)", icon: "sparkles"),
        AmbientSound(id: "evening-improvisation", name: "Evening Improvisation", fileName: "Evening-Improvisation-with-Ethera(chosic.com)", icon: "moon.stars"),
        AmbientSound(id: "golden-hour", name: "Golden Hour", fileName: "Golden-Hour-chosic.com_", icon: "sun.max"),
        AmbientSound(id: "moonlight", name: "Moonlight", fileName: "scott-buckley-moonlight(chosic.com)", icon: "moon"),
        AmbientSound(id: "the-long-way-home", name: "The Long Way Home", fileName: "The-Long-Way-Home-chosic.com_", icon: "arrow.right"),
        AmbientSound(id: "transcendence", name: "Transcendence", fileName: "Transcendence-chosic.com_", icon: "star"),
    ]
}

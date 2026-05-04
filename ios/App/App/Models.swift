import Foundation

// MARK: - Recording Model
struct Recording: Identifiable {
    let id: String
    let title: String
    let text: String
    let duration: TimeInterval
    let createdAt: Date
    var isFavorite: Bool
    var listenCount: Int
    var category: String?
    
    var durationFormatted: String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Playlist Model
struct Playlist: Identifiable {
    let id: String
    let name: String
    let recordings: [Recording]
    
    var count: Int { recordings.count }
    var totalDuration: TimeInterval {
        recordings.reduce(0) { $0 + $1.duration }
    }
    var durationFormatted: String {
        let minutes = Int(totalDuration) / 60
        let seconds = Int(totalDuration) % 60
        return String(format: "%d:%02d", minutes, seconds)
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
            category: "confidence"
        ),
        Recording(
            id: "2",
            title: "I am ready to accept the fact that good things...",
            text: "I am ready to accept the fact that good things happen to me.",
            duration: 16,
            createdAt: Date().addingTimeInterval(-86400),
            isFavorite: false,
            listenCount: 3,
            category: "abundance"
        ),
        Recording(
            id: "3",
            title: "Today I move forward with grace and intention.",
            text: "Today I move forward with grace and intention.",
            duration: 21,
            createdAt: Date().addingTimeInterval(-172800),
            isFavorite: false,
            listenCount: 5,
            category: "clarity"
        ),
        Recording(
            id: "4",
            title: "Today I will take a step toward my dreams.",
            text: "Today I will take a step toward my dreams.",
            duration: 16,
            createdAt: Date().addingTimeInterval(-259200),
            isFavorite: false,
            listenCount: 2,
            category: "confidence"
        ),
        Recording(
            id: "5",
            title: "I let go of what I cannot control.",
            text: "I let go of what I cannot control.",
            duration: 18,
            createdAt: Date().addingTimeInterval(-345600),
            isFavorite: false,
            listenCount: 8,
            category: "calm"
        ),
        Recording(
            id: "6",
            title: "Affirmation — 12/14/2025",
            text: "I am capable of great things.",
            duration: 11,
            createdAt: Date().addingTimeInterval(-432000),
            isFavorite: false,
            listenCount: 1,
            category: nil
        ),
    ]
}

extension Playlist {
    static let sampleData: [Playlist] = [
        Playlist(id: "1", name: "Daily Optimism", recordings: Array(Recording.sampleData.prefix(4))),
        Playlist(id: "2", name: "Morning Confidence", recordings: Array(Recording.sampleData.prefix(3))),
        Playlist(id: "3", name: "Before Sleep", recordings: Array(Recording.sampleData.prefix(5))),
        Playlist(id: "4", name: "Worthy & Enough", recordings: Array(Recording.sampleData.prefix(2))),
    ]
}

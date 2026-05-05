import SwiftUI
import AVFoundation

struct ImportRecordingsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var isImporting = false
    @State private var importedCount = 0
    @State private var showingFilePicker = false
    @State private var importLog: [String] = []
    @State private var importMode: ImportMode = .scan
    
    enum ImportMode {
        case scan
        case json
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "square.and.arrow.down")
                            .font(.system(size: 48))
                            .foregroundColor(.resSage)
                        
                        Text("Import Recordings")
                            .font(.resDisplay)
                            .foregroundColor(.resText)
                        
                        Text("Import your existing recordings from the web app or other sources")
                            .font(.resBody)
                            .foregroundColor(.resTextMuted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 32)
                    
                    // Instructions
                    VStack(alignment: .leading, spacing: 16) {
                        Text("How to Import")
                            .font(.resSemibold)
                            .foregroundColor(.resText)
                        
                        InstructionStep(
                            number: 1,
                            text: "Connect your device to your Mac via cable or AirDrop"
                        )
                        
                        InstructionStep(
                            number: 2,
                            text: "Download recordings from Supabase storage or export from web app"
                        )
                        
                        InstructionStep(
                            number: 3,
                            text: "Use iTunes File Sharing or Finder to copy .m4a files to this app"
                        )
                        
                        InstructionStep(
                            number: 4,
                            text: "Files should be placed in the app's Documents/Recordings folder"
                        )
                    }
                    .padding(20)
                    .background(Color.resCard)
                    .cornerRadius(16)
                    
                    // Import mode selector
                    HStack(spacing: 12) {
                        Button(action: {
                            importMode = .scan
                            HapticManager.shared.selection()
                        }) {
                            HStack(spacing: 8) {
                                Image(systemName: "doc.text.magnifyingglass")
                                    .font(.system(size: 14))
                                Text("Scan Files")
                                    .font(.resCaption.weight(.medium))
                            }
                            .foregroundColor(importMode == .scan ? .white : .resText)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(importMode == .scan ? Color.resSage : Color.resCard)
                            .cornerRadius(12)
                        }
                        
                        Button(action: {
                            importMode = .json
                            HapticManager.shared.selection()
                        }) {
                            HStack(spacing: 8) {
                                Image(systemName: "doc.badge.gearshape")
                                    .font(.system(size: 14))
                                Text("Import JSON")
                                    .font(.resCaption.weight(.medium))
                            }
                            .foregroundColor(importMode == .json ? .white : .resText)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(importMode == .json ? Color.resSage : Color.resCard)
                            .cornerRadius(12)
                        }
                    }
                    
                    // Action button
                    Button(action: importMode == .scan ? scanForRecordings : importFromJSON) {
                        HStack(spacing: 12) {
                            if isImporting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Image(systemName: importMode == .scan ? "doc.text.magnifyingglass" : "doc.badge.gearshape")
                                    .font(.system(size: 18))
                            }
                            Text(isImporting ? "Importing..." : (importMode == .scan ? "Scan for New Recordings" : "Import from JSON Package"))
                                .font(.resBodyMd.weight(.semibold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.resSage)
                        .cornerRadius(16)
                    }
                    .disabled(isImporting)
                    
                    // Import log
                    if !importLog.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Import Log")
                                .font(.resSemibold)
                                .foregroundColor(.resText)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                ForEach(importLog.indices, id: \.self) { index in
                                    HStack(spacing: 8) {
                                        Image(systemName: importLog[index].hasPrefix("✅") ? "checkmark.circle.fill" : "info.circle.fill")
                                            .font(.system(size: 12))
                                            .foregroundColor(importLog[index].hasPrefix("✅") ? Color(hex: "#10B981") : .resTextMuted)
                                        
                                        Text(importLog[index])
                                            .font(.resCaption)
                                            .foregroundColor(.resTextMuted)
                                    }
                                }
                            }
                        }
                        .padding(20)
                        .background(Color.resCard)
                        .cornerRadius(16)
                    }
                    
                    // Success message
                    if importedCount > 0 {
                        VStack(spacing: 12) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 48))
                                .foregroundColor(Color(hex: "#10B981"))
                            
                            Text("Imported \(importedCount) recording\(importedCount == 1 ? "" : "s")")
                                .font(.resSemibold)
                                .foregroundColor(.resText)
                            
                            Button(action: { dismiss() }) {
                                Text("Done")
                                    .font(.resBodyMd.weight(.medium))
                                    .foregroundColor(.resSage)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 12)
                                    .background(Color.resSageSoft)
                                    .cornerRadius(12)
                            }
                        }
                        .padding(24)
                        .background(Color.resCard)
                        .cornerRadius(16)
                    }
                    
                    // Technical Details
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Technical Details")
                            .font(.resSemibold)
                            .foregroundColor(.resText)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            DetailRow(label: "App Documents Path", value: getDocumentsDirectory().path)
                            DetailRow(label: "Recordings Folder", value: "Documents/Recordings/")
                            DetailRow(label: "Supported Formats", value: ".m4a, .mp3, .wav")
                            DetailRow(label: "Current Recordings", value: "\(appState.recordings.count)")
                        }
                    }
                    .padding(20)
                    .background(Color.resCard)
                    .cornerRadius(16)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 100)
            }
            .background(Color.resBg)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.resText)
                    }
                }
            }
        }
    }
    
    private func scanForRecordings() {
        isImporting = true
        importLog = []
        importedCount = 0
        
        DispatchQueue.global(qos: .userInitiated).async {
            let recordingsDir = getDocumentsDirectory().appendingPathComponent("Recordings")
            
            // Create Recordings directory if it doesn't exist
            if !FileManager.default.fileExists(atPath: recordingsDir.path) {
                try? FileManager.default.createDirectory(at: recordingsDir, withIntermediateDirectories: true)
                DispatchQueue.main.async {
                    importLog.append("📁 Created Recordings folder")
                }
            }
            
            // Scan for audio files
            guard let files = try? FileManager.default.contentsOfDirectory(at: recordingsDir, includingPropertiesForKeys: nil) else {
                DispatchQueue.main.async {
                    importLog.append("❌ Could not read Recordings folder")
                    isImporting = false
                }
                return
            }
            
            let audioFiles = files.filter { file in
                let ext = file.pathExtension.lowercased()
                return ext == "m4a" || ext == "mp3" || ext == "wav"
            }
            
            DispatchQueue.main.async {
                importLog.append("🔍 Found \(audioFiles.count) audio file(s)")
            }
            
            // Process each file
            for file in audioFiles {
                let fileName = file.deletingPathExtension().lastPathComponent
                let fileId = fileName // Use filename as ID
                
                // Check if already imported
                if appState.recordings.contains(where: { $0.id == fileId }) {
                    DispatchQueue.main.async {
                        importLog.append("⏭️ Skipped: \(fileName) (already imported)")
                    }
                    continue
                }
                
                // Get audio duration
                let asset = AVAsset(url: file)
                let duration = CMTimeGetSeconds(asset.duration)
                
                guard duration.isFinite && duration > 0 else {
                    DispatchQueue.main.async {
                        importLog.append("❌ Skipped: \(fileName) (invalid audio)")
                    }
                    continue
                }
                
                // Move file to app's recordings directory
                let destURL = appState.audioManager.fileURL(for: fileId)
                try? FileManager.default.removeItem(at: destURL) // Remove if exists
                
                do {
                    try FileManager.default.copyItem(at: file, to: destURL)
                    
                    // Create recording metadata
                    DispatchQueue.main.async {
                        appState.addRecording(
                            id: fileId,
                            title: fileName.replacingOccurrences(of: "_", with: " "),
                            text: "Imported recording",
                            category: nil
                        )
                        importedCount += 1
                        importLog.append("✅ Imported: \(fileName)")
                    }
                    
                    // Delete original file after successful import
                    try? FileManager.default.removeItem(at: file)
                    
                } catch {
                    DispatchQueue.main.async {
                        importLog.append("❌ Failed: \(fileName) (\(error.localizedDescription))")
                    }
                }
            }
            
            DispatchQueue.main.async {
                if importedCount > 0 {
                    HapticManager.shared.success()
                    importLog.append("🎉 Import complete!")
                } else if audioFiles.isEmpty {
                    importLog.append("ℹ️ No new files found in Recordings folder")
                    importLog.append("ℹ️ Add .m4a files via iTunes File Sharing")
                } else {
                    importLog.append("ℹ️ All files already imported")
                }
                isImporting = false
            }
        }
    }
    
    private func importFromJSON() {
        isImporting = true
        importLog = []
        importedCount = 0
        
        DispatchQueue.global(qos: .userInitiated).async {
            let docsDir = getDocumentsDirectory()
            let jsonPath = docsDir.appendingPathComponent("resonance-import.json")
            
            // Check if JSON file exists
            guard FileManager.default.fileExists(atPath: jsonPath.path) else {
                DispatchQueue.main.async {
                    importLog.append("❌ resonance-import.json not found")
                    importLog.append("ℹ️  Copy the JSON file via iTunes File Sharing first")
                    isImporting = false
                }
                return
            }
            
            // Parse JSON
            guard let jsonData = try? Data(contentsOf: jsonPath),
                  let importPackage = try? JSONDecoder().decode(ImportPackage.self, from: jsonData) else {
                DispatchQueue.main.async {
                    importLog.append("❌ Could not parse JSON file")
                    isImporting = false
                }
                return
            }
            
            DispatchQueue.main.async {
                importLog.append("📦 Found package with \(importPackage.recordings.count) recording(s)")
                importLog.append("📅 Exported: \(importPackage.exported.prefix(10))")
            }
            
            // Import each recording
            for (index, rec) in importPackage.recordings.enumerated() {
                // Check if already exists
                if appState.recordings.contains(where: { $0.id == rec.id }) {
                    DispatchQueue.main.async {
                        importLog.append("⏭️  [\(index + 1)/\(importPackage.recordings.count)] Skipped: \(rec.title)")
                    }
                    continue
                }
                
                // Check if audio file exists
                let audioSource = docsDir.appendingPathComponent(rec.audioFile)
                guard FileManager.default.fileExists(atPath: audioSource.path) else {
                    DispatchQueue.main.async {
                        importLog.append("❌ [\(index + 1)/\(importPackage.recordings.count)] Missing audio: \(rec.audioFile)")
                    }
                    continue
                }
                
                // Copy audio to app storage
                let destURL = appState.audioManager.fileURL(for: rec.id)
                try? FileManager.default.removeItem(at: destURL)
                
                do {
                    try FileManager.default.copyItem(at: audioSource, to: destURL)
                    
                    // Create recording with full metadata
                    let recording = Recording(
                        id: rec.id,
                        title: rec.title,
                        text: rec.text,
                        duration: rec.duration,
                        createdAt: ISO8601DateFormatter().date(from: rec.createdAt) ?? Date(),
                        isFavorite: rec.isFavorite,
                        listenCount: rec.listenCount,
                        category: rec.category,
                        affirmationId: rec.affirmationId,
                        isBestTake: rec.isBestTake
                    )
                    
                    DispatchQueue.main.async {
                        appState.recordings.insert(recording, at: 0)
                        appState.saveRecordings()
                        importedCount += 1
                        importLog.append("✅ [\(index + 1)/\(importPackage.recordings.count)] \(rec.title)")
                    }
                    
                    // Clean up original
                    try? FileManager.default.removeItem(at: audioSource)
                    
                } catch {
                    DispatchQueue.main.async {
                        importLog.append("❌ [\(index + 1)/\(importPackage.recordings.count)] Failed: \(rec.title)")
                    }
                }
            }
            
            DispatchQueue.main.async {
                if importedCount > 0 {
                    HapticManager.shared.success()
                    importLog.append("🎉 Successfully imported \(importedCount) recording(s)!")
                    importLog.append("✨ All metadata restored")
                } else {
                    importLog.append("ℹ️  No new recordings imported")
                }
                isImporting = false
            }
        }
    }
    
    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}

// MARK: - Import Package Models

struct ImportPackage: Codable {
    let version: String
    let exported: String
    let recordingsCount: Int
    let recordings: [ImportRecordingData]
}

struct ImportRecordingData: Codable {
    let id: String
    let audioFile: String
    let title: String
    let text: String
    let category: String?
    let duration: Double
    let createdAt: String
    let isFavorite: Bool
    let listenCount: Int
    let affirmationId: String?
    let isBestTake: Bool
}

// MARK: - Supporting Views

struct InstructionStep: View {
    let number: Int
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(number)")
                .font(.resBodyMd.weight(.bold))
                .foregroundColor(.white)
                .frame(width: 28, height: 28)
                .background(Color.resSage)
                .cornerRadius(14)
            
            Text(text)
                .font(.resBodySm)
                .foregroundColor(.resText)
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.resCaption.weight(.medium))
                .foregroundColor(.resTextMuted)
            
            Text(value)
                .font(.resBodySm)
                .foregroundColor(.resText)
                .lineLimit(2)
        }
    }
}

// MARK: - Preview
#Preview {
    ImportRecordingsView()
        .environmentObject(AppState())
}

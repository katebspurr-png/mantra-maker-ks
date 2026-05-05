// ─────────────────────────────────────────────────
// Resonance — Share Manager
// Handles sharing recordings via native iOS share sheet
// ─────────────────────────────────────────────────

import SwiftUI
import UIKit

/// Manages sharing functionality for recordings
class ShareManager {
    static let shared = ShareManager()
    
    private init() {}
    
    /// Share a recording's audio file
    func shareRecording(_ recording: Recording, audioManager: AudioManager) {
        let fileURL = audioManager.fileURL(for: recording.id)
        
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            print("❌ Recording file not found for sharing")
            return
        }
        
        // Create a temporary copy with a user-friendly name
        let fileName = sanitizeFileName(recording.title) + ".m4a"
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        
        do {
            // Remove existing temp file if it exists
            if FileManager.default.fileExists(atPath: tempURL.path) {
                try FileManager.default.removeItem(at: tempURL)
            }
            
            // Copy to temp location with friendly name
            try FileManager.default.copyItem(at: fileURL, to: tempURL)
            
            // Present share sheet
            presentShareSheet(items: [tempURL], text: recording.text)
        } catch {
            print("❌ Failed to prepare file for sharing: \(error)")
        }
    }
    
    /// Share recording text only
    func shareText(_ text: String) {
        presentShareSheet(items: [text], text: nil)
    }
    
    /// Share recording with both audio and text
    func shareRecordingWithText(_ recording: Recording, audioManager: AudioManager) {
        let fileURL = audioManager.fileURL(for: recording.id)
        
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            print("❌ Recording file not found for sharing")
            return
        }
        
        // Create a temporary copy with a user-friendly name
        let fileName = sanitizeFileName(recording.title) + ".m4a"
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        
        do {
            // Remove existing temp file if it exists
            if FileManager.default.fileExists(atPath: tempURL.path) {
                try FileManager.default.removeItem(at: tempURL)
            }
            
            // Copy to temp location with friendly name
            try FileManager.default.copyItem(at: fileURL, to: tempURL)
            
            // Create share text with title and affirmation
            let shareText = "\"\(recording.text)\""
            
            // Present share sheet with both
            presentShareSheet(items: [shareText, tempURL], text: nil)
        } catch {
            print("❌ Failed to prepare file for sharing: \(error)")
        }
    }
    
    /// Present the native iOS share sheet
    private func presentShareSheet(items: [Any], text: String?) {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController else {
            print("❌ Could not find root view controller")
            return
        }
        
        let activityVC = UIActivityViewController(
            activityItems: items,
            applicationActivities: nil
        )
        
        // Exclude some activity types that don't make sense
        activityVC.excludedActivityTypes = [
            .addToReadingList,
            .assignToContact,
            .openInIBooks,
            .postToVimeo,
            .postToWeibo,
            .postToFlickr,
            .postToTencentWeibo
        ]
        
        // For iPad - present as popover
        if let popover = activityVC.popoverPresentationController {
            popover.sourceView = rootViewController.view
            popover.sourceRect = CGRect(
                x: rootViewController.view.bounds.midX,
                y: rootViewController.view.bounds.midY,
                width: 0,
                height: 0
            )
            popover.permittedArrowDirections = []
        }
        
        // Present
        if let presentedVC = rootViewController.presentedViewController {
            presentedVC.present(activityVC, animated: true)
        } else {
            rootViewController.present(activityVC, animated: true)
        }
    }
    
    /// Sanitize filename by removing invalid characters
    private func sanitizeFileName(_ name: String) -> String {
        let invalidCharacters = CharacterSet(charactersIn: ":/\\?%*|\"<>")
        return name
            .components(separatedBy: invalidCharacters)
            .joined(separator: "-")
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .prefix(50) // Limit length
            .description
    }
}

// MARK: - SwiftUI View Extension

extension View {
    /// Present a share sheet for a recording
    func shareRecording(_ recording: Recording?, audioManager: AudioManager) -> some View {
        self.background(
            ShareSheetRepresentable(
                recording: recording,
                audioManager: audioManager
            )
        )
    }
}

// MARK: - UIViewControllerRepresentable for Share Sheet

struct ShareSheetRepresentable: UIViewControllerRepresentable {
    let recording: Recording?
    let audioManager: AudioManager
    
    func makeUIViewController(context: Context) -> UIViewController {
        return UIViewController()
    }
    
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        // No-op
    }
}

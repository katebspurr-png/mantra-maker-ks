// ─────────────────────────────────────────────────
// Resonance — Haptic Manager
// Centralized haptic feedback for UI interactions
// ─────────────────────────────────────────────────

import UIKit

/// Manages haptic feedback throughout the app
class HapticManager {
    static let shared = HapticManager()
    
    private init() {}
    
    // MARK: - Impact Feedback
    
    /// Light impact - for subtle interactions like button taps
    func light() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
    
    /// Medium impact - for standard button presses
    func medium() {
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }
    
    /// Heavy impact - for significant actions
    func heavy() {
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.impactOccurred()
    }
    
    /// Soft impact - for gentle interactions (iOS 13+)
    func soft() {
        if #available(iOS 13.0, *) {
            let generator = UIImpactFeedbackGenerator(style: .soft)
            generator.impactOccurred()
        } else {
            light()
        }
    }
    
    /// Rigid impact - for firm interactions (iOS 13+)
    func rigid() {
        if #available(iOS 13.0, *) {
            let generator = UIImpactFeedbackGenerator(style: .rigid)
            generator.impactOccurred()
        } else {
            medium()
        }
    }
    
    // MARK: - Notification Feedback
    
    /// Success notification - for completed actions
    func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
    
    /// Warning notification - for cautionary actions
    func warning() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.warning)
    }
    
    /// Error notification - for failed actions
    func error() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }
    
    // MARK: - Selection Feedback
    
    /// Selection changed - for picker/slider interactions
    func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
    
    // MARK: - Custom Patterns
    
    /// Recording start - medium impact for beginning recording
    func recordingStart() {
        medium()
    }
    
    /// Recording stop - success feedback for completed recording
    func recordingStop() {
        success()
    }
    
    /// Playback start - soft haptic for play button
    func playbackStart() {
        soft()
    }
    
    /// Playback stop - light haptic for pause/stop
    func playbackStop() {
        light()
    }
    
    /// Button tap - standard button press
    func buttonTap() {
        light()
    }
    
    /// Toggle switch - selection feedback for switches
    func toggle() {
        selection()
    }
    
    /// Delete action - warning for destructive actions
    func delete() {
        warning()
    }
    
    /// Save/confirm action - success for positive completion
    func confirm() {
        success()
    }
}

// MARK: - SwiftUI View Extension

import SwiftUI

extension View {
    /// Add haptic feedback to a view tap
    func hapticTap(_ style: HapticStyle = .light) -> some View {
        self.simultaneousGesture(
            TapGesture().onEnded {
                HapticManager.shared.trigger(style)
            }
        )
    }
}

enum HapticStyle {
    case light, medium, heavy, soft, rigid
    case success, warning, error
    case selection
}

extension HapticManager {
    func trigger(_ style: HapticStyle) {
        switch style {
        case .light: light()
        case .medium: medium()
        case .heavy: heavy()
        case .soft: soft()
        case .rigid: rigid()
        case .success: success()
        case .warning: warning()
        case .error: error()
        case .selection: selection()
        }
    }
}

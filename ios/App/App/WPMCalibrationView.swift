import SwiftUI
import AVFoundation

// MARK: - WPM Calibration View
struct WPMCalibrationView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @StateObject private var calibrationManager = CalibrationManager()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.resSage)
                        Text("Calibrate Teleprompter Speed")
                            .font(.resDisplay)
                            .foregroundColor(.resText)
                    }
                    
                    Text("Read the text below at your natural speaking pace. We'll match the teleprompter to your voice.")
                        .font(.resBodySm)
                        .foregroundColor(.resTextSoft)
                        .lineSpacing(4)
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                .padding(.bottom, 24)
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Calibration script (show unless in result phase)
                        if calibrationManager.phase != .result {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("READ ALOUD")
                                    .font(.resMicro)
                                    .foregroundColor(.resTextSoft)
                                    .kerning(0.07)
                                
                                Text(CalibrationManager.calibrationScript)
                                    .font(.resSerif18)
                                    .foregroundColor(.resText)
                                    .lineSpacing(8)
                                    .padding(20)
                                    .background(Color.resBgWarm)
                                    .cornerRadius(ResRadius.md)
                            }
                            .padding(.horizontal, ResSpacing.screen)
                        }
                        
                        // Phase-specific content
                        switch calibrationManager.phase {
                        case .ready:
                            readyPhase
                        case .recording:
                            recordingPhase
                        case .preview:
                            previewPhase
                        case .result:
                            resultPhase
                        }
                    }
                }
                
                Spacer()
            }
            .background(Color.resBg)
            .navigationBarHidden(true)
            .alert("Microphone Access Required", isPresented: $calibrationManager.showingPermissionAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Please enable microphone access in Settings to calibrate your reading speed.")
            }
        }
    }
    
    var readyPhase: some View {
        VStack(spacing: 16) {
            Text("Tap **Start Recording** and read the text aloud at your natural pace.")
                .font(.resBodySm)
                .foregroundColor(.resTextSoft)
                .multilineTextAlignment(.center)
            
            Button(action: {
                calibrationManager.startRecording()
            }) {
                HStack(spacing: 8) {
                    Image(systemName: "mic.fill")
                        .font(.system(size: 16))
                    Text("Start Recording")
                        .font(.resSemibold)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.resText)
                .cornerRadius(ResRadius.md)
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.top, 20)
    }
    
    var recordingPhase: some View {
        VStack(spacing: 24) {
            // Recording indicator
            HStack(spacing: 8) {
                Circle()
                    .fill(Color.red)
                    .frame(width: 10, height: 10)
                    .opacity(calibrationManager.isRecordingPulse ? 1.0 : 0.3)
                
                Text("Recording")
                    .font(.resBodyMd)
                    .foregroundColor(.resText)
            }
            
            // Timer
            Text(calibrationManager.formattedElapsed)
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.resText)
                .monospacedDigit()
            
            if calibrationManager.elapsed < CalibrationManager.minDurationSeconds {
                Text("Minimum \(CalibrationManager.minDurationSeconds - calibrationManager.elapsed)s remaining")
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
            }
            
            // Stop button
            Button(action: {
                calibrationManager.stopRecording()
            }) {
                HStack(spacing: 8) {
                    Image(systemName: "stop.fill")
                        .font(.system(size: 16))
                    Text("Stop Recording")
                        .font(.resSemibold)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(calibrationManager.elapsed >= CalibrationManager.minDurationSeconds ? Color.red : Color.gray)
                .cornerRadius(ResRadius.md)
            }
            .disabled(calibrationManager.elapsed < CalibrationManager.minDurationSeconds)
            
            if calibrationManager.elapsed < CalibrationManager.minDurationSeconds {
                Text("Keep reading — stop will be available at \(CalibrationManager.minDurationSeconds)s")
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.top, 20)
    }
    
    var previewPhase: some View {
        VStack(spacing: 20) {
            Text("\(calibrationManager.audioDuration)s recorded")
                .font(.resBodyMd)
                .foregroundColor(.resTextSoft)
            
            // Action buttons
            VStack(spacing: 12) {
                Button(action: {
                    calibrationManager.calculateWPM()
                }) {
                    Text("Use This Recording")
                        .font(.resSemibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.resText)
                        .cornerRadius(ResRadius.md)
                }
                
                Button(action: {
                    calibrationManager.recordAgain()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 14))
                        Text("Record Again")
                            .font(.resBodyMd)
                    }
                    .foregroundColor(.resTextSoft)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                }
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.top, 20)
    }
    
    var resultPhase: some View {
        VStack(spacing: 32) {
            // WPM result
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.resSageSoft)
                        .frame(width: 140, height: 140)
                    
                    VStack(spacing: 4) {
                        Text("\(calibrationManager.resultWPM)")
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .foregroundColor(.resSage)
                        
                        Text("WPM")
                            .font(.resMicro)
                            .foregroundColor(.resSage.opacity(0.7))
                            .kerning(0.1)
                    }
                }
                
                Text("Your teleprompter will now match your natural reading pace.")
                    .font(.resBodySm)
                    .foregroundColor(.resTextSoft)
                    .multilineTextAlignment(.center)
            }
            
            // Save button
            Button(action: {
                appState.calibrateWPM(calibrationManager.resultWPM)
                dismiss()
            }) {
                Text("Use This Speed")
                    .font(.resSemibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.resText)
                    .cornerRadius(ResRadius.md)
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .padding(.top, 40)
    }
}

// MARK: - Calibration Manager
class CalibrationManager: NSObject, ObservableObject {
    enum Phase {
        case ready, recording, preview, result
    }
    
    static let calibrationScript = "I am worthy of love, kindness, and respect. Every day I grow stronger and more confident in who I am. I trust the journey of my life, even when the path is unclear. I release what no longer serves me and welcome new possibilities with an open heart. My thoughts are powerful, and I choose to fill them with hope and gratitude. I deserve peace, happiness, and success. I am enough exactly as I am right now. I believe in my ability to create the life I envision. Today I choose courage over fear and progress over perfection."
    
    static let scriptWordCount = 100 // Pre-counted
    static let minDurationSeconds = 10
    
    @Published var phase: Phase = .ready
    @Published var elapsed: Int = 0
    @Published var audioDuration: Int = 0
    @Published var resultWPM: Int = 0
    @Published var isRecordingPulse: Bool = false
    @Published var showingPermissionAlert: Bool = false
    
    private var audioRecorder: AVAudioRecorder?
    private var timer: Timer?
    private var startTime: Date?
    private let audioSession = AVAudioSession.sharedInstance()
    private var recordingURL: URL?
    
    override init() {
        super.init()
    }
    
    var formattedElapsed: String {
        let minutes = elapsed / 60
        let seconds = elapsed % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
    
    func startRecording() {
        // Request permission
        audioSession.requestRecordPermission { [weak self] allowed in
            DispatchQueue.main.async {
                if allowed {
                    self?.beginRecording()
                } else {
                    self?.showingPermissionAlert = true
                }
            }
        }
    }
    
    private func beginRecording() {
        do {
            // Configure audio session
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true)
            
            // Create recording URL
            let tempDir = FileManager.default.temporaryDirectory
            recordingURL = tempDir.appendingPathComponent("calibration-\(UUID().uuidString).m4a")
            
            // Configure recorder
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100.0,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            
            audioRecorder = try AVAudioRecorder(url: recordingURL!, settings: settings)
            audioRecorder?.record()
            
            // Start timer
            startTime = Date()
            elapsed = 0
            phase = .recording
            
            timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
                guard let self = self, let start = self.startTime else { return }
                self.elapsed = Int(Date().timeIntervalSince(start))
                self.isRecordingPulse.toggle()
            }
            
        } catch {
            print("❌ Failed to start recording: \(error)")
        }
    }
    
    func stopRecording() {
        timer?.invalidate()
        timer = nil
        
        audioRecorder?.stop()
        
        if let start = startTime {
            audioDuration = Int(Date().timeIntervalSince(start))
        }
        
        // Check minimum duration
        if audioDuration < Self.minDurationSeconds {
            phase = .ready
            // Could show an alert here
        } else {
            phase = .preview
        }
        
        try? audioSession.setActive(false)
    }
    
    func calculateWPM() {
        let rawWPM = (Self.scriptWordCount * 60) / audioDuration
        // Reduce by 20% to make teleprompter feel more comfortable
        let adjustedWPM = Int(Double(rawWPM) * 0.8)
        resultWPM = max(40, min(300, adjustedWPM)) // Clamp between 40-300 WPM
        phase = .result
        
        // Clean up recording
        if let url = recordingURL {
            try? FileManager.default.removeItem(at: url)
        }
    }
    
    func recordAgain() {
        // Clean up previous recording
        if let url = recordingURL {
            try? FileManager.default.removeItem(at: url)
        }
        
        elapsed = 0
        audioDuration = 0
        phase = .ready
    }
}

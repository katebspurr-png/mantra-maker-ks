import SwiftUI

struct RecordView: View {
    let prefilledText: String?
    let affirmationId: String?
    
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @StateObject private var audioManager = AudioManager()
    @State private var hasRecorded = false
    @State private var affirmationText: String
    @State private var showTeleprompter = true
    @State private var recordingId = UUID().uuidString
    @State private var showPermissionAlert = false
    @State private var showWPMCalibration = false
    @State private var showWPMSettings = false
    
    init(prefilledText: String? = nil, prefillText: String? = nil, affirmationId: String? = nil) {
        let text = prefilledText ?? prefillText
        self.prefilledText = text
        self.affirmationId = affirmationId
        self._affirmationText = State(initialValue: text ?? "I am a highly sought-after professional whose expertise enriches any team I join.")
    }
    
    var body: some View {
        NavigationView {
            Group {
                if hasRecorded {
                    RecordSaveView(
                        affirmationText: affirmationText,
                        recordingId: recordingId,
                        audioManager: audioManager,
                        onSave: { title, category in
                            print("💾 Save button tapped")
                            print("📝 Title: \(title)")
                            print("🆔 Recording ID: \(recordingId)")
                            
                            // Save recording to AppState
                            appState.addRecording(
                                id: recordingId,
                                title: title,
                                text: affirmationText,
                                category: category,
                                affirmationId: affirmationId
                            )
                            dismiss()
                        },
                        onTryAgain: {
                            hasRecorded = false
                            recordingId = UUID().uuidString
                        },
                        onDiscard: {
                            // Delete the recording file
                            try? audioManager.deleteRecording(recordingId: recordingId)
                            dismiss()
                        }
                    )
                } else {
                    RecordReadyView(
                        affirmationText: $affirmationText,
                        showTeleprompter: $showTeleprompter,
                        audioManager: audioManager,
                        recordingId: recordingId,
                        onRecordComplete: {
                            hasRecorded = true
                        },
                        onPermissionDenied: {
                            showPermissionAlert = true
                        }
                    )
                    .environmentObject(appState)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .alert("Microphone Access Required", isPresented: $showPermissionAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Settings") {
                    if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(settingsURL)
                    }
                }
            } message: {
                Text("Resonance needs microphone access to record your affirmations. Please enable it in Settings.")
            }
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
    @Binding var showTeleprompter: Bool
    @ObservedObject var audioManager: AudioManager
    @EnvironmentObject var appState: AppState
    let recordingId: String
    let onRecordComplete: () -> Void
    let onPermissionDenied: () -> Void
    
    @State private var showingEditSheet = false
    @State private var showWPMCalibration = false
    @State private var scrollOffset: CGFloat = 0
    @State private var teleprompterTimer: Timer?
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Affirmation Text Block
                VStack(alignment: .leading, spacing: 14) {
                    if showTeleprompter && audioManager.isRecording {
                        // Teleprompter mode - auto-scrolling
                        ScrollViewReader { proxy in
                            ScrollView {
                                VStack(spacing: 20) {
                                    ForEach(affirmationText.components(separatedBy: " ").indices, id: \.self) { index in
                                        Text(affirmationText.components(separatedBy: " ")[index])
                                            .font(.resAffirmationSm)
                                            .foregroundColor(.resText)
                                            .id(index)
                                    }
                                }
                                .padding(.vertical, 40)
                            }
                            .frame(height: 200)
                            .onChange(of: scrollOffset) { _ in
                                withAnimation(.linear(duration: 0.5)) {
                                    let wordIndex = Int(scrollOffset)
                                    if wordIndex < affirmationText.components(separatedBy: " ").count {
                                        proxy.scrollTo(wordIndex, anchor: .center)
                                    }
                                }
                            }
                            .onAppear {
                                startTeleprompter()
                            }
                        }
                    } else {
                        // Normal text display
                        Text(attributedText)
                            .font(.resAffirmationSm)
                            .foregroundColor(.resText)
                            .lineSpacing(8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    if !audioManager.isRecording {
                        Button(action: {
                            HapticManager.shared.buttonTap()
                            showingEditSheet = true
                        }) {
                            Text("Edit text")
                                .font(.resCaption)
                                .foregroundColor(.resTextMuted)
                        }
                    }
                }
                .padding(.horizontal, 22)
                .padding(.vertical, 26)
                .frame(maxWidth: .infinity)
                .frame(minHeight: 200)
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
                            if audioManager.isRecording {
                                // Stop recording
                                HapticManager.shared.recordingStop()
                                audioManager.stopRecording()
                                stopTeleprompter()
                                onRecordComplete()
                            } else {
                                // Check permission first
                                let permission = audioManager.checkRecordingPermission()
                                if permission == .granted {
                                    HapticManager.shared.recordingStart()
                                    startRecording()
                                } else if permission == .denied {
                                    HapticManager.shared.error()
                                    onPermissionDenied()
                                } else {
                                    // Request permission
                                    audioManager.requestRecordingPermission { granted in
                                        if granted {
                                            HapticManager.shared.recordingStart()
                                            startRecording()
                                        } else {
                                            HapticManager.shared.error()
                                            onPermissionDenied()
                                        }
                                    }
                                }
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .stroke(Color.resText, lineWidth: 2)
                                    .frame(width: 88, height: 88)
                                
                                Image(systemName: audioManager.isRecording ? "stop.fill" : "mic.fill")
                                    .font(.system(size: 34))
                                    .foregroundColor(.resText)
                            }
                        }
                    }
                    .frame(width: 130, height: 130)
                    
                    Text(audioManager.isRecording ? "Recording..." : "Tap to begin")
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
                    
                    VStack(spacing: 16) {
                        // Teleprompter toggle
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 8) {
                                    Text("Teleprompter")
                                        .font(.resBodyMd)
                                        .foregroundColor(.resText)
                                    
                                    if appState.calibratedWPM != nil {
                                        Text("CALIBRATED")
                                            .font(.custom("PlusJakartaSans-SemiBold", size: 9))
                                            .foregroundColor(.resSage)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.resSageSoft)
                                            .cornerRadius(4)
                                    }
                                }
                                
                                if showTeleprompter {
                                    Text("\(appState.teleprompterWPM) words per minute")
                                        .font(.resCaption)
                                        .foregroundColor(.resTextMuted)
                                }
                            }
                            
                            Spacer()
                            
                            Toggle("", isOn: $showTeleprompter)
                                .labelsHidden()
                                .onChange(of: showTeleprompter) { _ in
                                    HapticManager.shared.toggle()
                                }
                        }
                        
                        // WPM controls (when teleprompter is enabled)
                        if showTeleprompter && !audioManager.isRecording {
                            VStack(spacing: 12) {
                                // WPM slider
                                VStack(spacing: 8) {
                                    HStack {
                                        Text("SPEED")
                                            .font(.resMicro)
                                            .foregroundColor(.resTextSoft)
                                            .kerning(0.07)
                                        Spacer()
                                        Text("\(appState.teleprompterWPM) WPM")
                                            .font(.resCaption)
                                            .foregroundColor(.resTextMuted)
                                    }
                                    
                                    HStack(spacing: 12) {
                                        Text("Slower")
                                            .font(.custom("PlusJakartaSans-Regular", size: 10))
                                            .foregroundColor(.resTextMuted)
                                        
                                        Slider(
                                            value: Binding(
                                                get: { Double(appState.teleprompterWPM) },
                                                set: { newValue in
                                                    let oldValue = appState.teleprompterWPM
                                                    let newWPM = Int(newValue)
                                                    if oldValue != newWPM {
                                                        HapticManager.shared.selection()
                                                    }
                                                    appState.teleprompterWPM = newWPM
                                                }
                                            ),
                                            in: 40...240,
                                            step: 5,
                                            onEditingChanged: { _ in
                                                appState.saveWPMSettings()
                                            }
                                        )
                                        .accentColor(.resSage)
                                        
                                        Text("Faster")
                                            .font(.custom("PlusJakartaSans-Regular", size: 10))
                                            .foregroundColor(.resTextMuted)
                                    }
                                }
                                .padding(16)
                                .background(Color.resBgWarm)
                                .cornerRadius(ResRadius.md)
                                
                                // Calibrate button
                                Button(action: {
                                    HapticManager.shared.buttonTap()
                                    showWPMCalibration = true
                                }) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "mic.fill")
                                            .font(.system(size: 14))
                                        Text(appState.calibratedWPM != nil ? "Recalibrate (\(appState.calibratedWPM!) WPM)" : "Calibrate Reading Speed")
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
                            }
                        }
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
        .sheet(isPresented: $showWPMCalibration) {
            WPMCalibrationView()
                .environmentObject(appState)
        }
    }
    
    var attributedText: AttributedString {
        var attributed = AttributedString(affirmationText)
        if let firstWordRange = attributed.range(of: affirmationText.split(separator: " ").first.map(String.init) ?? "") {
            attributed[firstWordRange].backgroundColor = Color.resWarm.opacity(0.2)
        }
        return attributed
    }
    
    func startRecording() {
        do {
            try audioManager.startRecording(for: recordingId)
            
            // Start teleprompter if enabled
            if showTeleprompter {
                scrollOffset = 0
                startTeleprompter()
            }
        } catch {
            print("Failed to start recording: \(error.localizedDescription)")
        }
    }
    
    func startTeleprompter() {
        guard showTeleprompter && audioManager.isRecording else { return }
        
        let wordCount = affirmationText.components(separatedBy: " ").count
        
        // Calculate scroll speed based on WPM (words per minute)
        let wpm = Double(appState.teleprompterWPM)
        let wordsPerSecond = wpm / 60.0
        let timerInterval = 0.1 // Update 10 times per second
        let wordsPerTick = wordsPerSecond * timerInterval
        
        print("📜 Teleprompter: \(wordCount) words at \(wpm) WPM (\(wordsPerSecond) words/sec, \(wordsPerTick) words per 0.1s)")
        
        teleprompterTimer = Timer.scheduledTimer(withTimeInterval: timerInterval, repeats: true) { [self] timer in
            if !audioManager.isRecording || !showTeleprompter {
                timer.invalidate()
                return
            }
            
            scrollOffset += wordsPerTick
            
            if scrollOffset >= Double(wordCount) {
                timer.invalidate()
            }
        }
    }
    
    func stopTeleprompter() {
        teleprompterTimer?.invalidate()
        scrollOffset = 0
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
    let recordingId: String
    @ObservedObject var audioManager: AudioManager
    let onSave: (String, String?) -> Void  // title, category
    let onTryAgain: () -> Void
    let onDiscard: () -> Void
    
    @State private var title: String
    @State private var selectedPlayback = 2 // Loop until I stop
    @State private var selectedCategory: String? = nil
    
    let playbackOptions = ["Play once", "Loop 3 times", "Loop until I stop"]
    
    init(affirmationText: String, recordingId: String, audioManager: AudioManager, 
         onSave: @escaping (String, String?) -> Void, onTryAgain: @escaping () -> Void, 
         onDiscard: @escaping () -> Void) {
        self.affirmationText = affirmationText
        self.recordingId = recordingId
        self.audioManager = audioManager
        self.onSave = onSave
        self.onTryAgain = onTryAgain
        self.onDiscard = onDiscard
        
        // Generate default title from affirmation text
        let truncated = String(affirmationText.prefix(40))
        self._title = State(initialValue: truncated + (affirmationText.count > 40 ? "..." : ""))
    }
    
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
                    
                    TextField("Enter title", text: $title)
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
                    Button(action: {
                        onSave(title, selectedCategory)
                    }) {
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
        .onAppear {
            // Load the recording to get duration
            do {
                try audioManager.setupPlayer(for: recordingId)
            } catch {
                print("Failed to setup player: \(error.localizedDescription)")
            }
        }
    }
    
    var waveformPlayer: some View {
        HStack(spacing: 12) {
            Button(action: {
                if audioManager.isPlaying {
                    audioManager.pause()
                } else {
                    do {
                        if audioManager.duration == 0 {
                            // Need to setup player first
                            try audioManager.setupPlayer(for: recordingId)
                        }
                        try audioManager.play(recordingId: recordingId)
                    } catch {
                        print("❌ Failed to play recording: \(error.localizedDescription)")
                    }
                }
            }) {
                ZStack {
                    Circle()
                        .fill(Color.resText)
                        .frame(width: 38, height: 38)
                    
                    Image(systemName: audioManager.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.white)
                        .offset(x: audioManager.isPlaying ? 0 : 1)
                }
            }
            
            WaveformBar()
            
            Text(audioManager.duration > 0 ? audioManager.duration.formattedTime : "--:--")
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

import SwiftUI

struct PlaybackOptionsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var audioManager: AudioManager
    @Binding var selectedAmbient: AmbientSound?
    let isPlayingQueue: Bool
    let onOpenAmbientSelector: () -> Void
    let onStopPlayback: () -> Void

    private let speedOptions: [Float] = [0.75, 1.0, 1.25, 1.5]

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header

                    speedSection
                    playbackModeSection
                    backgroundSoundsSection

                    defaultsSection
                    stopSection
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.bottom, 28)
            }
            .background(Color.resBg)
            .navigationBarHidden(true)
            .overlay(alignment: .topTrailing) {
                Button(action: {
                    HapticManager.shared.buttonTap()
                    dismiss()
                }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.resTextMuted)
                        .padding(16)
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Playback Options")
                .font(.resDisplay)
                .foregroundColor(.resText)

            Text("Make playback feel just right.")
                .font(.resBodySm)
                .foregroundColor(.resTextSoft)
                .lineSpacing(4)
        }
        .padding(.top, 22)
    }

    private var speedSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("SPEED")
                .font(.resMicro)
                .foregroundColor(.resTextMuted)
                .kerning(0.07)

            HStack(spacing: 10) {
                ForEach(speedOptions, id: \.self) { option in
                    Button(action: {
                        HapticManager.shared.selection()
                        audioManager.setPlaybackRate(option)
                    }) {
                        Text(labelForSpeed(option))
                            .font(.resBodySm.weight(.semibold))
                            .foregroundColor(isSelectedSpeed(option) ? .white : .resTextSoft)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(isSelectedSpeed(option) ? Color.resSage : Color.resCard)
                            .cornerRadius(12)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(16)
        .background(Color.resCard)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.resBorder, lineWidth: 1)
        )
        .cornerRadius(16)
    }

    private var playbackModeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("PLAYBACK MODE")
                .font(.resMicro)
                .foregroundColor(.resTextMuted)
                .kerning(0.07)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                modeCard(title: "Once", subtitle: "Play one time", systemImage: "play", mode: .once)
                modeCard(title: "Loop", subtitle: "Repeat forever", systemImage: "infinity", mode: .loop)
                modeCard(title: "Repeat", subtitle: "Set number of times", systemImage: "repeat", mode: .repeatCount)
                modeCard(title: "Duration", subtitle: "Play for set time", systemImage: "clock", mode: .duration)
            }

            if audioManager.playbackMode == .repeatCount {
                Stepper(value: Binding(
                    get: { audioManager.repeatCount },
                    set: { audioManager.setRepeatCount($0) }
                ), in: 1...25) {
                    Text("Repeat \(audioManager.repeatCount)x")
                        .font(.resBodySm)
                        .foregroundColor(.resTextSoft)
                }
                .padding(.top, 4)
            }

            if audioManager.playbackMode == .duration {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Duration")
                            .font(.resBodySm)
                            .foregroundColor(.resTextSoft)
                        Spacer()
                        Text(formatDuration(audioManager.durationLimitSeconds))
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                    }

                    Slider(value: Binding(
                        get: { audioManager.durationLimitSeconds },
                        set: { audioManager.setDurationLimitSeconds($0) }
                    ), in: 15...600, step: 15)
                    .accentColor(.resSage)
                }
                .padding(.top, 4)
            }
        }
        .padding(16)
        .background(Color.resCard)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.resBorder, lineWidth: 1)
        )
        .cornerRadius(16)
    }

    private var backgroundSoundsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("BACKGROUND SOUNDS")
                    .font(.resMicro)
                    .foregroundColor(.resTextMuted)
                    .kerning(0.07)

                Spacer()

                Toggle("", isOn: Binding(
                    get: { audioManager.isBackgroundSoundsEnabled },
                    set: { newValue in
                        HapticManager.shared.toggle()
                        audioManager.setBackgroundSoundsEnabled(newValue)
                    }
                ))
                .labelsHidden()
                .toggleStyle(SwitchToggleStyle(tint: .resSage))
            }

            Button(action: {
                HapticManager.shared.buttonTap()
                onOpenAmbientSelector()
            }) {
                HStack(spacing: 14) {
                    Image(systemName: audioManager.isAmbientPlaying ? "speaker.wave.2.fill" : "speaker.wave.2")
                        .font(.system(size: 18))
                        .foregroundColor(.resTextSoft)
                        .frame(width: 24)

                    VStack(alignment: .leading, spacing: 3) {
                        Text("Sound")
                            .font(.resBodyMd)
                            .foregroundColor(.resText)

                        Text(selectedAmbient?.name ?? "None")
                            .font(.resCaption)
                            .foregroundColor(.resTextMuted)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 14))
                        .foregroundColor(.resTextMuted)
                }
                .padding(.vertical, 10)
            }
            .buttonStyle(.plain)
            .opacity(audioManager.isBackgroundSoundsEnabled ? 1.0 : 0.4)

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("VOLUME")
                        .font(.resMicro)
                        .foregroundColor(.resTextSoft)
                        .kerning(0.07)
                    Spacer()
                    Text("\(Int(audioManager.ambientVolume * 100))%")
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                }

                Slider(value: Binding(
                    get: { audioManager.ambientVolume },
                    set: { audioManager.setAmbientVolume($0) }
                ), in: 0...1)
                .accentColor(.resSage)
                .disabled(!audioManager.isBackgroundSoundsEnabled)
            }

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("VOICE DUCKING")
                        .font(.resMicro)
                        .foregroundColor(.resTextSoft)
                        .kerning(0.07)
                    Spacer()
                    Text("\(Int(audioManager.ambientDuckingAmount * 100))%")
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                }

                Slider(value: Binding(
                    get: { audioManager.ambientDuckingAmount },
                    set: { audioManager.setAmbientDuckingAmount($0) }
                ), in: 0...1)
                .accentColor(.resSage)
            }

            Text("How much to lower background sounds during voice playback")
                .font(.resCaption)
                .foregroundColor(.resTextMuted)
        }
        .padding(16)
        .background(Color.resCard)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.resBorder, lineWidth: 1)
        )
        .cornerRadius(16)
    }

    private var defaultsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Toggle(isOn: Binding(
                get: { audioManager.autosavePlaybackDefaults },
                set: { newValue in
                    HapticManager.shared.toggle()
                    audioManager.setAutosavePlaybackDefaults(newValue)
                }
            )) {
                Text("Auto-save as default")
                    .font(.resBodySm)
                    .foregroundColor(.resTextSoft)
            }
            .toggleStyle(SwitchToggleStyle(tint: .resSage))

            Button(action: {
                HapticManager.shared.buttonTap()
                audioManager.savePlaybackDefaults()
            }) {
                Text("Save as default")
                    .font(.resBodySm.weight(.semibold))
                    .foregroundColor(.resSage)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.resSageSoft)
                    .cornerRadius(12)
            }
            .buttonStyle(.plain)
        }
        .padding(16)
        .background(Color.resCard)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.resBorder, lineWidth: 1)
        )
        .cornerRadius(16)
    }

    private var stopSection: some View {
        Button(action: {
            HapticManager.shared.buttonTap()
            onStopPlayback()
            dismiss()
        }) {
            Text(isPlayingQueue ? "Stop playlist" : "Stop playback")
                .font(.resBodySm.weight(.semibold))
                .foregroundColor(.resWarm)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.resCard)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.resBorder, lineWidth: 1)
                )
                .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }

    private func modeCard(title: String, subtitle: String, systemImage: String, mode: AudioManager.PlaybackMode) -> some View {
        let isSelected = audioManager.playbackMode == mode

        return Button(action: {
            HapticManager.shared.selection()
            audioManager.setPlaybackMode(mode)
        }) {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: systemImage)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(isSelected ? .resSage : .resTextMuted)
                    Spacer()
                    if isSelected {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.resSage)
                    }
                }

                Text(title)
                    .font(.resBodyMd.weight(.semibold))
                    .foregroundColor(.resText)

                Text(subtitle)
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
                    .lineLimit(2)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(isSelected ? Color.resSageSoft.opacity(0.6) : Color.resBg)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Color.resSage.opacity(0.5) : Color.resBorder, lineWidth: 1)
            )
            .cornerRadius(14)
        }
        .buttonStyle(.plain)
    }

    private func isSelectedSpeed(_ option: Float) -> Bool {
        abs(audioManager.playbackRate - option) < 0.01
    }

    private func labelForSpeed(_ option: Float) -> String {
        if abs(option - 1.0) < 0.01 { return "1x" }
        return String(format: "%.2gx", option)
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        if seconds < 60 {
            return "\(Int(seconds))s"
        }
        let minutes = Int(seconds) / 60
        let remaining = Int(seconds) % 60
        if remaining == 0 { return "\(minutes)m" }
        return "\(minutes)m \(remaining)s"
    }
}

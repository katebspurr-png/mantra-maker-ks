import SwiftUI

struct ImmersivePlayerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    
    let recording: Recording
    @State private var isPlaying = true
    @State private var progress: Double = 0.35
    @State private var isLooping = false
    @State private var hasZenTrack = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(hex: "#1C1610"),
                    Color(hex: "#141009"),
                    Color(hex: "#0F0C07")
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Ambient glows
            AmbientOrb(color: .resWarm, size: 300, delay: 0)
                .position(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height * 0.25)
            
            AmbientOrb(color: .resSage, size: 180, delay: 4)
                .position(x: UIScreen.main.bounds.width * 0.25, y: UIScreen.main.bounds.height * 0.40)
            
            VStack {
                // Close button
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        ZStack {
                            Circle()
                                .fill(Color.resDarkText.opacity(0.06))
                                .frame(width: 36, height: 36)
                            
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.resDarkText.opacity(0.4))
                        }
                    }
                }
                .padding(.horizontal, 22)
                .padding(.top, 16)
                
                Spacer()
                
                // Affirmation content
                VStack(spacing: 28) {
                    Text(recording.title.uppercased())
                        .font(.resMicro)
                        .foregroundColor(.resDarkMuted)
                        .kerning(0.1)
                    
                    Text("\"\(recording.text)\"")
                        .font(.custom("CormorantGaramond-LightItalic", size: 28))
                        .foregroundColor(.resDarkText.opacity(0.92))
                        .lineSpacing(10)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 36)
                
                Spacer()
                
                // Controls
                VStack(spacing: 32) {
                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.resDarkText.opacity(0.08))
                                .frame(height: 1)
                            
                            LinearGradient(
                                colors: [
                                    Color.resWarm.opacity(0.5),
                                    Color.resWarm.opacity(0.75)
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .frame(width: geometry.size.width * progress, height: 1)
                        }
                    }
                    .frame(height: 1)
                    
                    // Playback controls
                    HStack(spacing: 44) {
                        Button(action: { isLooping.toggle() }) {
                            Image(systemName: "repeat")
                                .font(.system(size: 20))
                                .foregroundColor(.resDarkText.opacity(isLooping ? 1.0 : 0.6))
                        }
                        .opacity(isLooping ? 1.0 : 0.5)
                        
                        Button(action: { isPlaying.toggle() }) {
                            ZStack {
                                Circle()
                                    .fill(Color.resDarkText.opacity(0.08))
                                    .background(.ultraThinMaterial.opacity(0.3))
                                    .frame(width: 64, height: 64)
                                
                                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                    .font(.system(size: 22))
                                    .foregroundColor(.resDarkText.opacity(0.9))
                                    .offset(x: isPlaying ? 0 : 2)
                            }
                        }
                        
                        Button(action: { hasZenTrack.toggle() }) {
                            Image(systemName: "speaker.wave.2")
                                .font(.system(size: 20))
                                .foregroundColor(.resDarkText.opacity(hasZenTrack ? 1.0 : 0.6))
                        }
                        .opacity(hasZenTrack ? 1.0 : 0.4)
                    }
                }
                .padding(.horizontal, 36)
                .padding(.bottom, 48)
            }
        }
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.height > 100 {
                        dismiss()
                    }
                }
        )
    }
}

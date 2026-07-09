import SwiftUI

// MARK: - Affirmation Quote View
struct AffirmationQuoteView: View {
    let text: String
    let size: QuoteSize
    
    enum QuoteSize {
        case large, medium, small
        
        var font: Font {
            switch self {
            case .large: return .resAffirmationLg
            case .medium: return .resAffirmationMd
            case .small: return .resAffirmationSm
            }
        }
        
        var lineSpacing: CGFloat {
            switch self {
            case .large: return 8
            case .medium: return 6
            case .small: return 5
            }
        }
    }
    
    var body: some View {
        Text(text)
            .font(size.font)
            .foregroundColor(.resText)
            .lineSpacing(size.lineSpacing)
    }
}

// MARK: - Play Button Circle
struct PlayButtonCircle: View {
    let size: CGFloat
    let isPlaying: Bool
    let action: () -> Void
    
    init(size: CGFloat = 52, isPlaying: Bool = false, action: @escaping () -> Void = {}) {
        self.size = size
        self.isPlaying = isPlaying
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .stroke(Color.resText, lineWidth: 1.5)
                    .frame(width: size, height: size)
                
                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size * 0.35, height: size * 0.35)
                    .foregroundColor(.resText)
                    .offset(x: isPlaying ? 0 : 2)
            }
        }
    }
}

// MARK: - Small Play Button (for lists)
struct SmallPlayButton: View {
    let size: CGFloat
    let isPlaying: Bool
    let action: () -> Void
    
    init(size: CGFloat = 32, isPlaying: Bool = false, action: @escaping () -> Void = {}) {
        self.size = size
        self.isPlaying = isPlaying
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(Color.resSageSoft)
                    .frame(width: size, height: size)
                
                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size * 0.35, height: size * 0.35)
                    .foregroundColor(.resSage)
                    .offset(x: isPlaying ? 0 : 1)
            }
        }
    }
}

// MARK: - Category Chip
struct CategoryChip: View {
    let text: String
    let isActive: Bool
    let action: () -> Void
    
    init(_ text: String, isActive: Bool = false, action: @escaping () -> Void = {}) {
        self.text = text
        self.isActive = isActive
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            Text(text)
                .font(isActive ? .resSemiboldSm : .resBodySm)
                .foregroundColor(isActive ? .resBg : .resTextSoft)
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(isActive ? Color.resText : Color.resSageSoft)
                .cornerRadius(ResRadius.lg)
        }
    }
}

// MARK: - Warm Block
struct WarmBlock<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 26)
        .padding(.vertical, 28)
        .background(Color.resBgWarm)
    }
}

// MARK: - Collapsible Section
struct CollapsibleSection: View {
    let title: String
    let subtitle: String?
    @Binding var isExpanded: Bool
    let content: (() -> AnyView)?
    
    init(title: String, subtitle: String? = nil, isExpanded: Binding<Bool>, content: (() -> AnyView)? = nil) {
        self.title = title
        self.subtitle = subtitle
        self._isExpanded = isExpanded
        self.content = content
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: { withAnimation(ResMotion.standard) { isExpanded.toggle() } }) {
                HStack {
                    Text(title)
                        .font(.custom("PlusJakartaSans-SemiBold", size: 16))
                        .foregroundColor(.resText)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.system(size: 14))
                        .foregroundColor(.resTextMuted)
                        .rotationEffect(.degrees(isExpanded ? 180 : 0))
                }
                .padding(.vertical, 16)
            }
            
            if isExpanded, let content = content {
                content()
                    .padding(.bottom, 18)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(.horizontal, ResSpacing.screen)
        .background(
            VStack {
                Spacer()
                Hairline()
            }
        )
    }
}

// MARK: - Breathing Ring Animation
struct BreathingRing: View {
    let diameter: CGFloat
    let color: Color
    let delay: Double
    @State private var isPulsing = false
    
    var body: some View {
        Circle()
            .stroke(color.opacity(isPulsing ? 0.9 : 0.5), lineWidth: 1)
            .frame(width: diameter, height: diameter)
            .scaleEffect(isPulsing ? 1.06 : 1.0)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 3.5)
                    .repeatForever(autoreverses: true)
                    .delay(delay)
                ) {
                    isPulsing = true
                }
            }
    }
}

// MARK: - Ambient Orb (for Immersive Player)
struct AmbientOrb: View {
    let color: Color
    let size: CGFloat
    let delay: Double
    @State private var isPulsing = false
    
    var body: some View {
        Circle()
            .fill(
                RadialGradient(
                    colors: [color.opacity(0.12), .clear],
                    center: .center,
                    startRadius: 0,
                    endRadius: size / 2
                )
            )
            .frame(width: size, height: size)
            .scaleEffect(isPulsing ? 1.08 : 1.0)
            .opacity(isPulsing ? 0.7 : 0.4)
            .blur(radius: 50)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 10)
                    .repeatForever(autoreverses: true)
                    .delay(delay)
                ) {
                    isPulsing = true
                }
            }
    }
}

// MARK: - Waveform Bar
struct WaveformBar: View {
    let barCount: Int
    let progress: Double
    
    init(barCount: Int = 45, progress: Double = 0.35) {
        self.barCount = barCount
        self.progress = progress
    }
    
    var body: some View {
        HStack(spacing: 1.5) {
            ForEach(0..<barCount, id: \.self) { index in
                let height = 4 + abs(sin(Double(index) * 0.65 + 1) * 20)
                let isFilled = Double(index) < Double(barCount) * progress
                
                RoundedRectangle(cornerRadius: 2)
                    .fill(isFilled ? Color.resSage : Color.resText.opacity(0.15))
                    .frame(height: height)
            }
        }
        .frame(height: 28)
    }
}

// MARK: - Toggle Row (for settings)
struct ToggleRow: View {
    let icon: String
    let label: String
    let detail: String?
    @Binding var isOn: Bool
    
    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 9)
                    .fill(Color.resBgDim)
                    .frame(width: 34, height: 34)
                
                Image(systemName: icon)
                    .font(.system(size: 15))
                    .foregroundColor(.resTextSoft)
            }
            
            VStack(alignment: .leading, spacing: 1) {
                Text(label)
                    .font(.resBodyMd)
                    .foregroundColor(.resText)
                
                if let detail = detail {
                    Text(detail)
                        .font(.resCaption)
                        .foregroundColor(.resTextMuted)
                }
            }
            
            Spacer()
            
            Toggle("", isOn: $isOn)
                .labelsHidden()
                .toggleStyle(ResToggleStyle())
        }
        .padding(.vertical, 14)
    }
}

// MARK: - Custom Toggle Style
struct ResToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack {
            configuration.label
            
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(configuration.isOn ? Color.resSage : Color.resBorder)
                    .frame(width: 44, height: 24)
                
                Circle()
                    .fill(Color.white)
                    .frame(width: 18, height: 18)
                    .offset(x: configuration.isOn ? 10 : -10)
                    .animation(.easeInOut(duration: 0.2), value: configuration.isOn)
            }
            .onTapGesture {
                configuration.isOn.toggle()
            }
        }
    }
}

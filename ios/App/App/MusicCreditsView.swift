import SwiftUI

struct MusicCreditsView: View {
    @Environment(\.dismiss) var dismiss

    private struct Credit: Identifiable {
        let id = UUID()
        let track: String
        let artist: String
        let license: String
    }

    private let credits: [Credit] = [
        Credit(track: "Arnor", artist: "Alex-Productions", license: "CC BY 3.0"),
        Credit(track: "Evening Improvisation (with Ethera)", artist: "Spheriá", license: "CC BY-SA 3.0"),
        Credit(track: "Golden Hour", artist: "Purrple Cat", license: "CC BY-SA 3.0"),
        Credit(track: "Moonlight", artist: "Scott Buckley", license: "CC BY 4.0"),
        Credit(track: "The Long Way Home", artist: "Alex-Productions", license: "CC BY 3.0"),
        Credit(track: "Transcendence", artist: "Alexander Nakarada", license: "CC BY 4.0"),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("Music credits")
                        .font(.resDisplay)
                        .foregroundColor(.resText)

                    Spacer()

                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.resTextMuted)
                    }
                }
                .padding(.horizontal, ResSpacing.screen)
                .padding(.top, 28)
                .padding(.bottom, 8)

                Text("The ambient music in Resonance is by these generous artists.")
                    .font(.resBodySm)
                    .foregroundColor(.resTextSoft)
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.bottom, 24)

                VStack(spacing: 0) {
                    ForEach(Array(credits.enumerated()), id: \.element.id) { index, credit in
                        VStack(alignment: .leading, spacing: 3) {
                            Text(credit.track)
                                .font(.resSerif16)
                                .foregroundColor(.resText)
                            Text("\(credit.artist) · \(credit.license)")
                                .font(.resCaption)
                                .foregroundColor(.resTextMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 14)

                        if index < credits.count - 1 {
                            Divider()
                                .background(Color.resBorder)
                                .padding(.leading, 18)
                        }
                    }
                }
                .background(Color.resCard)
                .overlay(
                    RoundedRectangle(cornerRadius: ResRadius.md)
                        .stroke(Color.resBorder, lineWidth: 1)
                )
                .cornerRadius(ResRadius.md)
                .padding(.horizontal, ResSpacing.screen)

                Text("Music promoted by chosic.com. Each track is used under its Creative Commons license.")
                    .font(.resCaption)
                    .foregroundColor(.resTextMuted)
                    .padding(.horizontal, ResSpacing.screen)
                    .padding(.top, 16)
                    .padding(.bottom, 32)
            }
        }
        .background(Color.resBg)
    }
}

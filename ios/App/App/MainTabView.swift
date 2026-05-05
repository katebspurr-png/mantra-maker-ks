import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(0)
                
                LibraryView()
                    .tag(1)
                
                Color.clear
                    .tag(2)
                
                PlaylistsView()
                    .tag(3)
                
                ProfileView()
                    .tag(4)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            
            CustomTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
        .fullScreenCover(isPresented: $appState.showingImmersivePlayer) {
            if let recording = appState.currentlyPlaying {
                ImmersivePlayerView(recording: recording)
                    .environmentObject(appState)
            }
        }
    }
}

// MARK: - Custom Tab Bar
struct CustomTabBar: View {
    @EnvironmentObject var appState: AppState
    @Binding var selectedTab: Int
    @State private var showingRecordSheet = false
    
    var body: some View {
        ZStack {
            // Blur background
            Rectangle()
                .fill(Color.resBg.opacity(0.95))
                .background(.ultraThinMaterial)
                .overlay(
                    Rectangle()
                        .fill(Color.resBorder)
                        .frame(height: 1),
                    alignment: .top
                )
            
            HStack(spacing: 0) {
                TabBarItem(
                    icon: "house",
                    label: "Home",
                    isSelected: selectedTab == 0
                ) {
                    selectedTab = 0
                }
                
                TabBarItem(
                    icon: "book",
                    label: "Library",
                    isSelected: selectedTab == 1
                ) {
                    selectedTab = 1
                }
                
                // Record CTA Button
                VStack(spacing: 4) {
                    Button(action: { showingRecordSheet = true }) {
                        ZStack {
                            RoundedRectangle(cornerRadius: ResTabBar.ctaRadius)
                                .fill(Color.resText)
                                .frame(width: ResTabBar.ctaSize, height: ResTabBar.ctaSize)
                                .shadow(color: .black.opacity(0.22), radius: 7, x: 0, y: 4)
                            
                            Image(systemName: "mic.fill")
                                .font(.system(size: 19))
                                .foregroundColor(.white)
                        }
                        .offset(y: -ResTabBar.ctaLift)
                    }
                    
                    Text("Record")
                        .font(.resNavLabel)
                        .foregroundColor(.resTextMuted)
                }
                .frame(maxWidth: .infinity)
                
                TabBarItem(
                    icon: "list.bullet",
                    label: "Playlists",
                    isSelected: selectedTab == 3
                ) {
                    selectedTab = 3
                }
                
                TabBarItem(
                    icon: "person",
                    label: "Profile",
                    isSelected: selectedTab == 4
                ) {
                    selectedTab = 4
                }
            }
        }
        .frame(height: ResTabBar.height)
        .sheet(isPresented: $showingRecordSheet) {
            RecordView()
                .environmentObject(appState)
        }
    }
}

// MARK: - Tab Bar Item
struct TabBarItem: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: isSelected ? .medium : .regular))
                    .foregroundColor(isSelected ? .resSage : .resTextMuted)
                
                Text(label)
                    .font(isSelected ? .resNavLabelActive : .resNavLabel)
                    .foregroundColor(isSelected ? .resSage : .resTextMuted)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

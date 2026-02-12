import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";
import { DemoSignupPrompt } from "@/components/DemoSignupPrompt";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { AFFIRMATIONS_LIBRARY } from "@/data/affirmations";
import { AFFIRMATION_CATEGORIES } from "@/types";
import {
  Mic,
  Play,
  Pause,
  ListMusic,
  Heart,
  AudioWaveform,
  BookOpen,
  User,
  ChevronRight,
} from "lucide-react";

type DemoTab = "home" | "library" | "playlists" | "profile";

export default function DemoApp() {
  const navigate = useNavigate();
  const { demoRecordings, demoPlaylists, showSignupPrompt, enterDemo } = useDemoMode();
  const [activeTab, setActiveTab] = useState<DemoTab>("home");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Enter demo mode on mount
  useState(() => {
    enterDemo();
  });

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const filteredAffirmations = selectedCategory
    ? AFFIRMATIONS_LIBRARY.filter((a) => a.category === selectedCategory)
    : AFFIRMATIONS_LIBRARY;

  return (
    <div className="min-h-screen bg-background pb-32 pt-12">
      <DemoBanner />
      <DemoSignupPrompt />

      {/* Tab content */}
      {activeTab === "home" && (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold">Hi, there! 👋</h1>
            <p className="text-sm text-muted-foreground">Your daily affirmation practice</p>
          </div>

          {/* Record CTA */}
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold shadow-lg gap-2"
            onClick={() => showSignupPrompt("record your own mantras")}
          >
            <Mic className="w-5 h-5" />
            Record New Affirmation
          </Button>

          {/* Sample Mantras */}
          <div>
            <h2 className="font-medium mb-3">My Mantras</h2>
            <div className="space-y-2">
              {demoRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <button
                    onClick={() => togglePlay(rec.id)}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                  >
                    {playingId === rec.id ? (
                      <Pause className="w-4 h-4 text-primary" />
                    ) : (
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{rec.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AudioWaveform className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(rec.duration_seconds)}
                      </span>
                    </div>
                  </div>
                  {rec.is_favorite && <Heart className="w-4 h-4 text-primary fill-primary" />}
                </div>
              ))}
            </div>
          </div>

          {/* Sample Playlist */}
          <div>
            <h2 className="font-medium mb-3">Playlists</h2>
            {demoPlaylists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setActiveTab("playlists")}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{pl.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {pl.recordingIds.length} mantras
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "library" && (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          <h1 className="text-2xl font-semibold">Affirmation Library</h1>
          <p className="text-sm text-muted-foreground">
            Browse affirmations and find ones that resonate
          </p>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              All
            </button>
            {AFFIRMATION_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Affirmation list */}
          <div className="space-y-2">
            {filteredAffirmations.map((aff) => (
              <div
                key={aff.id}
                className="p-4 bg-card rounded-xl border border-border"
              >
                <p className="text-sm leading-relaxed mb-2">"{aff.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">
                    {aff.category.replace("-", " ")}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-primary h-7"
                    onClick={() => showSignupPrompt("record your own mantras")}
                  >
                    <Mic className="w-3 h-3 mr-1" />
                    Record This
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          <h1 className="text-2xl font-semibold">Playlists</h1>

          {/* Existing demo playlist */}
          {demoPlaylists.map((pl) => (
            <div key={pl.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ListMusic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium">{pl.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {pl.recordingIds.length} mantras · Loops on
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {pl.recordingIds.map((rid, i) => {
                  const rec = demoRecordings.find((r) => r.id === rid);
                  if (!rec) return null;
                  return (
                    <div key={rid} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <button
                        onClick={() => togglePlay(rec.id)}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        {playingId === rec.id ? (
                          <Pause className="w-3 h-3 text-primary" />
                        ) : (
                          <Play className="w-3 h-3 text-primary ml-0.5" />
                        )}
                      </button>
                      <p className="text-sm flex-1 truncate">{rec.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(rec.duration_seconds)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => showSignupPrompt("create playlists")}
          >
            <ListMusic className="w-4 h-4" />
            Create New Playlist
          </Button>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign up to personalize your experience
          </p>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Demo User</p>
                <p className="text-sm text-muted-foreground">Exploring Mantra Maker</p>
              </div>
            </div>
          </div>

          {/* Feedback preview */}
          <button
            onClick={() => showSignupPrompt("share feedback")}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <Heart className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left">Give Feedback</span>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          <Button
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Sign Up to Get Started
          </Button>
        </div>
      )}

      {/* Demo bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb z-40">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
          {([
            { icon: Mic, label: "Home", tab: "home" as DemoTab },
            { icon: BookOpen, label: "Library", tab: "library" as DemoTab },
            { icon: ListMusic, label: "Playlists", tab: "playlists" as DemoTab },
            { icon: User, label: "Settings", tab: "profile" as DemoTab },
          ] as const).map(({ icon: Icon, label, tab }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex flex-col items-center justify-center py-2 px-1 min-w-[48px]"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  activeTab === tab ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] mt-1 transition-colors ${
                  activeTab === tab ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

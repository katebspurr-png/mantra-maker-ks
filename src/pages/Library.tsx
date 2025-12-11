import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckSquare, X, FileText, Mic, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AffirmationCard } from "@/components/AffirmationCard";
import { AFFIRMATIONS_LIBRARY } from "@/data/affirmations";
import { AFFIRMATION_CATEGORIES, AffirmationCategory } from "@/types";
import { cn } from "@/lib/utils";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";
import { useRecordingDurations } from "@/hooks/useAudioDuration";

export default function Library() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, source, playSingleRecording, togglePlayPause } = useGlobalAudio();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [activeTab, setActiveTab] = useState("recordings");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(true);

  // Load durations for recordings with 0 duration
  const loadedDurations = useRecordingDurations(
    recordings.map(r => ({
      id: r.id,
      duration_seconds: r.duration_seconds,
      audio_file_path: r.audio_file_path
    }))
  );

  // Fetch user recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingRecordings(false);
        return;
      }

      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRecordings(data as Recording[]);
      }
      setLoadingRecordings(false);
    };

    fetchRecordings();
  }, []);

  // Clear selection when leaving the page
  useEffect(() => {
    return () => {
      setSelectedIds(new Set());
      setSelectionMode(false);
    };
  }, []);

  const filteredAffirmations = AFFIRMATIONS_LIBRARY.filter((a) => {
    const matchesSearch = a.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRecordings = recordings.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecord = (text: string) => {
    navigate("/new-recording", { state: { prefilledText: text } });
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const handleBuildScript = () => {
    const selectedAffirmations = filteredAffirmations.filter((a) => selectedIds.has(a.id));
    const combinedScript = selectedAffirmations
      .map((a) => a.text)
      .join("\n\n");

    navigate("/new-recording", { state: { prefilledText: combinedScript } });
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDuration = (recording: Recording) => {
    if (recording.duration_seconds > 0) return recording.duration_seconds;
    return loadedDurations.get(recording.id) || 0;
  };

  const handlePlayToggle = async (recording: Recording, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentTrack = source?.type === "single" && currentTrack?.id === recording.id;
    
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      await playSingleRecording(recording, {
        mode: "loop",
        repeatCount: 10,
        durationMinutes: 15,
      });
    }
  };

  const isRecordingPlaying = (recordingId: string) =>
    source?.type === "single" && currentTrack?.id === recordingId && isPlaying;

  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Library</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="recordings">My Recordings</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          {/* My Recordings Tab */}
          <TabsContent value="recordings" className="mt-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recordings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingRecordings ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  {recordings.length === 0
                    ? "No recordings yet. Start by recording your first affirmation!"
                    : "No recordings found"}
                </p>
                {recordings.length === 0 && (
                  <Button onClick={() => navigate("/new-recording")}>
                    <Mic className="w-4 h-4 mr-2" />
                    Record Your First Affirmation
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecordings.map((recording) => {
                  const duration = getDuration(recording);
                  const playing = isRecordingPlaying(recording.id);

                  return (
                    <div
                      key={recording.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/recording/${recording.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{recording.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {duration > 0 ? formatDuration(duration) : "--:--"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => handlePlayToggle(recording, e)}
                      >
                        {playing ? (
                          <Pause className="w-4 h-4 text-primary" fill="currentColor" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="mt-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm">
                {selectionMode
                  ? "Tap affirmations to select them"
                  : "Browse and record powerful affirmations"}
              </p>
              <Button
                variant={selectionMode ? "default" : "ghost"}
                size="sm"
                onClick={toggleSelectionMode}
                className="gap-1.5"
              >
                <CheckSquare className="w-4 h-4" />
                {selectionMode ? "Done" : "Select"}
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search affirmations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                All
              </button>
              {AFFIRMATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Affirmations */}
            <div className="space-y-3">
              {filteredAffirmations.map((affirmation) => (
                <AffirmationCard
                  key={affirmation.id}
                  affirmation={affirmation}
                  onRecord={handleRecord}
                  showSelection={selectionMode}
                  isSelected={selectedIds.has(affirmation.id)}
                  onSelectionChange={(selected) => handleSelectionChange(affirmation.id, selected)}
                />
              ))}
              {filteredAffirmations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No affirmations found
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Selection Action Bar */}
      {selectionMode && selectedCount > 0 && (
        <div
          className={cn(
            "fixed left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3",
            isPlaying ? "bottom-32" : "bottom-16"
          )}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 px-2"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button onClick={handleBuildScript} className="gap-1.5">
              <FileText className="w-4 h-4" />
              Build Recording Script
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckSquare, X, FileText, Mic, Play, Pause, Heart, Tag, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AffirmationCard } from "@/components/AffirmationCard";
import { RecordingOptionsMenu } from "@/components/RecordingOptionsMenu";
import { AFFIRMATIONS_LIBRARY } from "@/data/affirmations";
import { AFFIRMATION_CATEGORIES, AffirmationCategory } from "@/types";
import { cn } from "@/lib/utils";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";
import { useRecordingDurations } from "@/hooks/useAudioDuration";
import { toast } from "@/hooks/use-toast";
import { BulletFormatToggle, formatCombinedScript } from "@/components/BulletFormatToggle";

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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteAffirmationIds, setFavoriteAffirmationIds] = useState<Set<string>>(new Set());
  const [useBulletFormat, setUseBulletFormat] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from recordings for filtering
  const allTags = Array.from(
    new Set(recordings.flatMap(r => r.tags || []))
  ).sort();

  // Load durations for recordings with 0 duration
  const loadedDurations = useRecordingDurations(
    recordings.map(r => ({
      id: r.id,
      duration_seconds: r.duration_seconds,
      audio_file_path: r.audio_file_path
    }))
  );

  // Fetch user recordings
  const fetchRecordings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleRecordingDeleted = () => {
    // Refresh the recordings list after deletion
    fetchRecordings();
  };

  // Fetch favorite affirmations
  useEffect(() => {
    const fetchFavoriteAffirmations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorite_affirmations")
        .select("affirmation_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setFavoriteAffirmationIds(new Set(data.map(f => f.affirmation_id)));
      }
    };

    fetchFavoriteAffirmations();
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
    const matchesFavorite = !showFavoritesOnly || favoriteAffirmationIds.has(a.id);
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const filteredRecordings = recordings.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || r.is_favorite;
    const matchesTag = !selectedTag || (r.tags && r.tags.includes(selectedTag));
    return matchesSearch && matchesFavorite && matchesTag;
  });

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
    const combinedScript = formatCombinedScript(
      selectedAffirmations.map((a) => a.text),
      useBulletFormat
    );

    navigate("/new-recording", { state: { prefilledText: combinedScript } });
    setSelectedIds(new Set());
    setSelectionMode(false);
    setUseBulletFormat(false);
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

  const handleToggleRecordingFavorite = async (recording: Recording) => {
    const newValue = !recording.is_favorite;
    
    const { error } = await supabase
      .from("recordings")
      .update({ is_favorite: newValue })
      .eq("id", recording.id);

    if (error) {
      toast({ title: "Error updating favorite", variant: "destructive" });
      return;
    }

    setRecordings(prev => 
      prev.map(r => r.id === recording.id ? { ...r, is_favorite: newValue } : r)
    );
    toast({ title: newValue ? "Added to favorites" : "Removed from favorites" });
  };

  const handleToggleAffirmationFavorite = async (affirmationId: string, isFavorite: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isFavorite) {
      const { error } = await supabase
        .from("favorite_affirmations")
        .insert({ user_id: user.id, affirmation_id: affirmationId });

      if (error) {
        toast({ title: "Error adding to favorites", variant: "destructive" });
        return;
      }

      setFavoriteAffirmationIds(prev => new Set([...prev, affirmationId]));
      toast({ title: "Added to favorites" });
    } else {
      const { error } = await supabase
        .from("favorite_affirmations")
        .delete()
        .eq("user_id", user.id)
        .eq("affirmation_id", affirmationId);

      if (error) {
        toast({ title: "Error removing from favorites", variant: "destructive" });
        return;
      }

      setFavoriteAffirmationIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(affirmationId);
        return newSet;
      });
      toast({ title: "Removed from favorites" });
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Library</h1>
          <Button
            variant={showFavoritesOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-1.5"
          >
            <Heart className={cn("w-4 h-4", showFavoritesOnly && "fill-current")} />
            Favorites
          </Button>
        </div>

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

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5",
                    selectedTag === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5",
                      selectedTag === tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {loadingRecordings ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  {recordings.length === 0
                    ? "No recordings yet. Start by recording your first affirmation!"
                    : selectedTag
                    ? `No recordings with tag "${selectedTag}"`
                    : showFavoritesOnly
                    ? "No favorite recordings yet"
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
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate">{recording.title}</p>
                          {recording.is_best_take && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {duration > 0 ? formatDuration(duration) : "--:--"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRecordingFavorite(recording);
                          }}
                        >
                          <Heart 
                            className={cn(
                              "w-4 h-4 transition-colors",
                              recording.is_favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            )} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={(e) => handlePlayToggle(recording, e)}
                        >
                          {playing ? (
                            <Pause className="w-4 h-4 text-primary" fill="currentColor" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <div onClick={(e) => e.stopPropagation()}>
                          <RecordingOptionsMenu
                            recording={recording}
                            onDeleted={handleRecordingDeleted}
                            showRename
                            onRename={() => navigate(`/recording/${recording.id}`)}
                          />
                        </div>
                      </div>
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
                  isFavorite={favoriteAffirmationIds.has(affirmation.id)}
                  onFavoriteToggle={(isFavorite) => handleToggleAffirmationFavorite(affirmation.id, isFavorite)}
                />
              ))}
              {filteredAffirmations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {showFavoritesOnly ? "No favorite affirmations yet" : "No affirmations found"}
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
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between gap-3">
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
                Build Script
              </Button>
            </div>
            <BulletFormatToggle 
              enabled={useBulletFormat} 
              onChange={setUseBulletFormat} 
            />
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

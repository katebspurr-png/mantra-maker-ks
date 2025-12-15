import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording, LoopMode, PlaybackSettings as PlaybackSettingsType, DEFAULT_PLAYBACK_SETTINGS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PlaybackSettings, usePlaybackSettings, saveDefaultPlaybackSettings } from "@/components/PlaybackSettings";
import { PlaybackStatus } from "@/components/PlaybackStatus";
import { PlaybackSpeedControl } from "@/components/PlaybackSpeedControl";
import { ToneAnalysis } from "@/components/ToneAnalysis";
import { TagInput } from "@/components/TagInput";
import { DeleteRecordingDialog } from "@/components/DeleteRecordingDialog";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useDeleteRecording } from "@/hooks/useDeleteRecording";
import { ArrowLeft, Pencil, Check, X, Play, Pause, Tag, Trash2, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const RecordingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Delete recording hook
  const { deleteRecording, isDeleting } = useDeleteRecording({
    onSuccess: () => {
      navigate("/home");
    },
  });
  
  // Playback settings with session persistence
  const { settings: playbackSettings, setSettings: setPlaybackSettings, saveAsDefault } = usePlaybackSettings();

  // Use global audio context for persistent playback
  const {
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    source,
    playbackStatus,
    playbackSpeed,
    playSingleRecording,
    togglePlayPause,
    seek,
    updatePlaybackSettings,
    setPlaybackSpeed,
  } = useGlobalAudio();

  // Check if this recording is currently playing in global player
  const isThisRecordingPlaying = source?.type === "single" && source?.id === id;

  useEffect(() => {
    fetchRecording();
  }, [id]);

  const fetchRecording = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setRecording(data as Recording);
      setEditedTitle(data.title);
      setEditedTags(data.tags || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load recording");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!recording || !editedTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("recordings")
        .update({ title: editedTitle })
        .eq("id", recording.id);

      if (error) throw error;

      setRecording({ ...recording, title: editedTitle });
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update title");
    }
  };

  const handleSaveTags = async () => {
    if (!recording) return;

    try {
      const { error } = await supabase
        .from("recordings")
        .update({ tags: editedTags })
        .eq("id", recording.id);

      if (error) throw error;

      setRecording({ ...recording, tags: editedTags });
      setIsEditingTags(false);
      toast.success("Tags updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update tags");
    }
  };

  const handleToggleBestTake = async () => {
    if (!recording) return;

    const newValue = !recording.is_best_take;
    
    try {
      const { error } = await supabase
        .from("recordings")
        .update({ is_best_take: newValue })
        .eq("id", recording.id);

      if (error) throw error;

      setRecording({ ...recording, is_best_take: newValue });
      toast.success(newValue ? "Marked as Best Take" : "Removed Best Take");
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handlePlaybackSettingsChange = (newSettings: PlaybackSettingsType) => {
    setPlaybackSettings(newSettings);
    // Also update the global player if this recording is playing
    if (isThisRecordingPlaying) {
      updatePlaybackSettings(newSettings);
    }
  };

  const handleSaveAsDefault = () => {
    saveAsDefault();
    toast.success("Saved as default playback settings");
  };

  /**
   * Handle play/pause - uses global audio context
   * PWA COMPATIBILITY: Called directly from user gesture (button click)
   */
  const handlePlayPause = async () => {
    if (!recording) return;
    
    if (isThisRecordingPlaying) {
      // This recording is already in global player, just toggle
      togglePlayPause();
    } else {
      // Start playing this recording in global player
      await playSingleRecording(recording, playbackSettings);
    }
  };

  const handleSeek = (value: number[]) => {
    if (isThisRecordingPlaying) {
      seek(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Use global player state if this recording is playing, otherwise local
  const displayDuration = isThisRecordingPlaying ? duration : recording?.duration_seconds || 0;
  const displayCurrentTime = isThisRecordingPlaying ? currentTime : 0;
  const displayIsPlaying = isThisRecordingPlaying && isPlaying;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!recording) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Recording</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
          {/* Title Section */}
          <div className="space-y-3">
            {isEditingTitle ? (
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    disabled={!editedTitle.trim()}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(recording.title);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{recording.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(recording.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Best Take Toggle - subtle, user-controlled marker */}
                <button
                  onClick={handleToggleBestTake}
                  className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                >
                  <Star 
                    className={`w-4 h-4 ${recording.is_best_take ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} 
                  />
                  <span className={recording.is_best_take ? "text-amber-600" : "text-muted-foreground"}>
                    {recording.is_best_take ? "Best Take" : "Mark as Best Take"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Label>Tags</Label>
              </div>
              {!isEditingTags ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTags(true)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveTags}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingTags(false);
                      setEditedTags(recording.tags || []);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
            {isEditingTags ? (
              <TagInput
                tags={editedTags}
                onChange={setEditedTags}
                placeholder="Add tags..."
              />
            ) : (
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {(recording.tags && recording.tags.length > 0) ? (
                  recording.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags added</span>
                )}
              </div>
            )}
          </div>

          {/* Affirmation Text */}
          {recording.text && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Affirmation:</p>
              <p className="text-base whitespace-pre-wrap">{recording.text}</p>
            </div>
          )}

          {/* Audio Player */}
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Button
                size="icon"
                className="w-20 h-20 rounded-full"
                onClick={handlePlayPause}
              >
                {displayIsPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Slider
                value={[displayCurrentTime]}
                max={displayDuration || 1}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(displayCurrentTime)}</span>
                <span>{formatTime(displayDuration)}</span>
              </div>
            </div>

            {/* Playback Status */}
            {displayIsPlaying && (
              <PlaybackStatus
                mode={playbackStatus.mode}
                currentRepetition={playbackStatus.currentRepetition}
                totalRepetitions={playbackStatus.totalRepetitions}
                elapsedSeconds={playbackStatus.elapsedSeconds}
                totalDurationSeconds={playbackStatus.totalDurationSeconds}
                isPlaying={displayIsPlaying}
              />
            )}
          </div>

          {/* Playback Speed */}
          <div className="pt-4 border-t border-border">
            <PlaybackSpeedControl
              speed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />
          </div>

          {/* Playback Settings */}
          <div className="space-y-3 pt-4 border-t border-border">
            <PlaybackSettings
              settings={playbackSettings}
              onChange={handlePlaybackSettingsChange}
              onSaveAsDefault={handleSaveAsDefault}
            />
          </div>

          {/* Tone Analysis */}
          <div className="pt-4 border-t border-border">
            <ToneAnalysis
              audioUrl={recording.audio_file_path}
              affirmationText={recording.text || undefined}
            />
          </div>

          {/* Delete Recording */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Recording
            </Button>
          </div>
        </div>
      </div>

      <DeleteRecordingDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => deleteRecording(recording.id, recording.audio_file_path)}
        isDeleting={isDeleting}
      />

      <BottomNavigation />
    </div>
  );
};

export default RecordingDetail;

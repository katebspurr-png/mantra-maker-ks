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
import { ToneAnalysis } from "@/components/ToneAnalysis";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { ArrowLeft, Pencil, Check, X, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const RecordingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  
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
    playSingleRecording,
    togglePlayPause,
    seek,
    updatePlaybackSettings,
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
            )}
          </div>

          {/* Affirmation Text */}
          {recording.text && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Affirmation:</p>
              <p className="text-base">{recording.text}</p>
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
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default RecordingDetail;

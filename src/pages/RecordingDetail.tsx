import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording, LoopMode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { BottomNavigation } from "@/components/BottomNavigation";
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
  const [editedLoopMode, setEditedLoopMode] = useState<LoopMode>("infinite");

  // Use global audio context for persistent playback
  const {
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    source,
    loopMode: currentLoopMode,
    playSingleRecording,
    togglePlayPause,
    seek,
    setLoopMode,
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
      setEditedLoopMode(data.loop_mode);
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

  const handleSaveLoopMode = async (newMode: LoopMode) => {
    if (!recording) return;

    try {
      const { error } = await supabase
        .from("recordings")
        .update({ loop_mode: newMode })
        .eq("id", recording.id);

      if (error) throw error;

      setRecording({ ...recording, loop_mode: newMode });
      setEditedLoopMode(newMode);
      
      // Also update global player if this recording is playing
      if (isThisRecordingPlaying) {
        setLoopMode(newMode);
      }
      
      toast.success("Loop mode updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update loop mode");
    }
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
      await playSingleRecording(recording, editedLoopMode);
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
  const displayLoopMode = isThisRecordingPlaying ? currentLoopMode : editedLoopMode;

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

          {/* Audio Player - Using Global Context */}
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

            {displayLoopMode === "three_times" && displayIsPlaying && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Looping 3 times...
                </p>
              </div>
            )}

            {displayLoopMode === "infinite" && displayIsPlaying && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Playing on infinite loop...
                </p>
              </div>
            )}
          </div>

          {/* Loop Mode Selection */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Loop Mode</Label>
            <RadioGroup
              value={editedLoopMode}
              onValueChange={(value) => handleSaveLoopMode(value as LoopMode)}
            >
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="once" id="detail-once" />
                <Label htmlFor="detail-once" className="flex-1 cursor-pointer font-normal">
                  Play once
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="three_times" id="detail-three" />
                <Label htmlFor="detail-three" className="flex-1 cursor-pointer font-normal">
                  Loop 3 times
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="infinite" id="detail-infinite" />
                <Label htmlFor="detail-infinite" className="flex-1 cursor-pointer font-normal">
                  Loop until I stop
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default RecordingDetail;

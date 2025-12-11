import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recording } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Play, Pause, Infinity } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useRecordingDurations } from "@/hooks/useAudioDuration";

interface RecordingsListProps {
  recordings: Recording[];
  onRecordingsChange: () => void;
  playingId: string | null;
  onPlayToggle: (recording: Recording) => void;
}

const RecordingsList = ({ recordings, onRecordingsChange, playingId, onPlayToggle }: RecordingsListProps) => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { currentTrack, source, isPlaying } = useGlobalAudio();
  
  // Load actual durations for recordings that have 0 stored
  const loadedDurations = useRecordingDurations(recordings);
  
  const getDuration = (recording: Recording) => {
    if (recording.duration_seconds > 0) return recording.duration_seconds;
    return loadedDurations.get(recording.id) || 0;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLoopIcon = (loopMode: string) => {
    switch (loopMode) {
      case "once":
        return "1×";
      case "three_times":
        return "3×";
      case "infinite":
        return <Infinity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleDelete = async (id: string, audioPath: string) => {
    try {
      // Delete from storage
      const fileName = audioPath.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("recordings")
          .remove([audioPath]);
        
        if (storageError) {
          console.error("Storage deletion error:", storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("recordings")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Recording deleted");
      onRecordingsChange();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete recording");
    } finally {
      setDeleteId(null);
    }
  };

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
        <p className="text-muted-foreground">
          Tap the New Recording button to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {recordings.map((recording) => {
          // Check if this recording is the current track in the global player
          const isCurrentInPlayer = source?.type === "single" && currentTrack?.id === recording.id;
          const isCurrentlyPlaying = isCurrentInPlayer && isPlaying;
          
          return (
            <div
              key={recording.id}
              className={`bg-card rounded-2xl p-4 shadow-sm border transition-all cursor-pointer ${
                isCurrentInPlayer 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border hover:shadow-md"
              }`}
              onClick={() => navigate(`/recording/${recording.id}`)}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 touch-target"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayToggle(recording);
                  }}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{recording.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatDuration(getDuration(recording))}</span>
                  <span>•</span>
                  <span>{format(new Date(recording.created_at), "MMM d")}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {getLoopIcon(recording.loop_mode)}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recording/${recording.id}`);
                    }}
                  >
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(recording.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recording?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This recording will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const recording = recordings.find((r) => r.id === deleteId);
                if (recording) {
                  handleDelete(recording.id, recording.audio_file_path);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecordingsList;
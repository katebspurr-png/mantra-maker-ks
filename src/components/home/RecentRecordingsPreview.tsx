import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Pause, Mic, ChevronRight, Star } from "lucide-react";
import { Recording } from "@/types";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useImmersivePlayer } from "@/contexts/ImmersivePlayerContext";
import { useRecordingDurations } from "@/hooks/useAudioDuration";
import { RecordingOptionsMenu } from "@/components/RecordingOptionsMenu";

interface RecentRecordingsPreviewProps {
  recordings: Recording[];
  onRecordingDeleted?: () => void;
}

export const RecentRecordingsPreview = ({ recordings, onRecordingDeleted }: RecentRecordingsPreviewProps) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, source, togglePlayPause } = useGlobalAudio();
  const { openImmersive } = useImmersivePlayer();
  
  const recentRecordings = recordings.slice(0, 5);
  
  const loadedDurations = useRecordingDurations(
    recentRecordings.map(r => ({
      id: r.id,
      duration_seconds: r.duration_seconds,
      audio_file_path: r.audio_file_path
    }))
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDuration = (recording: Recording) => {
    if (recording.duration_seconds > 0) return recording.duration_seconds;
    return loadedDurations.get(recording.id) || 0;
  };

  const handlePlayToggle = (recording: Recording, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentTrack = source?.type === "single" && currentTrack?.id === recording.id;
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      openImmersive(recording);
    }
  };

  const isRecordingPlaying = (recordingId: string) => 
    source?.type === "single" && currentTrack?.id === recordingId && isPlaying;

  if (recentRecordings.length === 0) {
    return (
      <div>
        <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
          You haven't recorded any affirmations yet. Start by recording your first one.
        </p>
        <Button 
          onClick={() => navigate("/new-recording")}
          size="sm"
        >
          <Mic className="w-4 h-4 mr-2" />
          Record Your First Affirmation
        </Button>
      </div>
    );
  }

  return (
    <div>
        <div className="space-y-2.5">
          {recentRecordings.map((recording) => {
            const duration = getDuration(recording);
            const playing = isRecordingPlaying(recording.id);
            
            return (
              <div 
                key={recording.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => openImmersive(recording)}
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
                      onDeleted={onRecordingDeleted}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-muted-foreground"
          onClick={() => navigate("/library")}
        >
          View All Recordings
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
    </div>
  );
};

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Mic, ChevronRight } from "lucide-react";
import { Recording } from "@/types";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useRecordingDurations } from "@/hooks/useAudioDuration";

interface RecentRecordingsPreviewProps {
  recordings: Recording[];
}

export const RecentRecordingsPreview = ({ recordings }: RecentRecordingsPreviewProps) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, source, playSingleRecording, togglePlayPause } = useGlobalAudio();
  
  const recentRecordings = recordings.slice(0, 5);
  
  // Load durations for recordings with 0 duration
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

  if (recentRecordings.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-5 h-5 text-primary" />
            <span className="font-semibold">Recent Recordings</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            You haven't recorded any affirmations yet. Start by recording your first one!
          </p>
          <Button 
            onClick={() => navigate("/new-recording")}
            className="w-full"
          >
            <Mic className="w-4 h-4 mr-2" />
            Record Your First Affirmation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <span className="font-semibold">Recent Recordings</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {recentRecordings.map((recording) => {
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
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-muted-foreground"
          onClick={() => navigate("/home")}
        >
          View All Recordings
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

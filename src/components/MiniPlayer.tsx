import { useNavigate } from "react-router-dom";
import { Play, Pause, X } from "lucide-react";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { Progress } from "@/components/ui/progress";
import { PlaybackStatus } from "@/components/PlaybackStatus";

/**
 * MiniPlayer - Persistent bottom audio player
 * 
 * Shows when audio is playing or paused with active track.
 * Positioned above the bottom navigation.
 * Displays playback status (mode, repetition, time remaining).
 * Tapping navigates to the full playback view.
 */
export function MiniPlayer() {
  const navigate = useNavigate();
  const {
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    source,
    playbackStatus,
    togglePlayPause,
    stop,
  } = useGlobalAudio();

  // Don't show if no active source or track
  if (!source || !currentTrack) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleNavigate = () => {
    if (source.type === "single") {
      navigate(`/recording/${source.id}`);
    } else {
      navigate(`/playlist/${source.id}`);
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayPause();
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop();
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2">
      <div
        onClick={handleNavigate}
        className="max-w-lg mx-auto bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg cursor-pointer overflow-hidden"
      >
        {/* Progress bar at top */}
        <Progress value={progress} className="h-1 rounded-none" />
        
        <div className="flex items-center gap-3 p-3">
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{currentTrack.title}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {source.type === "playlist" ? source.title : "Now playing"}
              </p>
              {isPlaying && (
                <PlaybackStatus
                  mode={playbackStatus.mode}
                  currentRepetition={playbackStatus.currentRepetition}
                  totalRepetitions={playbackStatus.totalRepetitions}
                  elapsedSeconds={playbackStatus.elapsedSeconds}
                  totalDurationSeconds={playbackStatus.totalDurationSeconds}
                  isPlaying={isPlaying}
                  compact
                />
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </button>
            <button
              onClick={handleStop}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

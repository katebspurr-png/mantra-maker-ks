import { PlaybackMode } from "@/types";
import { Infinity, Repeat, Clock, Play } from "lucide-react";

/**
 * PlaybackStatus Component
 * 
 * Displays the current playback status based on mode.
 * Shows different information depending on the mode:
 * - Once: "Playing once"
 * - Loop: "Looping"
 * - Repeat: "Repetition X of Y"
 * - Duration: "Time remaining: MM:SS"
 */

interface PlaybackStatusProps {
  mode: PlaybackMode;
  currentRepetition: number;
  totalRepetitions: number;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  isPlaying: boolean;
  compact?: boolean;
}

export function PlaybackStatus({
  mode,
  currentRepetition,
  totalRepetitions,
  elapsedSeconds,
  totalDurationSeconds,
  isPlaying,
  compact = false,
}: PlaybackStatusProps) {
  if (!isPlaying) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusContent = () => {
    switch (mode) {
      case "once":
        return (
          <div className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" />
            <span>Playing once</span>
          </div>
        );
        
      case "loop":
        return (
          <div className="flex items-center gap-1.5">
            <Infinity className="w-3.5 h-3.5" />
            <span>Looping</span>
          </div>
        );
        
      case "repeat":
        return (
          <div className="flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" />
            <span>Repetition {currentRepetition} of {totalRepetitions}</span>
          </div>
        );
        
      case "duration":
        const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Time remaining: {formatTime(remaining)}</span>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="text-xs text-muted-foreground">
        {getStatusContent()}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
      {getStatusContent()}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { WaveformPreview } from "./WaveformPreview";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";

/**
 * AudioPreviewPlayer Component
 * 
 * Plays back a recorded audio blob for preview before saving.
 * Uses its own audio element (not the global player) since this is unsaved audio.
 * Respects the global playback speed setting.
 */

interface AudioPreviewPlayerProps {
  audioBlob: Blob;
  duration: number;
  onCleanup?: () => void;
}

export function AudioPreviewPlayer({ audioBlob, duration, onCleanup }: AudioPreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { playbackSpeed } = useGlobalAudio();

  // Create object URL for the blob
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;
      
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audio.addEventListener("pause", () => {
        setIsPlaying(false);
      });
      
      audio.addEventListener("play", () => {
        setIsPlaying(true);
      });
      
      return () => {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // Update playback rate when global speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Cleanup function for parent to call
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, []);

  // Expose stop function via cleanup callback
  useEffect(() => {
    // Parent can call this to stop playback
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Preview</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      
      {/* Waveform */}
      <WaveformPreview
        audioBlob={audioBlob}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
      />
      
      {/* Play/Pause button */}
      <Button
        variant="outline"
        className="w-full touch-target"
        onClick={togglePlayPause}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4 mr-2" />
            Pause Preview
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Play Preview
          </>
        )}
      </Button>
      
      {/* Speed indicator */}
      {playbackSpeed !== 1 && (
        <p className="text-xs text-center text-muted-foreground">
          Playing at {playbackSpeed}x speed
        </p>
      )}
    </div>
  );
}

// Export a hook for external control
export function useAudioPreviewControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);
  
  return { stopPreview, audioRef };
}

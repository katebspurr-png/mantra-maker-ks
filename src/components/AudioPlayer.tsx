import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause } from "lucide-react";
import { LoopMode } from "@/types/recording";

interface AudioPlayerProps {
  audioUrl: string;
  loopMode: LoopMode;
  duration: number;
}

const AudioPlayer = ({ audioUrl, loopMode, duration }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopsRemaining, setLoopsRemaining] = useState(3);
  const [totalLoops, setTotalLoops] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      handleEnded();
    });

    return () => {
      audio.pause();
      audio.remove();
    };
  }, [audioUrl]);

  useEffect(() => {
    // Reset loop counter when loop mode changes
    if (loopMode === "three_times") {
      setLoopsRemaining(3);
      setTotalLoops(0);
    }
  }, [loopMode]);

  const handleEnded = () => {
    if (loopMode === "once") {
      setIsPlaying(false);
      setCurrentTime(0);
    } else if (loopMode === "three_times") {
      const newTotal = totalLoops + 1;
      setTotalLoops(newTotal);
      
      if (newTotal >= 3) {
        setIsPlaying(false);
        setCurrentTime(0);
        setTotalLoops(0);
        setLoopsRemaining(3);
      } else {
        setLoopsRemaining(3 - newTotal);
        audioRef.current?.play();
      }
    } else if (loopMode === "infinite") {
      audioRef.current?.play();
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      if (loopMode === "three_times" && totalLoops === 0) {
        setLoopsRemaining(3);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <Button
          size="icon"
          className="w-20 h-20 rounded-full"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {loopMode === "three_times" && isPlaying && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {loopsRemaining} {loopsRemaining === 1 ? "loop" : "loops"} remaining
          </p>
        </div>
      )}

      {loopMode === "infinite" && isPlaying && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Playing on infinite loop...
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
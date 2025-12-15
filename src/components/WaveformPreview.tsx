import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * WaveformPreview Component
 * 
 * Renders a visual waveform from an audio Blob.
 * Purely visual - no audio analysis or scoring.
 * Lightweight and performant for mobile.
 */

interface WaveformPreviewProps {
  audioBlob: Blob;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  className?: string;
}

export function WaveformPreview({ 
  audioBlob, 
  currentTime = 0, 
  duration = 0,
  isPlaying = false,
  className 
}: WaveformPreviewProps) {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Number of bars to display
  const BAR_COUNT = 60;

  // Generate waveform data from audio blob
  useEffect(() => {
    const generateWaveform = async () => {
      try {
        setIsLoading(true);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get the audio data from the first channel
        const channelData = audioBuffer.getChannelData(0);
        const samples = channelData.length;
        const samplesPerBar = Math.floor(samples / BAR_COUNT);
        
        const bars: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const start = i * samplesPerBar;
          const end = start + samplesPerBar;
          
          // Calculate RMS (root mean square) for this segment
          let sum = 0;
          for (let j = start; j < end && j < samples; j++) {
            sum += channelData[j] * channelData[j];
          }
          const rms = Math.sqrt(sum / samplesPerBar);
          bars.push(rms);
        }
        
        // Normalize to 0-1 range
        const maxRms = Math.max(...bars, 0.01);
        const normalized = bars.map(v => Math.max(0.05, v / maxRms)); // Min 5% height
        
        setWaveformData(normalized);
        audioContext.close();
      } catch (error) {
        console.error("Error generating waveform:", error);
        // Fallback: generate random-ish waveform
        const fallback = Array.from({ length: BAR_COUNT }, () => 
          0.2 + Math.random() * 0.6
        );
        setWaveformData(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    if (audioBlob) {
      generateWaveform();
    }
  }, [audioBlob]);

  // Calculate playhead position
  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className={cn("h-16 bg-muted/30 rounded-lg animate-pulse", className)} />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-16 bg-muted/20 rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Waveform bars */}
      <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
        {waveformData.map((amplitude, index) => {
          const barPosition = (index / BAR_COUNT) * 100;
          const isPlayed = barPosition < playheadPosition;
          
          return (
            <div
              key={index}
              className={cn(
                "w-1 rounded-full transition-colors duration-150",
                isPlayed ? "bg-primary" : "bg-muted-foreground/30"
              )}
              style={{
                height: `${amplitude * 100}%`,
                minHeight: "4px",
              }}
            />
          );
        })}
      </div>
      
      {/* Playhead line */}
      {duration > 0 && (
        <div
          className={cn(
            "absolute top-0 bottom-0 w-0.5 bg-primary transition-all",
            isPlaying ? "duration-100" : "duration-300"
          )}
          style={{ left: `${playheadPosition}%` }}
        />
      )}
    </div>
  );
}

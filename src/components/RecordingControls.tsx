import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Square, Pause, Play } from "lucide-react";
import { toast } from "sonner";

/**
 * RecordingControls Component
 * 
 * Handles audio recording only. Completely independent from teleprompter.
 * Provides: Record, Pause/Resume, Stop functionality.
 */

interface RecordingControlsProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingPause?: () => void;
  onRecordingResume?: () => void;
  onRecordingStop?: () => void;
}

const MAX_RECORDING_TIME = 600; // 10 minutes in seconds

export function RecordingControls({ 
  onRecordingComplete, 
  onRecordingStart,
  onRecordingPause,
  onRecordingResume,
  onRecordingStop,
}: RecordingControlsProps) {
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused">("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        onRecordingComplete(blob, recordingTimeRef.current);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      onRecordingStart?.();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
            toast.info("Maximum recording length reached (10 minutes)");
          }
          return newTime;
        });
      }, 1000);

    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      setPermissionDenied(true);
      toast.error(
        "Microphone access denied. Please enable microphone permissions in your browser settings."
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      // MediaRecorder pause is supported in most browsers
      if (typeof mediaRecorderRef.current.pause === "function") {
        mediaRecorderRef.current.pause();
        setRecordingState("paused");
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        onRecordingPause?.();
      } else {
        // Fallback: just inform user pause is not supported
        toast.info("Pause not supported in this browser. Use Stop to end recording.");
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      if (typeof mediaRecorderRef.current.resume === "function") {
        mediaRecorderRef.current.resume();
        setRecordingState("recording");
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => {
            const newTime = prev + 1;
            recordingTimeRef.current = newTime;
            if (newTime >= MAX_RECORDING_TIME) {
              stopRecording();
              toast.info("Maximum recording length reached (10 minutes)");
            }
            return newTime;
          });
        }, 1000);
        
        onRecordingResume?.();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== "idle") {
      mediaRecorderRef.current.stop();
      setRecordingState("idle");
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      onRecordingStop?.();
    }
  };

  if (permissionDenied) {
    return (
      <div className="text-center py-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <Circle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Microphone Access Required</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Please enable microphone permissions in your browser settings to record audio.
        </p>
        <Button onClick={() => setPermissionDenied(false)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Recording status */}
        {recordingState !== "idle" && (
          <div className="text-center space-y-2 animate-in fade-in">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${recordingState === "recording" ? "bg-destructive animate-pulse" : "bg-amber-500"}`} />
              <span className="text-sm font-medium">
                {recordingState === "recording" ? "Recording" : "Paused"}
              </span>
            </div>
            <div className="text-4xl font-bold text-primary tabular-nums">
              {formatTime(recordingTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Max: 10:00
            </p>
          </div>
        )}

        {/* Primary recording button */}
        <div className="relative">
          {recordingState === "idle" ? (
            <Button
              size="icon"
              className="w-24 h-24 rounded-full bg-primary hover:bg-primary/90 transition-all"
              onClick={startRecording}
            >
              <Circle className="w-10 h-10" fill="currentColor" />
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              {/* Pause/Resume button */}
              <Button
                size="icon"
                variant="outline"
                className="w-16 h-16 rounded-full"
                onClick={recordingState === "recording" ? pauseRecording : resumeRecording}
              >
                {recordingState === "recording" ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7" />
                )}
              </Button>
              
              {/* Stop button */}
              <Button
                size="icon"
                className="w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90"
                onClick={stopRecording}
              >
                <Square className="w-8 h-8" fill="currentColor" />
              </Button>
            </div>
          )}
        </div>

        {/* Idle state hint */}
        {recordingState === "idle" && (
          <p className="text-muted-foreground text-center text-sm">
            Tap to start recording
          </p>
        )}

        {/* Recording state hints */}
        {recordingState === "recording" && (
          <p className="text-muted-foreground text-center text-xs">
            Pause to take a break, Stop when finished
          </p>
        )}
        {recordingState === "paused" && (
          <p className="text-muted-foreground text-center text-xs">
            Resume to continue, Stop to finish
          </p>
        )}
      </div>
    </div>
  );
}

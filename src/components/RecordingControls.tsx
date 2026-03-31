import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Square, Pause, Play } from "lucide-react";
import { toast } from "sonner";

interface RecordingControlsProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingPause?: () => void;
  onRecordingResume?: () => void;
  onRecordingStop?: () => void;
}

const MAX_RECORDING_TIME = 600;

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (typeof mediaRecorderRef.current.pause === "function") {
        mediaRecorderRef.current.pause();
        setRecordingState("paused");
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        onRecordingPause?.();
      } else {
        toast.info("Pause not supported in this browser. Use Stop to end recording.");
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      if (typeof mediaRecorderRef.current.resume === "function") {
        mediaRecorderRef.current.resume();
        setRecordingState("recording");
        
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
      <div className="text-center py-12 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-5">
          <Circle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Microphone Access Required</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-[260px] mx-auto">
          Please enable microphone permissions in your browser settings to record.
        </p>
        <Button onClick={() => setPermissionDenied(false)} variant="outline" className="rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Recording status */}
        {recordingState !== "idle" && (
          <div className="text-center space-y-2 animate-in fade-in">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${recordingState === "recording" ? "bg-destructive animate-pulse" : "bg-amber-500"}`} />
              <span className="text-sm font-medium text-muted-foreground">
                {recordingState === "recording" ? "Recording" : "Paused"}
              </span>
            </div>
            <div className="text-5xl font-light text-foreground tabular-nums tracking-tight">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {/* Primary recording button */}
        <div className="relative">
          {recordingState === "idle" ? (
            <button
              className="w-28 h-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-lg)] active:scale-95 transition-all duration-200"
              onClick={startRecording}
            >
              <Circle className="w-11 h-11" fill="currentColor" />
            </button>
          ) : (
            <div className="flex items-center gap-5">
              {/* Pause/Resume button */}
              <button
                className="w-16 h-16 rounded-full border border-border/60 bg-card flex items-center justify-center shadow-[var(--shadow-soft)] hover:bg-muted/50 active:scale-95 transition-all"
                onClick={recordingState === "recording" ? pauseRecording : resumeRecording}
              >
                {recordingState === "recording" ? (
                  <Pause className="w-6 h-6 text-foreground/80" />
                ) : (
                  <Play className="w-6 h-6 text-foreground/80" />
                )}
              </button>
              
              {/* Stop button */}
              <button
                className="w-22 h-22 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-[var(--shadow-medium)] hover:bg-destructive/90 active:scale-95 transition-all"
                style={{ width: '5.5rem', height: '5.5rem' }}
                onClick={stopRecording}
              >
                <Square className="w-8 h-8" fill="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Subtle hints */}
        {recordingState === "idle" && (
          <p className="text-muted-foreground/60 text-center text-sm">
            Tap to begin
          </p>
        )}
        {recordingState === "recording" && (
          <p className="text-muted-foreground/50 text-center text-xs">
            Pause or stop when you're ready
          </p>
        )}
        {recordingState === "paused" && (
          <p className="text-muted-foreground/50 text-center text-xs">
            Resume or stop to finish
          </p>
        )}
      </div>
    </div>
  );
}

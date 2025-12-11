import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Square } from "lucide-react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
}

const MAX_RECORDING_TIME = 600; // 10 minutes in seconds

const AudioRecorder = ({ onRecordingComplete, onRecordingStart }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
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
        console.log("Recording stopped. Duration captured:", recordingTimeRef.current, "seconds");
        onRecordingComplete(blob, recordingTimeRef.current);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <Button
          size="icon"
          className={`w-24 h-24 rounded-full transition-all ${
            isRecording
              ? "bg-destructive hover:bg-destructive/90 animate-pulse"
              : "bg-primary hover:bg-primary/90"
          }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <Square className="w-10 h-10" fill="currentColor" />
          ) : (
            <Circle className="w-10 h-10" fill="currentColor" />
          )}
        </Button>
      </div>

      {isRecording && (
        <div className="text-center space-y-2 animate-in">
          <div className="text-4xl font-bold text-primary tabular-nums">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-muted-foreground">
            Recording... (Max: 10:00)
          </p>
        </div>
      )}

      {!isRecording && recordingTime === 0 && (
        <p className="text-muted-foreground text-center">
          Tap the button to start recording
        </p>
      )}
    </div>
  );
};

export default AudioRecorder;
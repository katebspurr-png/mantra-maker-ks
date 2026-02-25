import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";

/**
 * Calibration script – ~100 words, affirmation-themed.
 * Word count stored as constant for WPM calculation.
 */
const CALIBRATION_SCRIPT =
  "I am worthy of love, kindness, and respect. Every day I grow stronger and more confident in who I am. " +
  "I trust the journey of my life, even when the path is unclear. I release what no longer serves me and welcome " +
  "new possibilities with an open heart. My thoughts are powerful, and I choose to fill them with hope and gratitude. " +
  "I deserve peace, happiness, and success. I am enough exactly as I am right now. I believe in my ability to create " +
  "the life I envision. Today I choose courage over fear and progress over perfection.";

const SCRIPT_WORD_COUNT = CALIBRATION_SCRIPT.trim().split(/\s+/).length;
const MIN_DURATION_SECONDS = 10;
const BASELINE_WPM = 140;

interface CalibrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalibrated: (wpm: number) => void;
}

type Phase = "ready" | "recording" | "preview" | "result";

export function CalibrationDialog({ open, onOpenChange, onCalibrated }: CalibrationDialogProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [resultWpm, setResultWpm] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      stopTimer();
      stopPreview();
      cleanupStream();
      cleanupPreviewUrl();
      // Reset after animation
      const t = setTimeout(() => {
        setPhase("ready");
        setElapsed(0);
        setAudioBlob(null);
        setAudioDuration(0);
        setIsPreviewPlaying(false);
        setResultWpm(0);
        setError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopPreview();
      cleanupStream();
      cleanupPreviewUrl();
    };
  }, []);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const cleanupPreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }
    setIsPreviewPlaying(false);
  };

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const duration = (Date.now() - startTimeRef.current) / 1000;
        setAudioBlob(blob);
        setAudioDuration(Math.round(duration));
        cleanupStream();
        stopTimer();

        if (duration < MIN_DURATION_SECONDS) {
          setError(`Please read for at least ${MIN_DURATION_SECONDS} seconds. You recorded ${Math.round(duration)}s.`);
          setPhase("ready");
        } else {
          // Create preview URL
          cleanupPreviewUrl();
          previewUrlRef.current = URL.createObjectURL(blob);
          setPhase("preview");
        }
      };

      startTimeRef.current = Date.now();
      setElapsed(0);
      recorder.start();
      setPhase("recording");

      // Timer
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch {
      setError("Microphone access is needed for calibration.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const togglePreview = useCallback(() => {
    if (!previewUrlRef.current) return;

    if (isPreviewPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
      return;
    }

    const audio = new Audio(previewUrlRef.current);
    previewAudioRef.current = audio;
    audio.onended = () => setIsPreviewPlaying(false);
    audio.play();
    setIsPreviewPlaying(true);
  }, [isPreviewPlaying]);

  const handleUseRecording = useCallback(() => {
    stopPreview();
    const wpm = Math.round((SCRIPT_WORD_COUNT / audioDuration) * 60);
    const clamped = Math.max(40, Math.min(300, wpm));
    setResultWpm(clamped);
    setPhase("result");
  }, [audioDuration]);

  const handleRecordAgain = useCallback(() => {
    stopPreview();
    cleanupPreviewUrl();
    setAudioBlob(null);
    setAudioDuration(0);
    setError(null);
    setPhase("ready");
  }, []);

  const handleSave = useCallback(() => {
    // Save calibration data
    localStorage.setItem("teleprompter_calibrated_wpm", String(resultWpm));
    localStorage.setItem("teleprompter_wpm", String(resultWpm));
    localStorage.setItem("teleprompter_calibrated_at", new Date().toISOString());

    onCalibrated(resultWpm);
    onOpenChange(false);
  }, [resultWpm, onCalibrated, onOpenChange]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleClose = (val: boolean) => {
    if (phase === "recording") {
      // Don't allow close while recording
      return;
    }
    stopPreview();
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Calibrate Teleprompter Speed
          </DialogTitle>
          <DialogDescription>
            Read the text below for 15–30 seconds. We'll match the teleprompter to your voice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Calibration script — always visible except on result */}
          {phase !== "result" && (
            <div className="bg-muted/50 rounded-xl p-5 text-sm leading-relaxed max-h-[200px] overflow-y-auto">
              {CALIBRATION_SCRIPT}
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Ready phase */}
          {phase === "ready" && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                Tap <strong>Start Recording</strong> and read the text aloud at your natural pace.
              </p>
              <Button onClick={startRecording} className="w-full gap-2" size="lg">
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            </div>
          )}

          {/* Recording phase */}
          {phase === "recording" && (
            <div className="space-y-4 text-center">
              {/* Timer */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-sm">Recording</span>
                </div>
                <span className="text-4xl font-mono font-bold tabular-nums text-foreground">
                  {formatTimer(elapsed)}
                </span>
                {elapsed < MIN_DURATION_SECONDS && (
                  <p className="text-xs text-muted-foreground">
                    Minimum {MIN_DURATION_SECONDS - elapsed}s remaining
                  </p>
                )}
              </div>

              <Button
                onClick={stopRecording}
                variant="destructive"
                className="w-full gap-2"
                size="lg"
                disabled={elapsed < MIN_DURATION_SECONDS}
              >
                <Square className="w-4 h-4" />
                Stop Recording
              </Button>

              {elapsed < MIN_DURATION_SECONDS && (
                <p className="text-xs text-muted-foreground">
                  Keep reading — stop will be available at {MIN_DURATION_SECONDS}s
                </p>
              )}
            </div>
          )}

          {/* Preview phase */}
          {phase === "preview" && (
            <div className="space-y-4">
              {/* Duration badge */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {audioDuration}s recorded
                </span>
              </div>

              {/* Preview playback */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={togglePreview}
              >
                {isPreviewPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Preview
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play Preview
                  </>
                )}
              </Button>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleUseRecording}
                >
                  Use This Recording
                </Button>
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground"
                  onClick={handleRecordAgain}
                >
                  <RotateCcw className="w-4 h-4" />
                  Record Again
                </Button>
              </div>
            </div>
          )}

          {/* Result phase */}
          {phase === "result" && (
            <div className="space-y-5 text-center">
              <div className="bg-primary/10 rounded-xl p-6">
                <p className="text-4xl font-bold text-primary">{resultWpm}</p>
                <p className="text-sm text-primary/80 mt-1">words per minute</p>
              </div>

              <p className="text-sm text-muted-foreground">
                Your teleprompter will now match your natural reading pace.
              </p>

              <Button onClick={handleSave} className="w-full" size="lg">
                Use This Speed
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

const SAMPLE_TEXT =
  "I am worthy of love and respect. I believe in my ability to grow. Every day I become more confident and at peace with who I am.";
const SAMPLE_WORD_COUNT = SAMPLE_TEXT.trim().split(/\s+/).length;

interface CalibrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalibrated: (wpm: number) => void;
}

export function CalibrationDialog({ open, onOpenChange, onCalibrated }: CalibrationDialogProps) {
  const [phase, setPhase] = useState<"ready" | "reading" | "done">("ready");
  const [resultWpm, setResultWpm] = useState(0);
  const startTimeRef = useRef(0);

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now();
    setPhase("reading");
  }, []);

  const handleDone = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const wpm = Math.round((SAMPLE_WORD_COUNT / elapsed) * 60);
    const clampedWpm = Math.max(40, Math.min(300, wpm));
    setResultWpm(clampedWpm);
    setPhase("done");
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem("teleprompter_calibrated_wpm", String(resultWpm));
    onCalibrated(resultWpm);
    onOpenChange(false);
    // Reset for next open
    setTimeout(() => setPhase("ready"), 300);
  }, [resultWpm, onCalibrated, onOpenChange]);

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) setTimeout(() => setPhase("ready"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Calibrate Your Pace
          </DialogTitle>
          <DialogDescription>
            Read the text below at your natural speaking pace. We'll match the teleprompter to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Sample text */}
          <div className="bg-muted/50 rounded-xl p-5 text-base leading-relaxed text-center">
            {SAMPLE_TEXT}
          </div>

          {phase === "ready" && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                Tap <strong>Start Reading</strong>, read the text aloud, then tap <strong>Done</strong>.
              </p>
              <Button onClick={handleStart} className="w-full" size="lg">
                Start Reading
              </Button>
            </div>
          )}

          {phase === "reading" && (
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Reading…
              </div>
              <Button onClick={handleDone} className="w-full" size="lg" variant="default">
                Done Reading
              </Button>
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">{resultWpm} WPM</p>
                <p className="text-sm text-muted-foreground mt-1">Your natural pace</p>
              </div>
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

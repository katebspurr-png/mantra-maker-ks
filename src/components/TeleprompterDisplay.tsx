import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TEXT_SIZES = [
  { label: "S", value: 22, lineHeight: 1.9 },
  { label: "M", value: 30, lineHeight: 2.0 },
  { label: "L", value: 40, lineHeight: 2.1 },
  { label: "XL", value: 48, lineHeight: 2.2 },
];

export interface TeleprompterDisplayRef {
  startHighlighting: () => void;
  stopHighlighting: () => void;
  pauseHighlighting: () => void;
  resumeHighlighting: () => void;
  resetHighlighting: () => void;
  isHighlighting: () => boolean;
}

interface TeleprompterDisplayProps {
  text: string;
  karaokeEnabled: boolean;
  textSizeIndex: number;
  wpm: number;
  manualMode: boolean;
  onEditClick?: () => void;
  isEditable?: boolean;
}

function wpmToMs(wpm: number): number {
  return Math.round(60000 / Math.max(wpm, 1));
}

export const TeleprompterDisplay = forwardRef<TeleprompterDisplayRef, TeleprompterDisplayProps>(
  ({ text, karaokeEnabled, textSizeIndex, wpm, manualMode, onEditClick, isEditable = true }, ref) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isHighlightingActive, setIsHighlightingActive] = useState(false);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentTextSize = TEXT_SIZES[textSizeIndex] || TEXT_SIZES[1];
    const msPerWord = wpmToMs(wpm);

    const words = text.trim().split(/\s+/).filter(Boolean);

    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, []);

    const startHighlighting = useCallback(() => {
      if (words.length === 0 || manualMode || !karaokeEnabled) return;
      setCurrentWordIndex(0);
      setIsHighlightingActive(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsHighlightingActive(false);
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    }, [words.length, msPerWord, manualMode, karaokeEnabled]);

    const stopHighlighting = useCallback(() => {
      setIsHighlightingActive(false);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    const pauseHighlighting = useCallback(() => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    const resumeHighlighting = useCallback(() => {
      if (words.length === 0 || manualMode || !karaokeEnabled) return;
      if (currentWordIndex >= words.length - 1) return;
      setIsHighlightingActive(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsHighlightingActive(false);
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    }, [words.length, msPerWord, currentWordIndex, manualMode, karaokeEnabled]);

    const resetHighlighting = useCallback(() => {
      stopHighlighting();
      setCurrentWordIndex(0);
    }, [stopHighlighting]);

    const advanceWord = () => {
      if (currentWordIndex < words.length - 1) setCurrentWordIndex(prev => prev + 1);
    };

    useImperativeHandle(ref, () => ({
      startHighlighting,
      stopHighlighting,
      pauseHighlighting,
      resumeHighlighting,
      resetHighlighting,
      isHighlighting: () => isHighlightingActive,
    }), [startHighlighting, stopHighlighting, pauseHighlighting, resumeHighlighting, resetHighlighting, isHighlightingActive]);

    useEffect(() => {
      if (isHighlightingActive && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setCurrentWordIndex(prev => {
            if (prev >= words.length - 1) {
              setIsHighlightingActive(false);
              if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
              return prev;
            }
            return prev + 1;
          });
        }, msPerWord);
      }
    }, [msPerWord]);

    if (words.length === 0) {
      return (
        <div className="rounded-2xl bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="min-h-[220px] px-6 py-10 flex items-center justify-center">
            <p className="text-muted-foreground/60 text-center">No affirmation text entered</p>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-card shadow-[var(--shadow-soft)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
            Your Affirmation
          </span>
          {isEditable && onEditClick && (
            <Button variant="ghost" size="sm" onClick={onEditClick} className="text-xs h-7 text-muted-foreground hover:text-foreground">
              Edit text
            </Button>
          )}
        </div>

        {/* Text display — immersive */}
        <div 
          ref={containerRef}
          className="min-h-[260px] px-8 py-10 cursor-pointer select-none"
          onClick={manualMode && karaokeEnabled ? advanceWord : undefined}
        >
          <div 
            className="text-center"
            style={{ fontSize: `${currentTextSize.value}px`, lineHeight: currentTextSize.lineHeight }}
          >
            {words.map((word, index) => (
              <span
                key={index}
                className={cn(
                  "inline-block mx-1 py-1 px-0.5 rounded-lg transition-all duration-300",
                  karaokeEnabled && index === currentWordIndex && "text-primary font-semibold scale-105",
                  karaokeEnabled && index < currentWordIndex && "text-muted-foreground/40",
                  karaokeEnabled && index > currentWordIndex && "text-foreground/70",
                  !karaokeEnabled && "text-foreground/85"
                )}
              >
                {word}
              </span>
            ))}
          </div>
          
          {manualMode && karaokeEnabled && (
            <p className="text-xs text-center text-muted-foreground/50 mt-8">
              Tap anywhere to advance
            </p>
          )}
        </div>

        {/* Progress indicator — subtle */}
        {karaokeEnabled && (
          <div className="px-6 pb-4">
            <div className="h-0.5 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary/40 transition-all duration-300 ease-out"
                style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground/40 mt-1.5">
              <span>{currentWordIndex + 1} / {words.length}</span>
              <span>{Math.round((currentWordIndex / words.length) * 100)}%</span>
            </div>
          </div>
        )}

        {!karaokeEnabled && (
          <div className="px-5 pb-4 text-center">
            <span className="text-[10px] text-muted-foreground/40">{words.length} words</span>
          </div>
        )}
      </div>
    );
  }
);

TeleprompterDisplay.displayName = "TeleprompterDisplay";

export { TEXT_SIZES };

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TeleprompterDisplay Component
 * 
 * Shows affirmation text with optional karaoke-style word highlighting.
 * Controls are managed externally via ref methods.
 */

// Text size presets
const TEXT_SIZES = [
  { label: "S", value: 20, lineHeight: 1.8 },
  { label: "M", value: 28, lineHeight: 1.9 },
  { label: "L", value: 36, lineHeight: 2.0 },
  { label: "XL", value: 44, lineHeight: 2.1 },
];

// Pace presets (words per minute -> milliseconds per word)
const PACE_PRESETS = [
  { label: "Slow", wpm: 80, msPerWord: 750 },
  { label: "Medium", wpm: 120, msPerWord: 500 },
  { label: "Fast", wpm: 180, msPerWord: 333 },
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
  paceIndex: number;
  manualMode: boolean;
  onEditClick?: () => void;
  isEditable?: boolean;
}

export const TeleprompterDisplay = forwardRef<TeleprompterDisplayRef, TeleprompterDisplayProps>(
  ({ text, karaokeEnabled, textSizeIndex, paceIndex, manualMode, onEditClick, isEditable = true }, ref) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isHighlightingActive, setIsHighlightingActive] = useState(false);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentTextSize = TEXT_SIZES[textSizeIndex] || TEXT_SIZES[1];
    const currentPace = PACE_PRESETS[paceIndex] || PACE_PRESETS[1];

    // Split text into words
    const words = text.trim().split(/\s+/).filter(Boolean);

    // Clear interval on unmount
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const startHighlighting = useCallback(() => {
      if (words.length === 0 || manualMode || !karaokeEnabled) return;
      
      // Reset to beginning
      setCurrentWordIndex(0);
      setIsHighlightingActive(true);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            // Reached the end, stop highlighting
            setIsHighlightingActive(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return prev;
          }
          return prev + 1;
        });
      }, currentPace.msPerWord);
    }, [words.length, currentPace.msPerWord, manualMode, karaokeEnabled]);

    const stopHighlighting = useCallback(() => {
      setIsHighlightingActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);

    const pauseHighlighting = useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Keep isHighlightingActive true to indicate it's paused, not stopped
    }, []);

    const resumeHighlighting = useCallback(() => {
      if (words.length === 0 || manualMode || !karaokeEnabled) return;
      if (currentWordIndex >= words.length - 1) return;
      
      setIsHighlightingActive(true);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsHighlightingActive(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return prev;
          }
          return prev + 1;
        });
      }, currentPace.msPerWord);
    }, [words.length, currentPace.msPerWord, currentWordIndex, manualMode, karaokeEnabled]);

    const resetHighlighting = useCallback(() => {
      stopHighlighting();
      setCurrentWordIndex(0);
    }, [stopHighlighting]);

    const advanceWord = () => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      startHighlighting,
      stopHighlighting,
      pauseHighlighting,
      resumeHighlighting,
      resetHighlighting,
      isHighlighting: () => isHighlightingActive,
    }), [startHighlighting, stopHighlighting, pauseHighlighting, resumeHighlighting, resetHighlighting, isHighlightingActive]);

    // Update interval speed when pace changes
    useEffect(() => {
      if (isHighlightingActive && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setCurrentWordIndex(prev => {
            if (prev >= words.length - 1) {
              setIsHighlightingActive(false);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return prev;
            }
            return prev + 1;
          });
        }, currentPace.msPerWord);
      }
    }, [currentPace.msPerWord]);

    if (words.length === 0) {
      return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="min-h-[200px] px-6 py-8 flex items-center justify-center">
            <p className="text-muted-foreground text-center">No affirmation text entered</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Your Affirmation
          </span>
          {isEditable && onEditClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
              className="text-xs h-7"
            >
              Edit text
            </Button>
          )}
        </div>

        {/* Text display */}
        <div 
          ref={containerRef}
          className="min-h-[240px] px-6 py-8 cursor-pointer select-none"
          onClick={manualMode && karaokeEnabled ? advanceWord : undefined}
        >
          <div 
            className="text-center leading-relaxed"
            style={{ 
              fontSize: `${currentTextSize.value}px`,
              lineHeight: currentTextSize.lineHeight,
            }}
          >
            {words.map((word, index) => (
              <span
                key={index}
                className={cn(
                  "inline-block mx-1 py-1 px-0.5 rounded transition-all duration-200",
                  karaokeEnabled && index === currentWordIndex && (
                    "text-primary font-semibold scale-105 bg-primary/10"
                  ),
                  karaokeEnabled && index < currentWordIndex && (
                    "text-muted-foreground/60"
                  ),
                  karaokeEnabled && index > currentWordIndex && (
                    "text-foreground/80"
                  ),
                  !karaokeEnabled && "text-foreground"
                )}
              >
                {word}
              </span>
            ))}
          </div>
          
          {manualMode && karaokeEnabled && (
            <p className="text-xs text-center text-muted-foreground mt-6">
              Tap anywhere to advance
            </p>
          )}
        </div>

        {/* Progress indicator - only when karaoke enabled */}
        {karaokeEnabled && (
          <div className="px-4 pb-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{currentWordIndex + 1} / {words.length}</span>
              <span>{Math.round((currentWordIndex / words.length) * 100)}%</span>
            </div>
          </div>
        )}

        {/* Word count when karaoke disabled */}
        {!karaokeEnabled && (
          <div className="px-4 pb-3 text-center">
            <span className="text-xs text-muted-foreground">{words.length} words</span>
          </div>
        )}
      </div>
    );
  }
);

TeleprompterDisplay.displayName = "TeleprompterDisplay";

export { TEXT_SIZES, PACE_PRESETS };

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Type, 
  Gauge,
  RotateCcw,
  Hand
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Teleprompter Component - Karaoke Style
 * 
 * Text Splitting: Words are split by whitespace while preserving punctuation.
 * 
 * Highlight Timing: Based on words-per-minute (WPM) converted to ms-per-word.
 * - Slow: 80 WPM = 750ms per word
 * - Medium: 120 WPM = 500ms per word  
 * - Fast: 180 WPM = 333ms per word
 * 
 * Note: This is a guided reading aid, not speech-aligned. Pace is approximate.
 */

interface TeleprompterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isRecording?: boolean;
}

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

export function Teleprompter({ 
  value, 
  onChange, 
  disabled, 
  placeholder,
  isRecording = false 
}: TeleprompterProps) {
  // State for teleprompter settings
  const [textSizeIndex, setTextSizeIndex] = useState(() => {
    const saved = sessionStorage.getItem("teleprompterTextSize");
    return saved ? parseInt(saved, 10) : 1; // Default to Medium
  });
  const [paceIndex, setPaceIndex] = useState(() => {
    const saved = sessionStorage.getItem("teleprompterPace");
    return saved ? parseInt(saved, 10) : 1; // Default to Medium
  });
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!value);
  const [showControls, setShowControls] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTextSize = TEXT_SIZES[textSizeIndex];
  const currentPace = PACE_PRESETS[paceIndex];

  // Split text into words, preserving punctuation with words
  const words = value.trim().split(/\s+/).filter(Boolean);

  // Persist settings to session storage
  useEffect(() => {
    sessionStorage.setItem("teleprompterTextSize", textSizeIndex.toString());
  }, [textSizeIndex]);

  useEffect(() => {
    sessionStorage.setItem("teleprompterPace", paceIndex.toString());
  }, [paceIndex]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start/stop highlighting based on recording state
  useEffect(() => {
    if (isRecording && value.trim() && !manualMode) {
      // Auto-start highlighting when recording begins
      setIsEditMode(false);
      setShowControls(true);
      startHighlighting();
    } else if (!isRecording && isHighlighting) {
      // Stop highlighting when recording stops
      stopHighlighting();
    }
  }, [isRecording]);

  // Switch to reader mode when there's text and recording starts
  useEffect(() => {
    if (isRecording && value.trim()) {
      setIsEditMode(false);
      setShowControls(true);
    }
  }, [isRecording, value]);

  const startHighlighting = useCallback(() => {
    if (words.length === 0 || manualMode) return;
    
    // Reset to beginning if at the end
    if (currentWordIndex >= words.length) {
      setCurrentWordIndex(0);
    }
    
    setIsHighlighting(true);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= words.length - 1) {
          // Reached the end, stop highlighting
          stopHighlighting();
          return prev;
        }
        return prev + 1;
      });
    }, currentPace.msPerWord);
  }, [words.length, currentPace.msPerWord, currentWordIndex, manualMode]);

  const stopHighlighting = useCallback(() => {
    setIsHighlighting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleHighlighting = () => {
    if (isHighlighting) {
      stopHighlighting();
    } else {
      startHighlighting();
    }
  };

  const resetHighlighting = () => {
    stopHighlighting();
    setCurrentWordIndex(0);
  };

  const advanceWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handlePaceChange = (values: number[]) => {
    setPaceIndex(values[0]);
    // If currently highlighting, restart with new pace
    if (isHighlighting) {
      stopHighlighting();
      setTimeout(() => startHighlighting(), 50);
    }
  };

  const handleTextSizeChange = (direction: "up" | "down") => {
    setTextSizeIndex(prev => {
      if (direction === "up" && prev < TEXT_SIZES.length - 1) return prev + 1;
      if (direction === "down" && prev > 0) return prev - 1;
      return prev;
    });
  };

  const toggleManualMode = () => {
    setManualMode(prev => !prev);
    if (!manualMode) {
      // Switching to manual mode - stop auto highlighting
      stopHighlighting();
    }
  };

  // If in edit mode or no text, show textarea
  if (isEditMode || !value.trim()) {
    return (
      <div className="relative w-full">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
            Your Affirmation
          </label>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder || "Type or paste your affirmation here..."}
            className="min-h-[180px] text-lg leading-relaxed resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
          />
        </div>
        {value && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              {words.length} words
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditMode(false);
                setShowControls(true);
              }}
              className="text-xs text-primary"
            >
              Preview teleprompter →
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Reader/teleprompter mode - Karaoke style
  return (
    <div className="relative w-full">
      {/* Main teleprompter display */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header with edit button */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Teleprompter
          </span>
          {!isRecording && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(true)}
              className="text-xs h-7"
            >
              Edit text
            </Button>
          )}
        </div>

        {/* Karaoke text display */}
        <div 
          ref={containerRef}
          className="min-h-[280px] px-6 py-8 cursor-pointer select-none"
          onClick={manualMode ? advanceWord : undefined}
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
                  index === currentWordIndex && (
                    // Active word styling - very obvious
                    "text-primary font-semibold scale-105 bg-primary/10"
                  ),
                  index < currentWordIndex && (
                    // Already read words - slightly muted
                    "text-muted-foreground/60"
                  ),
                  index > currentWordIndex && (
                    // Upcoming words - visible but dimmer
                    "text-foreground/80"
                  )
                )}
              >
                {word}
              </span>
            ))}
          </div>
          
          {/* Manual mode tap hint */}
          {manualMode && (
            <p className="text-xs text-center text-muted-foreground mt-6">
              Tap anywhere to advance
            </p>
          )}
        </div>

        {/* Progress indicator */}
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

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center justify-center gap-2 py-2 bg-destructive/10 border-t border-destructive/20">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium text-destructive">Recording</span>
          </div>
        )}
      </div>

      {/* Controls toolbar */}
      {showControls && (
        <div className="mt-4 bg-card rounded-xl border border-border p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Text size controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground min-w-[50px]">
              <Type className="w-4 h-4" />
              <span className="text-xs">Size</span>
            </div>
            <div className="flex items-center gap-1 flex-1 justify-center">
              {TEXT_SIZES.map((size, index) => (
                <button
                  key={size.label}
                  onClick={() => setTextSizeIndex(index)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-xs font-medium transition-colors",
                    index === textSizeIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pace controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground min-w-[50px]">
              <Gauge className="w-4 h-4" />
              <span className="text-xs">Pace</span>
            </div>
            <div className="flex-1 px-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                {PACE_PRESETS.map((pace, index) => (
                  <span 
                    key={pace.label}
                    className={cn(
                      "transition-colors",
                      index === paceIndex && "text-primary font-medium"
                    )}
                  >
                    {pace.label}
                  </span>
                ))}
              </div>
              <Slider
                value={[paceIndex]}
                onValueChange={handlePaceChange}
                max={PACE_PRESETS.length - 1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Play/Pause, Reset, and Manual mode controls */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {!manualMode && (
              <Button
                variant={isHighlighting ? "default" : "outline"}
                size="default"
                className="flex-1 max-w-[160px] touch-target"
                onClick={toggleHighlighting}
              >
                {isHighlighting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={resetHighlighting}
              className="h-10 w-10"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant={manualMode ? "default" : "outline"}
              size="icon"
              onClick={toggleManualMode}
              className="h-10 w-10"
              title={manualMode ? "Auto mode" : "Manual mode"}
            >
              <Hand className="w-4 h-4" />
            </Button>
          </div>

          {/* Helpful tip */}
          <p className="text-xs text-center text-muted-foreground">
            {manualMode 
              ? "Tap the text area to advance words manually"
              : isRecording 
                ? "Highlighting auto-advances while recording"
                : "Tap Start to begin highlighting"
            }
          </p>
        </div>
      )}

      {/* Word count */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {words.length} words
      </p>
    </div>
  );
}
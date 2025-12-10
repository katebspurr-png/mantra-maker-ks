import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Minus, 
  Plus, 
  Type, 
  Gauge 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeleprompterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isRecording?: boolean;
}

// Text size presets
const TEXT_SIZES = [
  { label: "S", value: 18, lineHeight: 1.6 },
  { label: "M", value: 24, lineHeight: 1.7 },
  { label: "L", value: 32, lineHeight: 1.8 },
  { label: "XL", value: 40, lineHeight: 1.9 },
];

// Scroll speed presets (pixels per second)
const SCROLL_SPEEDS = [
  { label: "Slow", value: 20 },
  { label: "Medium", value: 40 },
  { label: "Fast", value: 70 },
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
  const [scrollSpeedIndex, setScrollSpeedIndex] = useState(() => {
    const saved = sessionStorage.getItem("teleprompterScrollSpeed");
    return saved ? parseInt(saved, 10) : 1; // Default to Medium
  });
  const [isScrolling, setIsScrolling] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!value);
  const [showControls, setShowControls] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const currentTextSize = TEXT_SIZES[textSizeIndex];
  const currentScrollSpeed = SCROLL_SPEEDS[scrollSpeedIndex];

  // Persist settings to session storage
  useEffect(() => {
    sessionStorage.setItem("teleprompterTextSize", textSizeIndex.toString());
  }, [textSizeIndex]);

  useEffect(() => {
    sessionStorage.setItem("teleprompterScrollSpeed", scrollSpeedIndex.toString());
  }, [scrollSpeedIndex]);

  // Auto-scroll logic with smooth animation
  const scroll = useCallback((timestamp: number) => {
    if (!scrollContainerRef.current) return;
    
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = timestamp;
    
    const container = scrollContainerRef.current;
    const scrollAmount = currentScrollSpeed.value * deltaTime;
    
    if (container.scrollTop < container.scrollHeight - container.clientHeight) {
      container.scrollTop += scrollAmount;
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      // Reached the end, stop scrolling
      setIsScrolling(false);
    }
  }, [currentScrollSpeed.value]);

  // Start/stop scrolling
  useEffect(() => {
    if (isScrolling && !isEditMode) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScrolling, isEditMode, scroll]);

  // Stop scrolling when recording stops
  useEffect(() => {
    if (!isRecording && isScrolling) {
      setIsScrolling(false);
    }
  }, [isRecording, isScrolling]);

  // Switch to reader mode when there's text and recording starts
  useEffect(() => {
    if (isRecording && value.trim()) {
      setIsEditMode(false);
      setShowControls(true);
    }
  }, [isRecording, value]);

  const handleTextSizeChange = (direction: "up" | "down") => {
    setTextSizeIndex(prev => {
      if (direction === "up" && prev < TEXT_SIZES.length - 1) return prev + 1;
      if (direction === "down" && prev > 0) return prev - 1;
      return prev;
    });
  };

  const handleScrollSpeedChange = (values: number[]) => {
    setScrollSpeedIndex(values[0]);
  };

  const toggleScroll = () => {
    if (!isScrolling) {
      // Reset scroll position when starting
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
    setIsScrolling(!isScrolling);
  };

  const resetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsScrolling(false);
  };

  // Split text into lines for highlighting
  const lines = value.split('\n').filter(line => line.trim());

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
              {value.split(/\s+/).filter(Boolean).length} words
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

  // Reader/teleprompter mode
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

        {/* Scrolling text area with gradient overlays */}
        <div className="relative">
          {/* Top gradient fade */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
          
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
          
          {/* Center highlight line indicator */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[60px] bg-primary/5 border-y border-primary/20 z-0 pointer-events-none" />
          
          {/* Scrolling content */}
          <div
            ref={scrollContainerRef}
            className="h-[300px] overflow-y-auto scroll-smooth px-6 py-16"
            style={{ scrollBehavior: isScrolling ? "auto" : "smooth" }}
          >
            <div 
              className="text-center font-medium text-foreground"
              style={{ 
                fontSize: `${currentTextSize.value}px`,
                lineHeight: currentTextSize.lineHeight,
              }}
            >
              {lines.map((line, index) => (
                <p 
                  key={index}
                  className={cn(
                    "py-2 transition-opacity duration-300",
                    // Add subtle styling for better readability
                  )}
                >
                  {line}
                </p>
              ))}
              {/* Extra padding at the end for scrolling */}
              <div className="h-32" />
            </div>
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

      {/* Controls toolbar - always visible when in reader mode */}
      {showControls && (
        <div className="mt-4 bg-card rounded-xl border border-border p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Text size controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Type className="w-4 h-4" />
              <span className="text-xs">Size</span>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleTextSizeChange("down")}
                disabled={textSizeIndex === 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {TEXT_SIZES.map((size, index) => (
                  <button
                    key={size.label}
                    onClick={() => setTextSizeIndex(index)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                      index === textSizeIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleTextSizeChange("up")}
                disabled={textSizeIndex === TEXT_SIZES.length - 1}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scroll speed controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Gauge className="w-4 h-4" />
              <span className="text-xs">Speed</span>
            </div>
            <div className="flex-1 px-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                {SCROLL_SPEEDS.map((speed, index) => (
                  <span 
                    key={speed.label}
                    className={cn(
                      "transition-colors",
                      index === scrollSpeedIndex && "text-primary font-medium"
                    )}
                  >
                    {speed.label}
                  </span>
                ))}
              </div>
              <Slider
                value={[scrollSpeedIndex]}
                onValueChange={handleScrollSpeedChange}
                max={SCROLL_SPEEDS.length - 1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Play/Pause and Reset controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant={isScrolling ? "default" : "outline"}
              size="lg"
              className="flex-1 max-w-[200px] touch-target"
              onClick={toggleScroll}
            >
              {isScrolling ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Scroll
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Scroll
                </>
              )}
            </Button>
            {!isScrolling && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetScroll}
                className="text-muted-foreground"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Helpful tip */}
          <p className="text-xs text-center text-muted-foreground">
            {isRecording 
              ? "Scroll will pause when you stop recording"
              : "Tap Start Scroll when you begin recording"
            }
          </p>
        </div>
      )}

      {/* Word count */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {value.split(/\s+/).filter(Boolean).length} words
      </p>
    </div>
  );
}

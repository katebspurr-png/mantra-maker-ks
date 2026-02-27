import { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Pause, Repeat } from "lucide-react";
import { useImmersivePlayer } from "@/contexts/ImmersivePlayerContext";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";

const CONTROLS_TIMEOUT = 3000;
const LOOP_STORAGE_KEY = "immersive-loop-listened-";

export function ImmersivePlayer() {
  const { isOpen, recording, closeImmersive } = useImmersivePlayer();
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    source,
    playSingleRecording,
    togglePlayPause,
  } = useGlobalAudio();

  const [visible, setVisible] = useState(false); // controls fade state
  const [showControls, setShowControls] = useState(true);
  const [mounted, setMounted] = useState(false); // for fade transition
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const touchStartY = useRef<number | null>(null);

  // Mount/unmount with fade
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-start playback when opening
  useEffect(() => {
    if (!isOpen || !recording) return;

    const isAlreadyPlaying =
      source?.type === "single" && currentTrack?.id === recording.id;

    if (!isAlreadyPlaying) {
      // Check if user has listened before
      const hasListened = localStorage.getItem(LOOP_STORAGE_KEY + recording.id);
      const mode = hasListened ? (hasListened as "once" | "loop") : "loop";

      // Save that user has now listened
      if (!hasListened) {
        localStorage.setItem(LOOP_STORAGE_KEY + recording.id, "loop");
      }

      playSingleRecording(recording, {
        mode,
        repeatCount: 10,
        durationMinutes: 15,
      });
    }
  }, [isOpen, recording?.id]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), CONTROLS_TIMEOUT);
  }, []);

  useEffect(() => {
    if (isOpen) resetControlsTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isOpen]);

  // Swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const diff = e.changedTouches[0].clientY - touchStartY.current;
      if (diff > 100) closeImmersive();
      touchStartY.current = null;
    }
  };

  // Toggle loop
  const isLooping = (() => {
    if (!recording) return false;
    const stored = localStorage.getItem(LOOP_STORAGE_KEY + recording.id);
    return stored !== "once";
  })();

  const toggleLoop = () => {
    if (!recording) return;
    const newMode = isLooping ? "once" : "loop";
    localStorage.setItem(LOOP_STORAGE_KEY + recording.id, newMode);

    // Re-apply to current playback
    const isCurrentTrack =
      source?.type === "single" && currentTrack?.id === recording.id;
    if (isCurrentTrack) {
      playSingleRecording(recording, {
        mode: newMode,
        repeatCount: 10,
        durationMinutes: 15,
      });
    }
  };

  const isThisTrackPlaying =
    source?.type === "single" && currentTrack?.id === recording?.id && isPlaying;

  const handlePlayPause = () => {
    if (source?.type === "single" && currentTrack?.id === recording?.id) {
      togglePlayPause();
    } else if (recording) {
      const stored = localStorage.getItem(LOOP_STORAGE_KEY + recording.id);
      const mode = stored === "once" ? "once" : "loop";
      playSingleRecording(recording, { mode, repeatCount: 10, durationMinutes: 15 });
    }
    resetControlsTimer();
  };

  // Progress
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-[400ms] ease-in-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "hsl(160 8% 12%)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={resetControlsTimer}
    >
      {/* Breathing animation layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, hsl(160 6% 16% / 0.5), transparent 70%)",
          animation: "immersive-breathe 12s ease-in-out infinite",
        }}
      />

      {/* Close button */}
      <div
        className={`absolute top-[env(safe-area-inset-top,12px)] right-4 z-10 pt-3 transition-opacity duration-500 ${
          showControls ? "opacity-70" : "opacity-0"
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); closeImmersive(); }}
          className="p-2 rounded-full"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Affirmation text — centered */}
      <div className="flex-1 flex items-center justify-center px-8">
        <p
          className="text-center font-serif leading-[1.8] max-w-md"
          style={{
            fontSize: "clamp(24px, 6vw, 32px)",
            color: "hsl(0 0% 95%)",
            letterSpacing: "-0.01em",
          }}
        >
          {recording?.text
            ? `"${recording.text}"`
            : recording?.title || ""}
        </p>
      </div>

      {/* Controls */}
      <div
        className={`pb-[calc(env(safe-area-inset-bottom,20px)+20px)] px-8 transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress line */}
        <div className="w-full h-[2px] rounded-full bg-white/10 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: "hsl(0 0% 95% / 0.4)",
            }}
          />
        </div>

        {/* Play/Pause + Loop */}
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={(e) => { e.stopPropagation(); toggleLoop(); resetControlsTimer(); }}
            className={`p-2 rounded-full transition-colors ${
              isLooping ? "text-white/80" : "text-white/30"
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "hsl(0 0% 100% / 0.1)" }}
          >
            {isThisTrackPlaying ? (
              <Pause className="w-7 h-7 text-white/90" fill="currentColor" />
            ) : (
              <Play className="w-7 h-7 text-white/90 ml-1" fill="currentColor" />
            )}
          </button>

          {/* Spacer for symmetry */}
          <div className="w-9" />
        </div>
      </div>
    </div>
  );
}

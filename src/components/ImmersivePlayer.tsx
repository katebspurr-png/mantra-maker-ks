import { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Pause, Repeat, AudioLines } from "lucide-react";
import { useImmersivePlayer } from "@/contexts/ImmersivePlayerContext";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { ZEN_TRACKS } from "@/data/zenTracks";
import { Slider } from "@/components/ui/slider";

const CONTROLS_TIMEOUT = 3000;
const LOOP_STORAGE_KEY = "immersive-loop-listened-";
const AMBIENT_PREF_KEY = "immersive-ambient-pref";

interface AmbientPref {
  trackId: string | null; // null = none
  volume: number;
}

function loadAmbientPref(): AmbientPref {
  try {
    const stored = localStorage.getItem(AMBIENT_PREF_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { trackId: null, volume: 0.3 };
}

function saveAmbientPref(pref: AmbientPref) {
  localStorage.setItem(AMBIENT_PREF_KEY, JSON.stringify(pref));
}

// Simplified sound options for immersive mode
const AMBIENT_OPTIONS = [
  { id: null, label: "None" },
  ...ZEN_TRACKS.map(t => ({ id: t.id, label: t.title })),
];

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
    zenEnabled,
    zenTrackId,
    zenVolume,
    setZenEnabled,
    setZenTrackId,
    setZenVolume,
  } = useGlobalAudio();

  const [visible, setVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAmbientSheet, setShowAmbientSheet] = useState(false);
  const [textRevealed, setTextRevealed] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const touchStartY = useRef<number | null>(null);

  // Mount/unmount with fade
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTextRevealed(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      // Delay text reveal so it settles in after the background appears
      const textTimer = setTimeout(() => setTextRevealed(true), 300);
      return () => clearTimeout(textTimer);
    } else {
      setVisible(false);
      setTextRevealed(false);
      setShowAmbientSheet(false);
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-start playback + restore ambient pref when opening
  useEffect(() => {
    if (!isOpen || !recording) return;

    const isAlreadyPlaying =
      source?.type === "single" && currentTrack?.id === recording.id;

    if (!isAlreadyPlaying) {
      const hasListened = localStorage.getItem(LOOP_STORAGE_KEY + recording.id);
      const mode = hasListened ? (hasListened as "once" | "loop") : "loop";
      if (!hasListened) {
        localStorage.setItem(LOOP_STORAGE_KEY + recording.id, "loop");
      }
      playSingleRecording(recording, { mode, repeatCount: 10, durationMinutes: 15 });
    }

    // Restore ambient preference
    const pref = loadAmbientPref();
    if (pref.trackId) {
      setZenEnabled(true);
      setZenTrackId(pref.trackId);
      setZenVolume(pref.volume);
    } else {
      setZenEnabled(false);
    }
  }, [isOpen, recording?.id]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!showAmbientSheet) {
      hideTimer.current = setTimeout(() => setShowControls(false), CONTROLS_TIMEOUT);
    }
  }, [showAmbientSheet]);

  useEffect(() => {
    if (isOpen) resetControlsTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isOpen, showAmbientSheet]);

  // Keep controls visible while ambient sheet is open
  useEffect(() => {
    if (showAmbientSheet) {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else if (isOpen) {
      resetControlsTimer();
    }
  }, [showAmbientSheet]);

  // Swipe down to close (but not from ambient sheet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showAmbientSheet) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (showAmbientSheet) return;
    if (touchStartY.current !== null) {
      const diff = e.changedTouches[0].clientY - touchStartY.current;
      if (diff > 100) closeImmersive();
      touchStartY.current = null;
    }
  };

  // Loop toggle
  const isLooping = (() => {
    if (!recording) return false;
    const stored = localStorage.getItem(LOOP_STORAGE_KEY + recording.id);
    return stored !== "once";
  })();

  const toggleLoop = () => {
    if (!recording) return;
    const newMode = isLooping ? "once" : "loop";
    localStorage.setItem(LOOP_STORAGE_KEY + recording.id, newMode);
    const isCurrentTrack = source?.type === "single" && currentTrack?.id === recording.id;
    if (isCurrentTrack) {
      playSingleRecording(recording, { mode: newMode, repeatCount: 10, durationMinutes: 15 });
    }
  };

  // Ambient sound selection
  const currentAmbientId = zenEnabled ? zenTrackId : null;

  const selectAmbientTrack = (trackId: string | null) => {
    if (trackId) {
      setZenEnabled(true);
      setZenTrackId(trackId); // setZenTrackId now handles starting playback directly
      saveAmbientPref({ trackId, volume: zenVolume });
    } else {
      setZenEnabled(false);
      saveAmbientPref({ trackId: null, volume: zenVolume });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setZenVolume(vol);
    if (currentAmbientId) {
      saveAmbientPref({ trackId: currentAmbientId, volume: vol });
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
      onClick={() => {
        if (showAmbientSheet) {
          setShowAmbientSheet(false);
        } else {
          resetControlsTimer();
        }
      }}
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
            opacity: textRevealed ? 1 : 0,
            transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {recording?.text
            ? `"${recording.text}"`
            : recording?.title || ""}
        </p>
      </div>

      {/* Ambient Sound Bottom Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-out ${
          showAmbientSheet ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div
          className="mx-4 mb-[calc(env(safe-area-inset-bottom,20px)+100px)] rounded-2xl p-5"
          style={{ background: "hsl(160 6% 16% / 0.95)", backdropFilter: "blur(20px)" }}
        >
          <p className="text-[13px] text-white/40 mb-4 tracking-wide">Background Sound</p>

          <div className="space-y-1">
            {AMBIENT_OPTIONS.map((opt) => (
              <button
                key={opt.id ?? "none"}
                onClick={() => selectAmbientTrack(opt.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-[15px] transition-colors ${
                  currentAmbientId === opt.id
                    ? "text-white/90 bg-white/8"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Volume slider — only show when a track is selected */}
          {currentAmbientId && (
            <div className="mt-5 px-1">
              <p className="text-[12px] text-white/30 mb-2">Volume</p>
              <Slider
                value={[zenVolume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.05}
                className="[&_[role=slider]]:bg-white/60 [&_[role=slider]]:border-0 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_.bg-primary]:bg-white/30 [&_[data-orientation=horizontal]]:bg-white/10"
              />
            </div>
          )}
        </div>
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

        {/* Play/Pause + Loop + Ambient */}
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAmbientSheet(prev => !prev);
            }}
            className={`p-2 rounded-full transition-colors ${
              zenEnabled ? "text-white/80" : "text-white/30"
            }`}
          >
            <AudioLines className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

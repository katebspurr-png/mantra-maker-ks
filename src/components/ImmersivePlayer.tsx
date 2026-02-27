import { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Pause, Repeat, AudioLines } from "lucide-react";
import { useImmersivePlayer } from "@/contexts/ImmersivePlayerContext";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { ZEN_TRACKS } from "@/data/zenTracks";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const CONTROLS_TIMEOUT = 3000;
const LOOP_STORAGE_KEY = "immersive-loop-listened-";
const AMBIENT_PREF_KEY = "immersive-ambient-pref";
const DISPLAY_MODE_KEY = "immersive-display-mode";

type DisplayMode = "title_only" | "title_plus_text";

interface AmbientPref {
  trackId: string | null;
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
  const [textOpacity, setTextOpacity] = useState(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    try {
      const stored = localStorage.getItem(DISPLAY_MODE_KEY);
      if (stored === "title_only" || stored === "title_plus_text") return stored;
    } catch {}
    return "title_plus_text";
  });
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const touchStartY = useRef<number | null>(null);

  // Mount/unmount with fade
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTextOpacity(0); // Force opacity to 0 immediately
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      // After the browser has painted opacity:0, trigger fade to 1
      const fadeTimer = setTimeout(() => setTextOpacity(1), 50);
      return () => clearTimeout(fadeTimer);
    } else {
      setVisible(false);
      setTextOpacity(0);
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

  const currentAmbientId = zenEnabled ? zenTrackId : null;

  const selectAmbientTrack = (trackId: string | null) => {
    if (trackId) {
      setZenEnabled(true);
      setZenTrackId(trackId);
      saveAmbientPref({ trackId, volume: zenVolume });
    } else {
      setZenEnabled(false);
      saveAmbientPref({ trackId: null, volume: zenVolume });
    }
  };

  const handleDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem(DISPLAY_MODE_KEY, mode);
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

      {/* Affirmation text — visibility-driven fade */}
      <div className="flex-1 flex flex-col items-center justify-center px-8"
        style={{ opacity: textOpacity, transition: "opacity 900ms ease-out" }}
      >
        {displayMode === "title_plus_text" && recording?.text ? (
          <>
            {/* Title — small, subtle, above */}
            <p
              className="text-center font-serif max-w-md mb-6"
              style={{
                fontSize: "clamp(13px, 3vw, 15px)",
                color: "hsl(0 0% 95% / 0.4)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {recording.title}
            </p>
            {/* Affirmation text — primary focus */}
            <p
              className="text-center font-serif leading-[1.9] max-w-md"
              style={{
                fontSize: "clamp(22px, 5.5vw, 30px)",
                color: "hsl(0 0% 95%)",
                letterSpacing: "-0.01em",
              }}
            >
              "{recording.text}"
            </p>
          </>
        ) : (
          /* Title only */
          <p
            className="text-center font-serif leading-[1.8] max-w-md"
            style={{
              fontSize: "clamp(24px, 6vw, 32px)",
              color: "hsl(0 0% 95%)",
              letterSpacing: "-0.01em",
            }}
          >
            {recording?.title || ""}
          </p>
        )}
      </div>

      {/* C) iOS-style Bottom Sheet via vaul Drawer */}
      <Drawer
        open={showAmbientSheet}
        onOpenChange={setShowAmbientSheet}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className="border-0 focus:outline-none"
          style={{
            background: "hsl(160 6% 14% / 0.98)",
            backdropFilter: "blur(24px)",
            paddingBottom: "env(safe-area-inset-bottom, 20px)",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="px-5 pb-6 pt-2">
            <p className="text-[13px] text-white/40 mb-4 tracking-wide">Background Sound</p>

            <div className="space-y-1">
              {AMBIENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id ?? "none"}
                  onClick={() => selectAmbientTrack(opt.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[15px] transition-colors ${
                    currentAmbientId === opt.id
                      ? "text-white/90 bg-white/[0.08]"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Volume slider */}
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

            {/* Display preference */}
            <div className="mt-6 pt-4" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}>
              <p className="text-[13px] text-white/40 mb-3 tracking-wide">Show words while listening</p>
              <div className="space-y-1">
                {([
                  { value: "title_plus_text" as DisplayMode, label: "Title + affirmation text" },
                  { value: "title_only" as DisplayMode, label: "Title only" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleDisplayMode(opt.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[15px] transition-colors flex items-center gap-3 ${
                      displayMode === opt.value
                        ? "text-white/90 bg-white/[0.08]"
                        : "text-white/50 hover:text-white/70"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: displayMode === opt.value ? "hsl(0 0% 95% / 0.6)" : "hsl(0 0% 95% / 0.2)",
                      }}
                    >
                      {displayMode === opt.value && (
                        <span className="w-2 h-2 rounded-full" style={{ background: "hsl(0 0% 95% / 0.8)" }} />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Controls */}
      <div
        className={`pb-[calc(env(safe-area-inset-bottom,20px)+20px)] px-8 transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* B) Progress — subtle gradient fade instead of hard line */}
        <div className="w-full h-[3px] rounded-full mb-8 overflow-hidden" style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 95% / 0.08), transparent)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(0 0% 95% / 0.15), hsl(0 0% 95% / 0.35))",
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

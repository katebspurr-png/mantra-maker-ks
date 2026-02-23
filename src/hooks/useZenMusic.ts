import { useState, useRef, useCallback, useEffect } from "react";
import { ZEN_TRACKS, ZenTrack } from "@/data/zenTracks";

const ZEN_STORAGE_KEY = "zen-music-settings";
const DEFAULT_VOLUME = 0.3;

interface ZenMusicSettings {
  enabled: boolean;
  trackId: string;
  volume: number;
}

function loadSettings(): ZenMusicSettings {
  try {
    const stored = localStorage.getItem(ZEN_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, trackId: ZEN_TRACKS[0]?.id || "", volume: DEFAULT_VOLUME };
}

function saveSettings(settings: ZenMusicSettings) {
  localStorage.setItem(ZEN_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * useZenMusic - Manages a separate audio element for zen background music.
 * 
 * Plays alongside the main recording audio via GlobalAudioContext.
 * Loops automatically and persists user preferences to localStorage.
 */
export function useZenMusic() {
  const [settings, setSettingsState] = useState<ZenMusicSettings>(loadSettings);
  const [isZenPlaying, setIsZenPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = settings.volume;
      audioRef.current = audio;

      audio.addEventListener("play", () => setIsZenPlaying(true));
      audio.addEventListener("pause", () => setIsZenPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);

  const updateSettings = useCallback((updates: Partial<ZenMusicSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const getTrack = useCallback((): ZenTrack | undefined => {
    return ZEN_TRACKS.find(t => t.id === settings.trackId) || ZEN_TRACKS[0];
  }, [settings.trackId]);

  /**
   * Start zen music. Call when main audio starts playing.
   */
  const startZen = useCallback(() => {
    if (!settings.enabled) return;
    const track = getTrack();
    if (!track || !audioRef.current) return;

    const audio = audioRef.current;
    if (audio.src !== track.url) {
      audio.src = track.url;
      audio.load();
    }
    audio.play().catch(err => console.warn("Zen music play failed:", err));
  }, [settings.enabled, getTrack]);

  /**
   * Pause zen music. Call when main audio pauses.
   */
  const pauseZen = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  /**
   * Stop zen music fully. Call when main audio stops.
   */
  const stopZen = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    updateSettings({ enabled });
    if (!enabled) {
      stopZen();
    }
  }, [updateSettings, stopZen]);

  const setVolume = useCallback((volume: number) => {
    updateSettings({ volume: Math.max(0, Math.min(1, volume)) });
  }, [updateSettings]);

  const setTrackId = useCallback((trackId: string) => {
    updateSettings({ trackId });
    // If currently playing, switch track
    if (audioRef.current && isZenPlaying) {
      const track = ZEN_TRACKS.find(t => t.id === trackId);
      if (track) {
        audioRef.current.src = track.url;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
  }, [updateSettings, isZenPlaying]);

  return {
    enabled: settings.enabled,
    volume: settings.volume,
    trackId: settings.trackId,
    currentTrack: getTrack(),
    isZenPlaying,
    tracks: ZEN_TRACKS,
    setEnabled,
    setVolume,
    setTrackId,
    startZen,
    pauseZen,
    stopZen,
  };
}

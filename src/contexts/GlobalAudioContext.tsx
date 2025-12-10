import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recording, LoopMode } from "@/types";

/**
 * Global Audio Context
 * 
 * Provides centralized audio playback that persists across route changes.
 * Both single-recording and playlist playback use this same engine.
 * 
 * PWA COMPATIBILITY:
 * - Uses a single persistent audio element
 * - play() must be called from user gesture for first track
 * - Subsequent tracks can be started from 'ended' event
 */

interface PlaybackSource {
  type: "single" | "playlist";
  id: string; // recording ID or playlist ID
  title: string;
}

interface GlobalAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrack: Recording | null;
  currentTrackIndex: number;
  source: PlaybackSource | null;
  loopMode: LoopMode;
  // Playlist-specific
  playlist: Recording[];
  playlistSettings: {
    shuffle: boolean;
    loopPlaylist: boolean;
    delaySeconds: number;
  };
}

interface GlobalAudioContextType extends GlobalAudioState {
  // Single recording playback
  playSingleRecording: (recording: Recording, loopMode: LoopMode) => Promise<void>;
  
  // Playlist playback
  playPlaylist: (recordings: Recording[], settings: {
    shuffle?: boolean;
    loopPlaylist?: boolean;
    delaySeconds?: number;
    playlistId: string;
    playlistTitle: string;
  }) => Promise<void>;
  
  // Common controls
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setLoopMode: (mode: LoopMode) => void;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | null>(null);

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Recording | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [source, setSource] = useState<PlaybackSource | null>(null);
  const [loopMode, setLoopModeState] = useState<LoopMode>("once");
  const [playlist, setPlaylist] = useState<Recording[]>([]);
  const [playlistSettings, setPlaylistSettings] = useState({
    shuffle: false,
    loopPlaylist: false,
    delaySeconds: 0,
  });

  // Track loops for three_times mode
  const loopsCompletedRef = useRef(0);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playOrderRef = useRef<number[]>([]);
  
  // Single persistent audio element - PWA compatible
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      handleTrackEnded();
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const getAudioUrl = async (recording: Recording): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from("recordings")
        .createSignedUrl(recording.audio_file_path, 3600);
      
      if (error) {
        console.error("Error getting signed URL:", error);
        return null;
      }
      return data.signedUrl;
    } catch (error) {
      console.error("Error getting audio URL:", error);
      return null;
    }
  };

  const generatePlayOrder = useCallback((length: number, shuffle: boolean) => {
    const indices = Array.from({ length }, (_, i) => i);
    if (shuffle) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }
    return indices;
  }, []);

  const playTrackAtIndex = useCallback(async (recordings: Recording[], index: number): Promise<boolean> => {
    if (index < 0 || index >= recordings.length) return false;
    
    const recording = recordings[index];
    const audioUrl = await getAudioUrl(recording);
    if (!audioUrl || !audioRef.current) return false;
    
    const audio = audioRef.current;
    audio.src = audioUrl;
    audio.load();
    
    try {
      await audio.play();
      setCurrentTrack(recording);
      setCurrentTrackIndex(index);
      setDuration(recording.duration_seconds);
      setCurrentTime(0);
      return true;
    } catch (error) {
      console.error("Error playing audio:", error);
      return false;
    }
  }, []);

  const handleTrackEnded = useCallback(() => {
    if (!source) return;
    
    if (source.type === "single") {
      // Handle single recording loop modes
      if (loopMode === "once") {
        setIsPlaying(false);
        setCurrentTime(0);
      } else if (loopMode === "three_times") {
        loopsCompletedRef.current += 1;
        if (loopsCompletedRef.current >= 3) {
          setIsPlaying(false);
          setCurrentTime(0);
          loopsCompletedRef.current = 0;
        } else {
          audioRef.current?.play();
        }
      } else if (loopMode === "infinite") {
        audioRef.current?.play();
      }
    } else {
      // Handle playlist sequential playback
      const currentOrderIndex = playOrderRef.current.indexOf(currentTrackIndex);
      const nextOrderIndex = currentOrderIndex + 1;
      
      if (nextOrderIndex < playOrderRef.current.length) {
        const nextIndex = playOrderRef.current[nextOrderIndex];
        if (playlistSettings.delaySeconds > 0) {
          delayTimeoutRef.current = setTimeout(() => {
            playTrackAtIndex(playlist, nextIndex);
          }, playlistSettings.delaySeconds * 1000);
        } else {
          playTrackAtIndex(playlist, nextIndex);
        }
      } else if (playlistSettings.loopPlaylist) {
        playOrderRef.current = generatePlayOrder(playlist.length, playlistSettings.shuffle);
        const firstIndex = playOrderRef.current[0];
        if (playlistSettings.delaySeconds > 0) {
          delayTimeoutRef.current = setTimeout(() => {
            playTrackAtIndex(playlist, firstIndex);
          }, playlistSettings.delaySeconds * 1000);
        } else {
          playTrackAtIndex(playlist, firstIndex);
        }
      } else {
        // Playlist finished
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentTrackIndex(0);
      }
    }
  }, [source, loopMode, currentTrackIndex, playlist, playlistSettings, playTrackAtIndex, generatePlayOrder]);

  // Update ended handler when dependencies change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handler = () => handleTrackEnded();
    audio.removeEventListener("ended", handler);
    audio.addEventListener("ended", handler);
    
    return () => audio.removeEventListener("ended", handler);
  }, [handleTrackEnded]);

  /**
   * Play a single recording with specified loop mode.
   * Called from user gesture (button click) for PWA compatibility.
   */
  const playSingleRecording = useCallback(async (recording: Recording, mode: LoopMode) => {
    // Clear any playlist state
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    
    setSource({ type: "single", id: recording.id, title: recording.title });
    setPlaylist([]);
    setLoopModeState(mode);
    loopsCompletedRef.current = 0;
    
    await playTrackAtIndex([recording], 0);
  }, [playTrackAtIndex]);

  /**
   * Play a playlist of recordings.
   * Called from user gesture (button click) for PWA compatibility.
   */
  const playPlaylist = useCallback(async (
    recordings: Recording[],
    settings: {
      shuffle?: boolean;
      loopPlaylist?: boolean;
      delaySeconds?: number;
      playlistId: string;
      playlistTitle: string;
    }
  ) => {
    if (recordings.length === 0) return;
    
    // Clear any existing timeouts
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    
    const newSettings = {
      shuffle: settings.shuffle ?? false,
      loopPlaylist: settings.loopPlaylist ?? false,
      delaySeconds: settings.delaySeconds ?? 0,
    };
    
    setSource({ type: "playlist", id: settings.playlistId, title: settings.playlistTitle });
    setPlaylist(recordings);
    setPlaylistSettings(newSettings);
    setLoopModeState("once"); // In playlist mode, individual loop is ignored
    
    playOrderRef.current = generatePlayOrder(recordings.length, newSettings.shuffle);
    const startIndex = playOrderRef.current[0];
    
    await playTrackAtIndex(recordings, startIndex);
  }, [playTrackAtIndex, generatePlayOrder]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrack(null);
    setSource(null);
    setPlaylist([]);
    loopsCompletedRef.current = 0;
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setLoopMode = useCallback((mode: LoopMode) => {
    setLoopModeState(mode);
    loopsCompletedRef.current = 0;
  }, []);

  const value: GlobalAudioContextType = {
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    currentTrackIndex,
    source,
    loopMode,
    playlist,
    playlistSettings,
    playSingleRecording,
    playPlaylist,
    play,
    pause,
    togglePlayPause,
    stop,
    seek,
    setLoopMode,
  };

  return (
    <GlobalAudioContext.Provider value={value}>
      {children}
    </GlobalAudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error("useGlobalAudio must be used within a GlobalAudioProvider");
  }
  return context;
}

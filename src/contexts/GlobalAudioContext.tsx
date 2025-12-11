import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recording, LoopMode, PlaybackSettings, PlaybackMode, DEFAULT_PLAYBACK_SETTINGS } from "@/types";

/**
 * Global Audio Context
 * 
 * Provides centralized audio playback that persists across route changes.
 * Supports four playback modes:
 * - Once: Play one time, then stop
 * - Loop: Repeat continuously until stopped
 * - Repeat: Play exactly N times
 * - Duration: Play for a set amount of time
 * 
 * PWA COMPATIBILITY:
 * - Uses a single persistent audio element
 * - play() must be called from user gesture for first track
 * - Subsequent tracks can be started from 'ended' event
 */

interface PlaybackSource {
  type: "single" | "playlist";
  id: string;
  title: string;
}

interface PlaybackStatus {
  mode: PlaybackMode;
  // For repeat mode
  currentRepetition: number;
  totalRepetitions: number;
  // For duration mode
  elapsedSeconds: number;
  totalDurationSeconds: number;
  // For playlist tracking
  currentTrackNumber: number;
  totalTracks: number;
}

interface GlobalAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrack: Recording | null;
  currentTrackIndex: number;
  source: PlaybackSource | null;
  loopMode: LoopMode;
  playbackSettings: PlaybackSettings;
  playbackStatus: PlaybackStatus;
  // Playlist-specific
  playlist: Recording[];
  playlistSettings: {
    shuffle: boolean;
    delaySeconds: number;
  };
}

interface GlobalAudioContextType extends GlobalAudioState {
  // Single recording playback
  playSingleRecording: (recording: Recording, settings: PlaybackSettings) => Promise<void>;
  
  // Playlist playback
  playPlaylist: (recordings: Recording[], settings: {
    shuffle?: boolean;
    delaySeconds?: number;
    playlistId: string;
    playlistTitle: string;
    playbackSettings: PlaybackSettings;
  }) => Promise<void>;
  
  // Common controls
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setLoopMode: (mode: LoopMode) => void;
  updatePlaybackSettings: (settings: PlaybackSettings) => void;
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
    delaySeconds: 0,
  });
  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>(DEFAULT_PLAYBACK_SETTINGS);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    mode: "loop",
    currentRepetition: 1,
    totalRepetitions: 1,
    elapsedSeconds: 0,
    totalDurationSeconds: 0,
    currentTrackNumber: 1,
    totalTracks: 1,
  });

  // Refs for tracking
  const repetitionCountRef = useRef(0);
  const playlistRepetitionRef = useRef(0);
  const durationStartTimeRef = useRef<number | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Duration timer - tracks elapsed time for duration mode
  useEffect(() => {
    if (isPlaying && playbackSettings.mode === "duration" && durationStartTimeRef.current) {
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - durationStartTimeRef.current!) / 1000);
        const totalSeconds = playbackSettings.durationMinutes * 60;
        
        setPlaybackStatus(prev => ({
          ...prev,
          elapsedSeconds: elapsed,
          totalDurationSeconds: totalSeconds,
        }));
        
        if (elapsed >= totalSeconds) {
          // Duration reached, stop playback
          stopPlayback();
        }
      }, 1000);
    }
    
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [isPlaying, playbackSettings.mode, playbackSettings.durationMinutes]);

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

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrack(null);
    setSource(null);
    setPlaylist([]);
    repetitionCountRef.current = 0;
    playlistRepetitionRef.current = 0;
    durationStartTimeRef.current = null;
    setPlaybackStatus({
      mode: playbackSettings.mode,
      currentRepetition: 1,
      totalRepetitions: 1,
      elapsedSeconds: 0,
      totalDurationSeconds: 0,
      currentTrackNumber: 1,
      totalTracks: 1,
    });
  }, [playbackSettings.mode]);

  const handleTrackEnded = useCallback(() => {
    if (!source) return;
    
    const settings = playbackSettings;
    
    if (source.type === "single") {
      // Single recording playback
      repetitionCountRef.current += 1;
      
      switch (settings.mode) {
        case "once":
          stopPlayback();
          break;
          
        case "loop":
          audioRef.current?.play();
          break;
          
        case "repeat":
          if (repetitionCountRef.current >= settings.repeatCount) {
            stopPlayback();
          } else {
            setPlaybackStatus(prev => ({
              ...prev,
              currentRepetition: repetitionCountRef.current + 1,
            }));
            audioRef.current?.play();
          }
          break;
          
        case "duration":
          // Duration mode continues until time runs out
          audioRef.current?.play();
          break;
      }
    } else {
      // Playlist playback
      const currentOrderIndex = playOrderRef.current.indexOf(currentTrackIndex);
      const nextOrderIndex = currentOrderIndex + 1;
      
      if (nextOrderIndex < playOrderRef.current.length) {
        // Play next track in playlist
        const nextIndex = playOrderRef.current[nextOrderIndex];
        setPlaybackStatus(prev => ({
          ...prev,
          currentTrackNumber: nextOrderIndex + 1,
        }));
        
        if (playlistSettings.delaySeconds > 0) {
          delayTimeoutRef.current = setTimeout(() => {
            playTrackAtIndex(playlist, nextIndex);
          }, playlistSettings.delaySeconds * 1000);
        } else {
          playTrackAtIndex(playlist, nextIndex);
        }
      } else {
        // End of playlist - handle based on mode
        playlistRepetitionRef.current += 1;
        
        switch (settings.mode) {
          case "once":
            stopPlayback();
            break;
            
          case "loop":
            // Restart playlist
            playOrderRef.current = generatePlayOrder(playlist.length, playlistSettings.shuffle);
            setPlaybackStatus(prev => ({
              ...prev,
              currentTrackNumber: 1,
            }));
            const firstIndexLoop = playOrderRef.current[0];
            if (playlistSettings.delaySeconds > 0) {
              delayTimeoutRef.current = setTimeout(() => {
                playTrackAtIndex(playlist, firstIndexLoop);
              }, playlistSettings.delaySeconds * 1000);
            } else {
              playTrackAtIndex(playlist, firstIndexLoop);
            }
            break;
            
          case "repeat":
            if (playlistRepetitionRef.current >= settings.repeatCount) {
              stopPlayback();
            } else {
              playOrderRef.current = generatePlayOrder(playlist.length, playlistSettings.shuffle);
              setPlaybackStatus(prev => ({
                ...prev,
                currentRepetition: playlistRepetitionRef.current + 1,
                currentTrackNumber: 1,
              }));
              const firstIndexRepeat = playOrderRef.current[0];
              if (playlistSettings.delaySeconds > 0) {
                delayTimeoutRef.current = setTimeout(() => {
                  playTrackAtIndex(playlist, firstIndexRepeat);
                }, playlistSettings.delaySeconds * 1000);
              } else {
                playTrackAtIndex(playlist, firstIndexRepeat);
              }
            }
            break;
            
          case "duration":
            // Duration mode continues until time runs out
            playOrderRef.current = generatePlayOrder(playlist.length, playlistSettings.shuffle);
            setPlaybackStatus(prev => ({
              ...prev,
              currentTrackNumber: 1,
            }));
            const firstIndexDuration = playOrderRef.current[0];
            if (playlistSettings.delaySeconds > 0) {
              delayTimeoutRef.current = setTimeout(() => {
                playTrackAtIndex(playlist, firstIndexDuration);
              }, playlistSettings.delaySeconds * 1000);
            } else {
              playTrackAtIndex(playlist, firstIndexDuration);
            }
            break;
        }
      }
    }
  }, [source, playbackSettings, currentTrackIndex, playlist, playlistSettings, playTrackAtIndex, generatePlayOrder, stopPlayback]);

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
   * Play a single recording with specified playback settings.
   */
  const playSingleRecording = useCallback(async (recording: Recording, settings: PlaybackSettings) => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    setSource({ type: "single", id: recording.id, title: recording.title });
    setPlaylist([]);
    setPlaybackSettings(settings);
    repetitionCountRef.current = 0;
    
    // Initialize duration tracking
    if (settings.mode === "duration") {
      durationStartTimeRef.current = Date.now();
    }
    
    // Set initial status
    setPlaybackStatus({
      mode: settings.mode,
      currentRepetition: 1,
      totalRepetitions: settings.mode === "repeat" ? settings.repeatCount : 1,
      elapsedSeconds: 0,
      totalDurationSeconds: settings.mode === "duration" ? settings.durationMinutes * 60 : 0,
      currentTrackNumber: 1,
      totalTracks: 1,
    });
    
    await playTrackAtIndex([recording], 0);
  }, [playTrackAtIndex]);

  /**
   * Play a playlist of recordings.
   */
  const playPlaylist = useCallback(async (
    recordings: Recording[],
    settings: {
      shuffle?: boolean;
      delaySeconds?: number;
      playlistId: string;
      playlistTitle: string;
      playbackSettings: PlaybackSettings;
    }
  ) => {
    if (recordings.length === 0) return;
    
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    const newSettings = {
      shuffle: settings.shuffle ?? false,
      delaySeconds: settings.delaySeconds ?? 0,
    };
    
    setSource({ type: "playlist", id: settings.playlistId, title: settings.playlistTitle });
    setPlaylist(recordings);
    setPlaylistSettings(newSettings);
    setPlaybackSettings(settings.playbackSettings);
    playlistRepetitionRef.current = 0;
    
    // Initialize duration tracking
    if (settings.playbackSettings.mode === "duration") {
      durationStartTimeRef.current = Date.now();
    }
    
    // Set initial status
    setPlaybackStatus({
      mode: settings.playbackSettings.mode,
      currentRepetition: 1,
      totalRepetitions: settings.playbackSettings.mode === "repeat" ? settings.playbackSettings.repeatCount : 1,
      elapsedSeconds: 0,
      totalDurationSeconds: settings.playbackSettings.mode === "duration" ? settings.playbackSettings.durationMinutes * 60 : 0,
      currentTrackNumber: 1,
      totalTracks: recordings.length,
    });
    
    playOrderRef.current = generatePlayOrder(recordings.length, newSettings.shuffle);
    const startIndex = playOrderRef.current[0];
    
    await playTrackAtIndex(recordings, startIndex);
  }, [playTrackAtIndex, generatePlayOrder]);

  const play = useCallback(() => {
    if (playbackSettings.mode === "duration" && !durationStartTimeRef.current) {
      durationStartTimeRef.current = Date.now();
    }
    audioRef.current?.play();
  }, [playbackSettings.mode]);

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
    stopPlayback();
  }, [stopPlayback]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setLoopMode = useCallback((mode: LoopMode) => {
    setLoopModeState(mode);
    repetitionCountRef.current = 0;
  }, []);

  const updatePlaybackSettings = useCallback((settings: PlaybackSettings) => {
    setPlaybackSettings(settings);
    setPlaybackStatus(prev => ({
      ...prev,
      mode: settings.mode,
      totalRepetitions: settings.mode === "repeat" ? settings.repeatCount : 1,
      totalDurationSeconds: settings.mode === "duration" ? settings.durationMinutes * 60 : 0,
    }));
  }, []);

  const value: GlobalAudioContextType = {
    isPlaying,
    currentTime,
    duration,
    currentTrack,
    currentTrackIndex,
    source,
    loopMode,
    playbackSettings,
    playbackStatus,
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
    updatePlaybackSettings,
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

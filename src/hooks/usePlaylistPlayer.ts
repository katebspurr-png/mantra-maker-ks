import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";

/**
 * Playlist Player Hook
 * 
 * Handles sequential playback of recordings in a playlist.
 * In playlist mode, each track plays once in order; per-recording loop_mode is ignored.
 * 
 * PWA AUDIO COMPATIBILITY:
 * Mobile browsers and PWAs require audio.play() to be called directly within a user gesture
 * (click/tap) handler - not in a useEffect or async callback chain. This hook ensures:
 * 1. The first track is played IMMEDIATELY in the play() function (called from button click)
 * 2. Subsequent tracks are played from the 'ended' event, which is allowed after initial gesture
 * 3. A single persistent audio element is reused to maintain the audio context
 * 
 * Flow:
 * 1. User clicks play -> immediately fetches URL and plays first recording (same call stack)
 * 2. When a recording ends -> wait for delay -> load and play next recording
 * 3. When last recording ends -> stop (or loop if loop_playlist is enabled)
 */

interface UsePlaylistPlayerProps {
  recordings: Recording[];
  shuffle?: boolean;
  loopPlaylist?: boolean;
  delaySeconds?: number;
}

interface UsePlaylistPlayerReturn {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTrackId: string | null;
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  playTrack: (index: number) => Promise<void>;
}

export function usePlaylistPlayer({
  recordings,
  shuffle = false,
  loopPlaylist = false,
  delaySeconds = 0,
}: UsePlaylistPlayerProps): UsePlaylistPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  // Use a persistent audio element to maintain audio context across tracks
  // This is important for PWA compatibility - reusing the same element
  // that was "unlocked" by the initial user gesture
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playOrderRef = useRef<number[]>([]);
  const currentIndexRef = useRef(0);

  // Generate play order (shuffled or sequential)
  const generatePlayOrder = useCallback(() => {
    const indices = recordings.map((_, i) => i);
    if (shuffle) {
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }
    return indices;
  }, [recordings.length, shuffle]);

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

  // Play a specific track by its index in the recordings array
  const playTrackAtIndex = useCallback(async (index: number): Promise<boolean> => {
    if (index < 0 || index >= recordings.length) {
      return false;
    }

    const recording = recordings[index];
    if (!recording) return false;

    const audioUrl = await getAudioUrl(recording);
    if (!audioUrl) {
      console.error("Failed to get audio URL for recording:", recording.id);
      return false;
    }

    // Create audio element if it doesn't exist, or reuse existing one
    // Reusing the same element helps maintain "user gesture" permission on mobile
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    
    // Remove old event listeners
    audio.onended = null;
    
    // Set new source and play
    audio.src = audioUrl;
    audio.load();

    // Set up ended handler for auto-advance
    audio.onended = () => {
      handleTrackEnded();
    };

    try {
      await audio.play();
      currentIndexRef.current = index;
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      return true;
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      return false;
    }
  }, [recordings]);

  const handleTrackEnded = useCallback(() => {
    const currentOrderIndex = playOrderRef.current.indexOf(currentIndexRef.current);
    const nextOrderIndex = currentOrderIndex + 1;

    if (nextOrderIndex < playOrderRef.current.length) {
      // Play next track after delay
      const nextIndex = playOrderRef.current[nextOrderIndex];
      if (delaySeconds > 0) {
        delayTimeoutRef.current = setTimeout(() => {
          playTrackAtIndex(nextIndex);
        }, delaySeconds * 1000);
      } else {
        playTrackAtIndex(nextIndex);
      }
    } else if (loopPlaylist) {
      // Loop back to start
      playOrderRef.current = generatePlayOrder();
      const firstIndex = playOrderRef.current[0];
      if (delaySeconds > 0) {
        delayTimeoutRef.current = setTimeout(() => {
          playTrackAtIndex(firstIndex);
        }, delaySeconds * 1000);
      } else {
        playTrackAtIndex(firstIndex);
      }
    } else {
      // Playlist finished
      setIsPlaying(false);
      setCurrentTrackIndex(0);
      currentIndexRef.current = 0;
    }
  }, [delaySeconds, loopPlaylist, generatePlayOrder, playTrackAtIndex]);

  /**
   * Start playlist playback.
   * IMPORTANT FOR PWA: This function is called directly from the button click handler.
   * The audio.play() call happens within the same promise chain as the user gesture,
   * which is required for mobile browsers and PWAs to allow audio playback.
   */
  const play = useCallback(async () => {
    if (recordings.length === 0) return;
    
    // Generate fresh play order
    playOrderRef.current = generatePlayOrder();
    
    // Determine starting index
    const startIndex = playOrderRef.current[0];
    
    // Play immediately - this maintains the user gesture chain for PWA compatibility
    await playTrackAtIndex(startIndex);
  }, [recordings.length, generatePlayOrder, playTrackAtIndex]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    setIsPlaying(false);
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
      audioRef.current.src = "";
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    currentIndexRef.current = 0;
    playOrderRef.current = generatePlayOrder();
  }, [generatePlayOrder]);

  const playTrack = useCallback(async (index: number) => {
    if (index < 0 || index >= recordings.length) return;
    
    // Update play order to start from this track
    playOrderRef.current = generatePlayOrder();
    const orderIndex = playOrderRef.current.indexOf(index);
    if (orderIndex > 0) {
      // Rotate the order so the selected track is first
      playOrderRef.current = [
        ...playOrderRef.current.slice(orderIndex),
        ...playOrderRef.current.slice(0, orderIndex)
      ];
    }
    
    await playTrackAtIndex(index);
  }, [recordings.length, generatePlayOrder, playTrackAtIndex]);

  return {
    isPlaying,
    currentTrackIndex,
    currentTrackId: recordings[currentTrackIndex]?.id || null,
    play,
    pause,
    togglePlayPause,
    stop,
    playTrack,
  };
}

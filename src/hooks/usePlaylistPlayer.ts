import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";

/**
 * Playlist Player Hook
 * 
 * Handles sequential playback of recordings in a playlist.
 * In playlist mode, each track plays once in order; per-recording loop_mode is ignored.
 * 
 * Flow:
 * 1. User clicks play -> starts playing first recording
 * 2. When a recording ends -> wait for delay -> play next recording
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
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  playTrack: (index: number) => void;
}

export function usePlaylistPlayer({
  recordings,
  shuffle = false,
  loopPlaylist = false,
  delaySeconds = 0,
}: UsePlaylistPlayerProps): UsePlaylistPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playOrder, setPlayOrder] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [recordings, shuffle]);

  // Initialize play order
  useEffect(() => {
    setPlayOrder(generatePlayOrder());
  }, [generatePlayOrder]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
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

  const playNextTrack = useCallback(() => {
    const currentOrderIndex = playOrder.indexOf(currentTrackIndex);
    const nextOrderIndex = currentOrderIndex + 1;

    if (nextOrderIndex < playOrder.length) {
      // Play next track after delay
      if (delaySeconds > 0) {
        delayTimeoutRef.current = setTimeout(() => {
          setCurrentTrackIndex(playOrder[nextOrderIndex]);
        }, delaySeconds * 1000);
      } else {
        setCurrentTrackIndex(playOrder[nextOrderIndex]);
      }
    } else if (loopPlaylist) {
      // Loop back to start
      const newOrder = generatePlayOrder();
      setPlayOrder(newOrder);
      if (delaySeconds > 0) {
        delayTimeoutRef.current = setTimeout(() => {
          setCurrentTrackIndex(newOrder[0]);
        }, delaySeconds * 1000);
      } else {
        setCurrentTrackIndex(newOrder[0]);
      }
    } else {
      // Playlist finished
      setIsPlaying(false);
      setCurrentTrackIndex(0);
    }
  }, [currentTrackIndex, playOrder, loopPlaylist, delaySeconds, generatePlayOrder]);

  // Play current track when index changes or playback starts
  useEffect(() => {
    if (!isPlaying || recordings.length === 0) return;

    const recording = recordings[currentTrackIndex];
    if (!recording) return;

    const playCurrentTrack = async () => {
      const audioUrl = await getAudioUrl(recording);
      if (!audioUrl) {
        console.error("Failed to get audio URL for recording:", recording.id);
        playNextTrack();
        return;
      }

      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", playNextTrack);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("ended", playNextTrack);
      
      try {
        await audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      }
    };

    playCurrentTrack();
  }, [isPlaying, currentTrackIndex, recordings]);

  const play = useCallback(() => {
    if (recordings.length === 0) return;
    
    // If we're at the end and not playing, restart from beginning
    if (!isPlaying && currentTrackIndex >= recordings.length) {
      const newOrder = generatePlayOrder();
      setPlayOrder(newOrder);
      setCurrentTrackIndex(newOrder[0]);
    }
    
    setIsPlaying(true);
  }, [recordings.length, isPlaying, currentTrackIndex, generatePlayOrder]);

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
      audioRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    setPlayOrder(generatePlayOrder());
  }, [generatePlayOrder]);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= recordings.length) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, [recordings.length]);

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

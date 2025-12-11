import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get actual audio duration from file when database shows 0.
 * Falls back to stored duration if available.
 */
export const useAudioDuration = (
  storedDuration: number,
  audioFilePath: string | null
): number => {
  const [duration, setDuration] = useState(storedDuration);

  useEffect(() => {
    // If we already have a valid duration, use it
    if (storedDuration > 0) {
      setDuration(storedDuration);
      return;
    }

    // If no file path, can't load
    if (!audioFilePath) return;

    const loadDuration = async () => {
      try {
        const { data } = await supabase.storage
          .from("recordings")
          .createSignedUrl(audioFilePath, 60);

        if (!data?.signedUrl) return;

        const audio = new Audio();
        audio.preload = "metadata";
        
        audio.onloadedmetadata = () => {
          if (audio.duration && isFinite(audio.duration)) {
            setDuration(Math.round(audio.duration));
          }
        };
        
        audio.src = data.signedUrl;
      } catch (error) {
        console.error("Failed to load audio duration:", error);
      }
    };

    loadDuration();
  }, [storedDuration, audioFilePath]);

  return duration;
};

/**
 * Hook to batch load durations for multiple recordings
 */
export const useRecordingDurations = (
  recordings: Array<{ id: string; duration_seconds: number; audio_file_path: string }>
): Map<string, number> => {
  const [durations, setDurations] = useState<Map<string, number>>(new Map());
  const loadingRef = useRef<Set<string>>(new Set());

  // Memoize recordings that need duration loading
  const recordingsNeedingDuration = useMemo(() => {
    return recordings.filter(r => r.duration_seconds === 0);
  }, [recordings]);

  useEffect(() => {
    if (recordingsNeedingDuration.length === 0) return;

    const loadDurations = async () => {
      const newDurations = new Map<string, number>();
      
      for (const recording of recordingsNeedingDuration) {
        // Skip if already loaded or currently loading
        if (durations.has(recording.id) || loadingRef.current.has(recording.id)) {
          continue;
        }
        
        loadingRef.current.add(recording.id);
        
        try {
          const { data, error } = await supabase.storage
            .from("recordings")
            .createSignedUrl(recording.audio_file_path, 60);

          if (error || !data?.signedUrl) {
            console.error("Failed to get signed URL for", recording.id, error);
            continue;
          }

          const duration = await new Promise<number>((resolve) => {
            const audio = new Audio();
            audio.preload = "metadata";
            
            const cleanup = () => {
              audio.onloadedmetadata = null;
              audio.onerror = null;
            };
            
            audio.onloadedmetadata = () => {
              cleanup();
              if (audio.duration && isFinite(audio.duration)) {
                resolve(Math.round(audio.duration));
              } else {
                resolve(0);
              }
            };
            
            audio.onerror = () => {
              cleanup();
              resolve(0);
            };
            
            // Timeout to prevent hanging
            setTimeout(() => {
              cleanup();
              resolve(0);
            }, 10000);
            
            audio.src = data.signedUrl;
          });

          if (duration > 0) {
            newDurations.set(recording.id, duration);
          }
        } catch (error) {
          console.error("Failed to load duration for", recording.id, error);
        }
      }

      if (newDurations.size > 0) {
        setDurations(prev => {
          const updated = new Map(prev);
          newDurations.forEach((value, key) => updated.set(key, value));
          return updated;
        });
      }
    };

    loadDurations();
  }, [recordingsNeedingDuration, durations]);

  return durations;
};

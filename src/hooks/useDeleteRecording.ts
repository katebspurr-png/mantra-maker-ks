import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { toast } from "sonner";

interface UseDeleteRecordingOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for deleting recordings with proper cleanup:
 * 1. Stops playback if the recording is currently playing
 * 2. Removes from all playlists that reference it
 * 3. Deletes the audio file from storage
 * 4. Deletes the recording row from database
 */
export function useDeleteRecording(options?: UseDeleteRecordingOptions) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { source, currentTrack, stop, playlist } = useGlobalAudio();

  const deleteRecording = async (recordingId: string, audioFilePath: string) => {
    setIsDeleting(true);

    try {
      // 1. Check if this recording is currently playing and stop it
      const isCurrentlyPlaying = 
        (source?.type === "single" && currentTrack?.id === recordingId) ||
        (source?.type === "playlist" && playlist.some(r => r.id === recordingId));
      
      if (isCurrentlyPlaying) {
        stop();
      }

      // 2. Remove from all playlists that reference this recording
      const { error: playlistError } = await supabase
        .from("playlist_recordings")
        .delete()
        .eq("recording_id", recordingId);

      if (playlistError) {
        console.error("Error removing from playlists:", playlistError);
        // Continue with deletion even if playlist cleanup fails
      }

      // 3. Delete the audio file from storage
      const { error: storageError } = await supabase.storage
        .from("recordings")
        .remove([audioFilePath]);

      if (storageError) {
        console.error("Error deleting audio file:", storageError);
        // Continue with database deletion even if storage delete fails
        // The file will be orphaned but user can still use the app
      }

      // 4. Delete the recording row from database
      const { error: dbError } = await supabase
        .from("recordings")
        .delete()
        .eq("id", recordingId);

      if (dbError) {
        throw new Error(dbError.message || "Failed to delete recording");
      }

      toast.success("Recording deleted");
      options?.onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to delete recording");
      toast.error(err.message);
      options?.onError?.(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteRecording,
    isDeleting,
  };
}

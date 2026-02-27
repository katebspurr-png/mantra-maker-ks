import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Play, Pause, ChevronRight, Mic } from "lucide-react";
import { Recording, Affirmation, AFFIRMATION_CATEGORIES } from "@/types";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useImmersivePlayer } from "@/contexts/ImmersivePlayerContext";

interface FavoritesPreviewProps {
  favoriteRecordings: Recording[];
  favoriteAffirmations: Affirmation[];
}

export const FavoritesPreview = ({ 
  favoriteRecordings, 
  favoriteAffirmations 
}: FavoritesPreviewProps) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, source, togglePlayPause } = useGlobalAudio();
  const { openImmersive } = useImmersivePlayer();

  const handlePlayToggle = (recording: Recording, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentTrack = source?.type === "single" && currentTrack?.id === recording.id;
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      openImmersive(recording);
    }
  };

  const isRecordingPlaying = (recordingId: string) =>
    source?.type === "single" && currentTrack?.id === recordingId && isPlaying;

  const handleRecordAffirmation = (text: string) => {
    navigate("/new-recording", { state: { prefilledText: text } });
  };

  const totalFavorites = favoriteRecordings.length + favoriteAffirmations.length;

  if (totalFavorites === 0) {
    return null;
  }

  return (
    <div>
        {favoriteRecordings.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-[12px] text-muted-foreground tracking-wide mb-2">Recordings</p>
            {favoriteRecordings.slice(0, 3).map((recording) => {
              const playing = isRecordingPlaying(recording.id);
              return (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => openImmersive(recording)}
                >
                  <p className="font-medium truncate text-sm flex-1">{recording.title}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={(e) => handlePlayToggle(recording, e)}
                  >
                    {playing ? (
                      <Pause className="w-4 h-4 text-primary" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {favoriteAffirmations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[12px] text-muted-foreground tracking-wide mb-2">Affirmations</p>
            {favoriteAffirmations.slice(0, 2).map((affirmation) => {
              const categoryLabel = AFFIRMATION_CATEGORIES.find(
                (c) => c.value === affirmation.category
              )?.label;
              return (
                <div
                  key={affirmation.id}
                  className="p-2 rounded-lg bg-muted/50"
                >
                  <p className="text-sm line-clamp-2 mb-1">{affirmation.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{categoryLabel}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleRecordAffirmation(affirmation.text)}
                    >
                      <Mic className="w-3 h-3" />
                      Record
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-muted-foreground"
          onClick={() => navigate("/library")}
        >
          View All Favorites
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
    </div>
  );
};

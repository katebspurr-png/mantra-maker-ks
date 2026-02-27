import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Recording } from "@/types";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useImmersivePlayer } from "@/contexts/ImmersivePlayerContext";

interface ResumePracticeHeroProps {
  recordings: Recording[];
}

export const ResumePracticeHero = ({ recordings }: ResumePracticeHeroProps) => {
  const { currentTrack, isPlaying, source, togglePlayPause } = useGlobalAudio();
  const { openImmersive } = useImmersivePlayer();

  // Pick the most recent favorite, or most recent recording
  const heroRecording = recordings.find(r => r.is_favorite) || recordings[0];

  if (!heroRecording) return null;

  const isCurrentlyPlaying =
    source?.type === "single" && currentTrack?.id === heroRecording.id && isPlaying;

  const handlePlay = () => {
    if (isCurrentlyPlaying) {
      togglePlayPause();
    } else {
      openImmersive(heroRecording);
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-soft">
      <p className="text-[13px] text-muted-foreground mb-3 tracking-wide">
        Resume Your Practice
      </p>

      <p
        className="text-[22px] leading-[1.7] font-serif text-foreground/90 mb-6 cursor-pointer"
        onClick={() => openImmersive(heroRecording)}
      >
        {heroRecording.text
          ? `"${heroRecording.text.length > 120 ? heroRecording.text.slice(0, 120) + "…" : heroRecording.text}"`
          : heroRecording.title}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground truncate max-w-[60%]">
          {heroRecording.title}
        </span>
        <Button
          size="lg"
          className="h-12 w-12 rounded-full p-0 shadow-medium"
          onClick={handlePlay}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          )}
        </Button>
      </div>
    </div>
  );
};

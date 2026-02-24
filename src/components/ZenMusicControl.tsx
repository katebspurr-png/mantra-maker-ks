import { useState, useRef, useCallback } from "react";
import { Volume2, AudioLines, Play, Square, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { ZEN_TRACKS, NONE_TRACK_ID } from "@/data/zenTracks";
import { cn } from "@/lib/utils";

interface ZenMusicControlProps {
  compact?: boolean;
}

/**
 * ZenMusicControl — renamed "Background Sounds"
 *
 * Shows a sound picker grid with preview buttons, volume slider,
 * ducking slider, and dynamic Creative Commons attribution.
 */
export function ZenMusicControl({ compact }: ZenMusicControlProps) {
  const {
    zenEnabled, zenVolume, zenTrackId, zenDuckingIntensity,
    setZenEnabled, setZenVolume, setZenTrackId, setZenDuckingIntensity,
  } = useGlobalAudio();

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setZenEnabled(!zenEnabled);
        }}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          zenEnabled
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
        title={zenEnabled ? "Background sounds on" : "Background sounds off"}
      >
        <Volume2 className="w-4 h-4" />
      </button>
    );
  }

  const effectiveTrackId = zenEnabled ? zenTrackId : NONE_TRACK_ID;
  const currentTrack = ZEN_TRACKS.find(t => t.id === effectiveTrackId);

  const handleSelectTrack = (trackId: string) => {
    if (trackId === NONE_TRACK_ID) {
      setZenEnabled(false);
    } else {
      if (!zenEnabled) setZenEnabled(true);
      setZenTrackId(trackId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Label className="font-medium">Background Sounds</Label>
        </div>
        <Switch
          checked={zenEnabled}
          onCheckedChange={setZenEnabled}
        />
      </div>

      {/* Sound picker grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* None / Silence option */}
        <SoundOption
          id={NONE_TRACK_ID}
          title="None"
          icon="🔇"
          isSelected={!zenEnabled || effectiveTrackId === NONE_TRACK_ID}
          onSelect={() => handleSelectTrack(NONE_TRACK_ID)}
        />
        {ZEN_TRACKS.map(track => (
          <SoundOption
            key={track.id}
            id={track.id}
            title={track.title}
            icon={track.icon}
            previewUrl={track.previewUrl || track.url}
            isSelected={zenEnabled && zenTrackId === track.id}
            onSelect={() => handleSelectTrack(track.id)}
          />
        ))}
      </div>

      {/* Volume & ducking — only when a sound is selected */}
      {zenEnabled && (
        <div className="space-y-3 animate-in fade-in">
          {/* Volume slider */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-sm text-muted-foreground">Volume</Label>
              <span className="text-xs text-muted-foreground ml-auto">
                {Math.round(zenVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[zenVolume]}
              max={1}
              step={0.05}
              onValueChange={([v]) => setZenVolume(v)}
              className="w-full"
            />
          </div>

          {/* Ducking intensity slider */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AudioLines className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-sm text-muted-foreground">Voice Ducking</Label>
              <span className="text-xs text-muted-foreground ml-auto">
                {Math.round(zenDuckingIntensity * 100)}%
              </span>
            </div>
            <Slider
              value={[zenDuckingIntensity]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => setZenDuckingIntensity(v)}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground/60">
              How much to lower music during voice playback
            </p>
          </div>

          {/* Dynamic attribution */}
          {currentTrack && (
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              {currentTrack.title} by {currentTrack.artist} • {currentTrack.license}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SoundOption — A single tile in the picker grid                    */
/* ------------------------------------------------------------------ */

interface SoundOptionProps {
  id: string;
  title: string;
  icon: string;
  previewUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

function SoundOption({ id, title, icon, previewUrl, isSelected, onSelect }: SoundOptionProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPreview = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setIsPreviewing(false);
  }, []);

  const togglePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewUrl) return;

    if (isPreviewing) {
      stopPreview();
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
    }
    const audio = previewAudioRef.current;
    audio.src = previewUrl;
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setIsPreviewing(true);

    // Auto-stop after 10s
    previewTimerRef.current = setTimeout(() => {
      stopPreview();
    }, 10000);

    audio.onended = () => stopPreview();
  }, [previewUrl, isPreviewing, stopPreview]);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition-all min-h-[76px]",
        isSelected
          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
          : "border-border bg-card hover:bg-accent/50 text-foreground"
      )}
    >
      {/* Selected check */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <Check className="w-3 h-3 text-primary" />
        </div>
      )}

      <span className="text-xl leading-none">{icon}</span>
      <span className="text-xs font-medium leading-tight text-center">{title}</span>

      {/* Preview/audition button */}
      {previewUrl && (
        <button
          onClick={togglePreview}
          className={cn(
            "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
            isPreviewing
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={isPreviewing ? "Stop preview" : "Preview 10s"}
        >
          {isPreviewing ? (
            <Square className="w-2.5 h-2.5" />
          ) : (
            <Play className="w-2.5 h-2.5 ml-0.5" />
          )}
        </button>
      )}
    </button>
  );
}

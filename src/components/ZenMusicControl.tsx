import { Music, Volume2, AudioLines } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";

interface ZenMusicControlProps {
  /** Compact mode for MiniPlayer - just shows a toggle icon */
  compact?: boolean;
}

/**
 * ZenMusicControl - Toggle and configure zen background music.
 * 
 * Full mode: shows toggle, track selector, volume slider, and ducking intensity.
 * Compact mode: just a toggleable icon button.
 */
export function ZenMusicControl({ compact }: ZenMusicControlProps) {
  const {
    zenEnabled, zenVolume, zenTrackId, zenDuckingIntensity,
    zenTracks, setZenEnabled, setZenVolume, setZenTrackId, setZenDuckingIntensity,
  } = useGlobalAudio();

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setZenEnabled(!zenEnabled);
        }}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          zenEnabled 
            ? "bg-primary/20 text-primary" 
            : "text-muted-foreground hover:text-foreground"
        }`}
        title={zenEnabled ? "Zen music on" : "Zen music off"}
      >
        <Music className="w-4 h-4" />
      </button>
    );
  }

  const currentTrack = zenTracks.find(t => t.id === zenTrackId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="zen-toggle" className="font-medium">Zen Background Music</Label>
        </div>
        <Switch
          id="zen-toggle"
          checked={zenEnabled}
          onCheckedChange={setZenEnabled}
        />
      </div>

      {zenEnabled && (
        <div className="space-y-3 pl-6">
          {/* Track selector */}
          {zenTracks.length > 1 && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Track</Label>
              <Select value={zenTrackId} onValueChange={setZenTrackId}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zenTracks.map(track => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.title} — {track.artist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          {/* Attribution */}
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

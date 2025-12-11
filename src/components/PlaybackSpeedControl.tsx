import { cn } from "@/lib/utils";

/**
 * PlaybackSpeedControl - Controls audio playback speed
 * 
 * Available presets: 0.75x, 1x, 1.25x, 1.5x
 * Speed state is managed in GlobalAudioContext for consistency across the app.
 * Changing speed applies immediately to the audio element.
 */

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

interface PlaybackSpeedControlProps {
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  compact?: boolean;
}

export function PlaybackSpeedControl({
  speed,
  onSpeedChange,
  compact = false,
}: PlaybackSpeedControlProps) {
  if (compact) {
    // Compact dropdown-style for MiniPlayer
    return (
      <div className="relative">
        <select
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value) as PlaybackSpeed)}
          className="appearance-none bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={(e) => e.stopPropagation()}
        >
          {PLAYBACK_SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Full inline buttons for RecordingDetail/PlaylistDetail
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Speed</label>
      <div className="flex gap-2">
        {PLAYBACK_SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
              speed === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

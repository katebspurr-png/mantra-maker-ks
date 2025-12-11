import { useState, useEffect } from "react";
import { PlaybackMode, PlaybackSettings as PlaybackSettingsType, DEFAULT_PLAYBACK_SETTINGS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Repeat, Infinity, Clock, Play } from "lucide-react";

/**
 * PlaybackSettings Component
 * 
 * Reusable component for selecting playback mode and parameters.
 * Works for both single recordings and playlists.
 * 
 * Modes:
 * - Once: Play one time, then stop
 * - Loop: Repeat continuously until stopped
 * - Repeat: Play exactly N times
 * - Duration: Play for a set amount of time
 */

interface PlaybackSettingsProps {
  settings: PlaybackSettingsType;
  onChange: (settings: PlaybackSettingsType) => void;
  onSaveAsDefault?: () => void;
  compact?: boolean;
  className?: string;
}

const SESSION_STORAGE_KEY = "playback-settings";

export function PlaybackSettings({
  settings,
  onChange,
  onSaveAsDefault,
  compact = false,
  className = "",
}: PlaybackSettingsProps) {
  const handleModeChange = (mode: PlaybackMode) => {
    onChange({ ...settings, mode });
  };

  const handleRepeatCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0 && count <= 1000) {
      onChange({ ...settings, repeatCount: count });
    }
  };

  const handleDurationChange = (minutes: number) => {
    onChange({ ...settings, durationMinutes: minutes });
  };

  const durationPresets = [5, 10, 15, 30, 60];

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 items-center ${className}`}>
        <Select value={settings.mode} onValueChange={(v) => handleModeChange(v as PlaybackMode)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Once</span>
              </div>
            </SelectItem>
            <SelectItem value="loop">
              <div className="flex items-center gap-2">
                <Infinity className="w-3.5 h-3.5" />
                <span>Loop</span>
              </div>
            </SelectItem>
            <SelectItem value="repeat">
              <div className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5" />
                <span>Repeat</span>
              </div>
            </SelectItem>
            <SelectItem value="duration">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Duration</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {settings.mode === "repeat" && (
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              value={settings.repeatCount}
              onChange={(e) => handleRepeatCountChange(e.target.value)}
              className="w-16 h-9"
              min={1}
              max={1000}
            />
            <span className="text-sm text-muted-foreground">times</span>
          </div>
        )}

        {settings.mode === "duration" && (
          <Select
            value={settings.durationMinutes.toString()}
            onValueChange={(v) => handleDurationChange(parseInt(v, 10))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationPresets.map((min) => (
                <SelectItem key={min} value={min.toString()}>
                  {min >= 60 ? `${min / 60}h` : `${min}m`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium mb-2 block">Playback Mode</Label>
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            mode="once"
            currentMode={settings.mode}
            onClick={handleModeChange}
            icon={<Play className="w-4 h-4" />}
            label="Once"
            description="Play one time"
          />
          <ModeButton
            mode="loop"
            currentMode={settings.mode}
            onClick={handleModeChange}
            icon={<Infinity className="w-4 h-4" />}
            label="Loop"
            description="Repeat forever"
          />
          <ModeButton
            mode="repeat"
            currentMode={settings.mode}
            onClick={handleModeChange}
            icon={<Repeat className="w-4 h-4" />}
            label="Repeat"
            description="Set number of times"
          />
          <ModeButton
            mode="duration"
            currentMode={settings.mode}
            onClick={handleModeChange}
            icon={<Clock className="w-4 h-4" />}
            label="Duration"
            description="Play for set time"
          />
        </div>
      </div>

      {settings.mode === "repeat" && (
        <div className="space-y-2 animate-in fade-in">
          <Label htmlFor="repeat-count" className="text-sm">Number of repetitions</Label>
          <div className="flex items-center gap-3">
            <Input
              id="repeat-count"
              type="number"
              value={settings.repeatCount}
              onChange={(e) => handleRepeatCountChange(e.target.value)}
              className="w-24"
              min={1}
              max={1000}
            />
            <span className="text-sm text-muted-foreground">times</span>
          </div>
          <div className="flex gap-2">
            {[3, 10, 20, 50].map((count) => (
              <Button
                key={count}
                variant={settings.repeatCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ ...settings, repeatCount: count })}
              >
                {count}×
              </Button>
            ))}
          </div>
        </div>
      )}

      {settings.mode === "duration" && (
        <div className="space-y-2 animate-in fade-in">
          <Label className="text-sm">Playback duration</Label>
          <div className="flex flex-wrap gap-2">
            {durationPresets.map((min) => (
              <Button
                key={min}
                variant={settings.durationMinutes === min ? "default" : "outline"}
                size="sm"
                onClick={() => handleDurationChange(min)}
              >
                {min >= 60 ? `${min / 60} hour` : `${min} min`}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Label className="text-sm text-muted-foreground">Custom:</Label>
            <Input
              type="number"
              value={settings.durationMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0 && val <= 480) {
                  handleDurationChange(val);
                }
              }}
              className="w-20"
              min={1}
              max={480}
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        </div>
      )}

      {onSaveAsDefault && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveAsDefault}
          className="text-muted-foreground text-xs"
        >
          Save as default
        </Button>
      )}
    </div>
  );
}

interface ModeButtonProps {
  mode: PlaybackMode;
  currentMode: PlaybackMode;
  onClick: (mode: PlaybackMode) => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function ModeButton({ mode, currentMode, onClick, icon, label, description }: ModeButtonProps) {
  const isSelected = mode === currentMode;

  return (
    <button
      onClick={() => onClick(mode)}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:bg-accent/50"
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

// Utility functions for session storage
export function loadPlaybackSettings(): PlaybackSettingsType {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PLAYBACK_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load playback settings:", e);
  }
  return DEFAULT_PLAYBACK_SETTINGS;
}

export function savePlaybackSettings(settings: PlaybackSettingsType): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save playback settings:", e);
  }
}

export function saveDefaultPlaybackSettings(settings: PlaybackSettingsType): void {
  try {
    localStorage.setItem("default-playback-settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save default playback settings:", e);
  }
}

export function loadDefaultPlaybackSettings(): PlaybackSettingsType {
  try {
    const stored = localStorage.getItem("default-playback-settings");
    if (stored) {
      return { ...DEFAULT_PLAYBACK_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load default playback settings:", e);
  }
  return DEFAULT_PLAYBACK_SETTINGS;
}

// Hook for using playback settings with session persistence
export function usePlaybackSettings() {
  const [settings, setSettingsState] = useState<PlaybackSettingsType>(() => loadPlaybackSettings());

  const setSettings = (newSettings: PlaybackSettingsType) => {
    setSettingsState(newSettings);
    savePlaybackSettings(newSettings);
  };

  const saveAsDefault = () => {
    saveDefaultPlaybackSettings(settings);
  };

  return { settings, setSettings, saveAsDefault };
}

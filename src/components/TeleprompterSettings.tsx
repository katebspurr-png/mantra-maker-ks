import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Type, 
  Gauge,
  RotateCcw,
  Hand,
  Pause,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEXT_SIZES, PACE_PRESETS } from "./TeleprompterDisplay";

/**
 * TeleprompterSettings Component
 * 
 * Controls for teleprompter behavior - completely independent from recording.
 * These controls ONLY affect text display and highlighting, not recording.
 */

interface TeleprompterSettingsProps {
  teleprompterEnabled: boolean;
  onTeleprompterEnabledChange: (enabled: boolean) => void;
  karaokeEnabled: boolean;
  onKaraokeEnabledChange: (enabled: boolean) => void;
  textSizeIndex: number;
  onTextSizeChange: (index: number) => void;
  paceIndex: number;
  onPaceChange: (index: number) => void;
  manualMode: boolean;
  onManualModeChange: (manual: boolean) => void;
  isHighlighting: boolean;
  onPauseHighlight: () => void;
  onResumeHighlight: () => void;
  onResetHighlight: () => void;
  disabled?: boolean;
}

export function TeleprompterSettings({
  teleprompterEnabled,
  onTeleprompterEnabledChange,
  karaokeEnabled,
  onKaraokeEnabledChange,
  textSizeIndex,
  onTextSizeChange,
  paceIndex,
  onPaceChange,
  manualMode,
  onManualModeChange,
  isHighlighting,
  onPauseHighlight,
  onResumeHighlight,
  onResetHighlight,
  disabled = false,
}: TeleprompterSettingsProps) {
  const handlePaceChange = (values: number[]) => {
    onPaceChange(values[0]);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="teleprompter-toggle" className="text-sm font-medium">
          Teleprompter
        </Label>
        <Switch
          id="teleprompter-toggle"
          checked={teleprompterEnabled}
          onCheckedChange={onTeleprompterEnabledChange}
          disabled={disabled}
        />
      </div>

      {teleprompterEnabled && (
        <>
          {/* Karaoke toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Label htmlFor="karaoke-toggle" className="text-sm">
              Highlight words (Karaoke)
            </Label>
            <Switch
              id="karaoke-toggle"
              checked={karaokeEnabled}
              onCheckedChange={onKaraokeEnabledChange}
              disabled={disabled}
            />
          </div>

          {karaokeEnabled && (
            <>
              {/* Text size controls */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1 text-muted-foreground min-w-[50px]">
                  <Type className="w-4 h-4" />
                  <span className="text-xs">Size</span>
                </div>
                <div className="flex items-center gap-1 flex-1 justify-center">
                  {TEXT_SIZES.map((size, index) => (
                    <button
                      key={size.label}
                      onClick={() => onTextSizeChange(index)}
                      disabled={disabled}
                      className={cn(
                        "w-9 h-9 rounded-lg text-xs font-medium transition-colors",
                        index === textSizeIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-muted-foreground min-w-[50px]">
                  <Gauge className="w-4 h-4" />
                  <span className="text-xs">Pace</span>
                </div>
                <div className="flex-1 px-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    {PACE_PRESETS.map((pace, index) => (
                      <span 
                        key={pace.label}
                        className={cn(
                          "transition-colors",
                          index === paceIndex && "text-primary font-medium"
                        )}
                      >
                        {pace.label}
                      </span>
                    ))}
                  </div>
                  <Slider
                    value={[paceIndex]}
                    onValueChange={handlePaceChange}
                    max={PACE_PRESETS.length - 1}
                    step={1}
                    className="w-full"
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Highlight controls */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
                {!manualMode && (
                  <Button
                    variant={isHighlighting ? "default" : "outline"}
                    size="default"
                    className="flex-1 max-w-[180px] touch-target"
                    onClick={isHighlighting ? onPauseHighlight : onResumeHighlight}
                    disabled={disabled}
                  >
                    {isHighlighting ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Highlight
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume Highlight
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onResetHighlight}
                  className="h-10 w-10"
                  title="Reset Highlight"
                  disabled={disabled}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={manualMode ? "default" : "outline"}
                  size="icon"
                  onClick={() => onManualModeChange(!manualMode)}
                  className="h-10 w-10"
                  title={manualMode ? "Auto mode" : "Manual mode"}
                  disabled={disabled}
                >
                  <Hand className="w-4 h-4" />
                </Button>
              </div>

              {/* Helpful tip */}
              <p className="text-xs text-center text-muted-foreground">
                {manualMode 
                  ? "Tap the text area to advance words manually"
                  : "Highlight controls affect text display only, not recording"
                }
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

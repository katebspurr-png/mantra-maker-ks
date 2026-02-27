import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Mic, ChevronDown, RotateCcw, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalibrationDialog } from "./CalibrationDialog";
import { TEXT_SIZES } from "./TeleprompterDisplay";

const DEFAULT_WPM = 120;
const MIN_WPM = 40;
const MAX_WPM = 240;

interface TeleprompterSettingsProps {
  teleprompterEnabled: boolean;
  onTeleprompterEnabledChange: (enabled: boolean) => void;
  karaokeEnabled: boolean;
  onKaraokeEnabledChange: (enabled: boolean) => void;
  textSizeIndex: number;
  onTextSizeChange: (index: number) => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  calibratedWpm: number | null;
  onCalibrated: (wpm: number) => void;
  disabled?: boolean;
}

export function TeleprompterSettings({
  teleprompterEnabled,
  onTeleprompterEnabledChange,
  karaokeEnabled,
  onKaraokeEnabledChange,
  textSizeIndex,
  onTextSizeChange,
  wpm,
  onWpmChange,
  calibratedWpm,
  onCalibrated,
  disabled = false,
}: TeleprompterSettingsProps) {
  const [showCalibration, setShowCalibration] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSliderChange = (values: number[]) => {
    onWpmChange(values[0]);
  };

  const handleResetSpeed = () => {
    onWpmChange(calibratedWpm ?? DEFAULT_WPM);
  };

  const isCustomSpeed = calibratedWpm != null && wpm !== calibratedWpm;

  const paceCaption = (() => {
    if (!calibratedWpm) {
      return "Tap Calibrate to match your natural speaking pace";
    }
    if (isCustomSpeed) {
      return `Custom speed (calibrated: ${calibratedWpm} WPM)`;
    }
    return `Using your calibrated speed (${calibratedWpm} WPM)`;
  })();

  return (
    <>
      <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-soft)] space-y-5">
        {/* Teleprompter toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Label htmlFor="teleprompter-toggle" className="text-sm font-medium">
              Teleprompter
            </Label>
            {calibratedWpm && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/8 text-primary/80">
                Calibrated
              </span>
            )}
          </div>
          <Switch
            id="teleprompter-toggle"
            checked={teleprompterEnabled}
            onCheckedChange={onTeleprompterEnabledChange}
            disabled={disabled}
          />
        </div>

        {teleprompterEnabled && (
          <>
            {/* Pace slider */}
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground/70 mb-2">
                <span>Slower</span>
                <span className="text-primary/70 font-medium">Recommended</span>
                <span>Faster</span>
              </div>
              <Slider
                value={[wpm]}
                onValueChange={handleSliderChange}
                min={MIN_WPM}
                max={MAX_WPM}
                step={5}
                className="w-full"
                disabled={disabled}
              />
              <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
                {paceCaption}
              </p>
            </div>

            {/* Calibrate button */}
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              onClick={() => setShowCalibration(true)}
              disabled={disabled}
            >
              <Mic className="w-4 h-4" />
              {calibratedWpm ? `Recalibrate (${calibratedWpm} WPM)` : "🎙 Calibrate"}
            </button>

            {/* Advanced section */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className="flex items-center justify-between w-full text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors pt-3 border-t border-border/30"
                  disabled={disabled}
                >
                  <span className="uppercase tracking-wider">Advanced</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      advancedOpen && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Highlight words toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="karaoke-toggle" className="text-sm text-foreground/80">
                    Highlight words
                  </Label>
                  <Switch
                    id="karaoke-toggle"
                    checked={karaokeEnabled}
                    onCheckedChange={onKaraokeEnabledChange}
                    disabled={disabled}
                  />
                </div>

                {/* Text size selector */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground/60 min-w-[50px]">
                    <Type className="w-3.5 h-3.5" />
                    <span className="text-xs">Size</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    {TEXT_SIZES.map((size, index) => (
                      <button
                        key={size.label}
                        onClick={() => onTextSizeChange(index)}
                        disabled={disabled}
                        className={cn(
                          "w-9 h-9 rounded-xl text-xs font-medium transition-all",
                          index === textSizeIndex
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/30 text-muted-foreground/70 hover:bg-muted/50",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset to calibrated speed */}
                {isCustomSpeed && (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary/70 hover:text-primary transition-colors"
                    onClick={handleResetSpeed}
                    disabled={disabled}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to calibrated speed ({calibratedWpm} WPM)
                  </button>
                )}

                {/* Reset to default */}
                {!calibratedWpm && (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    onClick={() => onWpmChange(DEFAULT_WPM)}
                    disabled={disabled}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to default speed
                  </button>
                )}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </div>

      <CalibrationDialog
        open={showCalibration}
        onOpenChange={setShowCalibration}
        onCalibrated={onCalibrated}
      />
    </>
  );
}

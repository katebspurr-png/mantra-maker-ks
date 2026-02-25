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

/**
 * TeleprompterSettings – Refactored for simplicity.
 *
 * Always visible: Teleprompter toggle, Pace slider, Calibrate button
 * Collapsed: Highlight toggle, text size, reset speed
 */

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

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4 space-y-5">
        {/* Teleprompter toggle — always visible */}
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
            {/* Pace slider — always visible */}
            <div className="space-y-2 pt-1">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Slower</span>
                  <span className="text-primary font-medium">Recommended</span>
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
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  {calibratedWpm
                    ? `Using your calibrated speed (${calibratedWpm} WPM)`
                    : "Tap Calibrate to match your natural speaking pace"}
                </p>
              </div>
            </div>

            {/* Calibrate button — always visible */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowCalibration(true)}
              disabled={disabled}
            >
              <Mic className="w-4 h-4" />
              {calibratedWpm ? `Recalibrate (${calibratedWpm} WPM)` : "🎙 Calibrate"}
            </Button>

            {/* Advanced section — collapsed by default */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors pt-2 border-t border-border/50"
                  disabled={disabled}
                >
                  <span>Advanced</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      advancedOpen && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-3">
                {/* Highlight words toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="karaoke-toggle" className="text-sm">
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

                {/* Reset to default speed */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground"
                  onClick={handleResetSpeed}
                  disabled={disabled}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to {calibratedWpm ? "calibrated" : "default"} speed
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </div>

      {/* Calibration dialog */}
      <CalibrationDialog
        open={showCalibration}
        onOpenChange={setShowCalibration}
        onCalibrated={onCalibrated}
      />
    </>
  );
}

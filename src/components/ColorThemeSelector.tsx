import { Check } from "lucide-react";
import { useColorTheme, ThemeId } from "@/hooks/useColorTheme";
import { cn } from "@/lib/utils";

export function ColorThemeSelector() {
  const { activeTheme, selectTheme, presets } = useColorTheme();

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h2 className="font-medium mb-1">Color Theme</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Choose a color palette that feels right for you
      </p>
      <div className="grid grid-cols-3 gap-3">
        {presets.map((preset) => {
          const isActive = activeTheme === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => selectTheme(preset.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg p-3 border-2 transition-all",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div
                className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center"
                style={{ backgroundColor: preset.preview }}
              >
                {isActive && <Check className="w-5 h-5 text-white" />}
              </div>
              <span className="text-xs font-medium leading-tight">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

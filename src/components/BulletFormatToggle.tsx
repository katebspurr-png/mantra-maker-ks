import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { List } from "lucide-react";

interface BulletFormatToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

/**
 * Toggle for formatting combined affirmation scripts as bullet lists.
 * Default is OFF (plain paragraphs separated by blank lines).
 */
export function BulletFormatToggle({ enabled, onChange }: BulletFormatToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="bullet-format" className="cursor-pointer">
          Format as bullet list
        </Label>
      </div>
      <Switch
        id="bullet-format"
        checked={enabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}

/**
 * Formats an array of affirmation texts into a combined script.
 * If bullets is true, prefixes each with a bullet character.
 * Otherwise, separates with double line breaks.
 */
export function formatCombinedScript(texts: string[], useBullets: boolean): string {
  if (useBullets) {
    return texts.map(text => `• ${text}`).join("\n\n");
  }
  return texts.join("\n\n");
}
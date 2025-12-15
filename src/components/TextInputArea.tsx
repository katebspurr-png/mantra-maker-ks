import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * TextInputArea Component
 * 
 * Simple text input for affirmation text entry.
 */

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onPreviewClick?: () => void;
}

export function TextInputArea({ 
  value, 
  onChange, 
  disabled, 
  placeholder,
  onPreviewClick 
}: TextInputAreaProps) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="relative w-full">
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
          Your Affirmation
        </label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || "Type or paste your affirmation here..."}
          className="min-h-[180px] text-lg leading-relaxed resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
        />
      </div>
      {value && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            {words.length} words
          </p>
          {onPreviewClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviewClick}
              className="text-xs text-primary"
            >
              Preview text →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
      <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
          Your Affirmation
        </label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || "Type or paste your affirmation here..."}
          className="min-h-[200px] text-xl leading-[1.8] resize-none border-0 p-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40"
        />
      </div>
      {value && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-muted-foreground/70">
            {words.length} words
          </p>
          {onPreviewClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviewClick}
              className="text-xs text-primary/80 hover:text-primary"
            >
              Preview text →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

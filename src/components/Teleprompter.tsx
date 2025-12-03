import { Textarea } from "@/components/ui/textarea";

interface TeleprompterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Teleprompter({ value, onChange, disabled, placeholder }: TeleprompterProps) {
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
          className="min-h-[120px] text-lg leading-relaxed resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
        />
      </div>
      {value && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {value.split(/\s+/).filter(Boolean).length} words
        </p>
      )}
    </div>
  );
}

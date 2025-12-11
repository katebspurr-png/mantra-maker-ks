import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tags can later be used for filtering recordings or building smart playlists by theme

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Common suggested tags for quick-add
const SUGGESTED_TAGS = ["morning", "sleep", "money", "confidence", "calm", "gratitude"];

// Tag validation rules
const MIN_TAG_LENGTH = 2;
const MAX_TAG_LENGTH = 30;

export function TagInput({ 
  tags, 
  onChange, 
  placeholder = "Add a tag...",
  disabled = false,
  className 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const normalizeTag = (tag: string): string => {
    return tag.trim().toLowerCase();
  };

  const isValidTag = (tag: string): boolean => {
    const normalized = normalizeTag(tag);
    return normalized.length >= MIN_TAG_LENGTH && 
           normalized.length <= MAX_TAG_LENGTH &&
           !tags.includes(normalized);
  };

  const addTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    if (isValidTag(tag)) {
      onChange([...tags, normalized]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Filter out suggested tags that are already added
  const availableSuggestions = SUGGESTED_TAGS.filter(
    suggestion => !tags.includes(suggestion)
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Current tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addTag(inputValue)}
            disabled={!inputValue.trim() || !isValidTag(inputValue)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Suggested tags (only show when input is empty and there are available suggestions) */}
      {!disabled && !inputValue && availableSuggestions.length > 0 && tags.length < 6 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Suggestions:</span>
          {availableSuggestions.slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
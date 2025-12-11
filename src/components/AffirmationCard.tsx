import { Affirmation, AFFIRMATION_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface AffirmationCardProps {
  affirmation: Affirmation;
  onRecord: (text: string) => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSelection?: boolean;
}

export function AffirmationCard({ 
  affirmation, 
  onRecord, 
  isSelected = false,
  onSelectionChange,
  showSelection = false
}: AffirmationCardProps) {
  const categoryLabel = AFFIRMATION_CATEGORIES.find(
    (c) => c.value === affirmation.category
  )?.label;

  const handleCardClick = () => {
    if (showSelection && onSelectionChange) {
      onSelectionChange(!isSelected);
    }
  };

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border p-4 shadow-sm transition-all",
        isSelected 
          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
          : "border-border",
        showSelection && "cursor-pointer"
      )}
      onClick={handleCardClick}
    >
      <div className="flex gap-3">
        {showSelection && (
          <div 
            className="flex-shrink-0 pt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange?.(checked === true)}
              className="h-5 w-5"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base leading-relaxed mb-3">{affirmation.text}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              {categoryLabel}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRecord(affirmation.text);
              }}
              className="gap-1.5 flex-shrink-0"
            >
              <Mic className="w-3.5 h-3.5" />
              Record This
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

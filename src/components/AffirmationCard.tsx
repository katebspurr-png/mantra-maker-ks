import { Affirmation, AFFIRMATION_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface AffirmationCardProps {
  affirmation: Affirmation;
  onRecord: (text: string) => void;
}

export function AffirmationCard({ affirmation, onRecord }: AffirmationCardProps) {
  const categoryLabel = AFFIRMATION_CATEGORIES.find(
    (c) => c.value === affirmation.category
  )?.label;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <p className="text-base leading-relaxed mb-3">{affirmation.text}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
          {categoryLabel}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRecord(affirmation.text)}
          className="gap-1.5"
        >
          <Mic className="w-3.5 h-3.5" />
          Record This
        </Button>
      </div>
    </div>
  );
}

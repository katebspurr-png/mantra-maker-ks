import { useNavigate } from "react-router-dom";
import { useListeningStats } from "@/hooks/useListeningStats";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { DailyProgressPreview } from "./DailyProgressPreview";

export const YourRhythmSection = () => {
  const navigate = useNavigate();
  const { todayMinutes, weeklyMinutes, isLoading } = useListeningStats();

  return (
    <div className="space-y-5">
      {/* Listening summary */}
      <div className="flex items-baseline gap-4 text-[14px] text-muted-foreground">
        <span>
          <span className="text-[22px] font-semibold text-foreground mr-1">{isLoading ? "–" : todayMinutes}</span>
          min today
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span>{isLoading ? "–" : weeklyMinutes} min this week</span>
      </div>

      {/* Weekly dots from DailyProgressPreview */}
      <DailyProgressPreview />

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/progress")}
      >
        <span>View Progress</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

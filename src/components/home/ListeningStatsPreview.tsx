import { useNavigate } from "react-router-dom";
import { useListeningStats } from "@/hooks/useListeningStats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ListeningStatsPreview = () => {
  const navigate = useNavigate();
  const { todayMinutes, weeklyMinutes, lifetimeMinutes, isLoading } = useListeningStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-10 w-20 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold text-foreground">{todayMinutes}</span>
        <span className="text-[14px] text-muted-foreground">min today</span>
      </div>

      <div className="flex gap-4 text-[13px] text-muted-foreground">
        <span>{weeklyMinutes} min this week</span>
        <span>·</span>
        <span>{lifetimeMinutes.toLocaleString()} min total</span>
      </div>

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
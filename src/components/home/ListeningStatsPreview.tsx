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
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            <span className="font-semibold">Listening Time</span>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-bold text-primary">{todayMinutes}</span>
          <span className="text-muted-foreground">min today</span>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground mb-3">
          <span>{weeklyMinutes} min this week</span>
          <span>•</span>
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
      </CardContent>
    </Card>
  );
};
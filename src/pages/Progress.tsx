import { useNavigate } from "react-router-dom";
import { useListeningStats } from "@/hooks/useListeningStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Headphones, Calendar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const Progress = () => {
  const navigate = useNavigate();
  const { 
    todayMinutes, 
    weeklyMinutes, 
    monthlyMinutes, 
    lifetimeMinutes, 
    dailyStats,
    isLoading 
  } = useListeningStats();
  
  const [selectedDay, setSelectedDay] = useState<{ date: string; minutes: number } | null>(null);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  // Get first day of month to calculate grid offset
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();

  const getIntensity = (minutes: number): string => {
    if (minutes === 0) return "bg-muted";
    if (minutes < 5) return "bg-primary/20";
    if (minutes < 15) return "bg-primary/40";
    if (minutes < 30) return "bg-primary/60";
    return "bg-primary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Your Progress</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Your Progress</h1>
      </div>

      {/* Lifetime Stats - Hero */}
      <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <Headphones className="w-12 h-12 mx-auto mb-3 text-primary" />
          <p className="text-5xl font-bold text-primary mb-2">
            {lifetimeMinutes.toLocaleString()}
          </p>
          <p className="text-muted-foreground">
            minutes listened since you started
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{todayMinutes}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{weeklyMinutes}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{monthlyMinutes}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            {currentMonth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Day cells */}
            {dailyStats.map((day) => {
              const dayNum = new Date(day.date).getDate();
              const isToday = day.date === today;
              const isFuture = new Date(day.date) > new Date();
              
              return (
                <button
                  key={day.date}
                  onClick={() => !isFuture && setSelectedDay({ date: day.date, minutes: day.minutes })}
                  disabled={isFuture}
                  className={`
                    aspect-square rounded-md flex flex-col items-center justify-center text-xs
                    transition-colors relative
                    ${isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-primary/50'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    ${getIntensity(day.minutes)}
                  `}
                >
                  <span className={`font-medium ${day.minutes > 0 ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {dayNum}
                  </span>
                  {day.minutes > 0 && !isFuture && (
                    <span className={`text-[10px] ${day.minutes >= 15 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {day.minutes}m
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg font-semibold">
                {selectedDay.minutes > 0 
                  ? `You listened for ${selectedDay.minutes} minute${selectedDay.minutes !== 1 ? 's' : ''}`
                  : 'No listening recorded'}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted" />
              <div className="w-4 h-4 rounded bg-primary/20" />
              <div className="w-4 h-4 rounded bg-primary/40" />
              <div className="w-4 h-4 rounded bg-primary/60" />
              <div className="w-4 h-4 rounded bg-primary" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Encouragement */}
      {lifetimeMinutes > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Keep going!</p>
              <p className="text-sm text-muted-foreground">
                Every minute of practice strengthens your mindset.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Progress;
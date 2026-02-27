import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Calendar } from "lucide-react";

interface DayProgress {
  date: string;
  completed: boolean;
}

export const DailyProgressPreview = () => {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [weekProgress, setWeekProgress] = useState<DayProgress[]>([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get last 7 days
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const { data } = await supabase
      .from("daily_progress")
      .select("date, completed")
      .eq("user_id", session.user.id)
      .in("date", dates);

    const progressMap = new Map(data?.map(d => [d.date, d.completed]) || []);
    
    const week = dates.map(date => ({
      date,
      completed: progressMap.get(date) || false
    }));
    
    setWeekProgress(week);

    // Calculate streak (consecutive completed days ending today or yesterday)
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if today is completed, if not check yesterday
    const startFromToday = progressMap.get(today);
    const startFromYesterday = progressMap.get(yesterday);
    
    if (startFromToday || startFromYesterday) {
      // Count backwards from the most recent completed day
      for (let i = 0; i <= 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        // Skip today if not completed but yesterday is
        if (i === 0 && !startFromToday && startFromYesterday) continue;
        
        const { data: dayData } = await supabase
          .from("daily_progress")
          .select("completed")
          .eq("user_id", session.user.id)
          .eq("date", dateStr)
          .maybeSingle();
        
        if (dayData?.completed) {
          currentStreak++;
        } else if (i > 0 || startFromToday) {
          break;
        }
      }
    }
    
    setStreak(currentStreak);
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-muted-foreground">
          {streak > 0 ? `${streak} days practiced` : "Start your practice"}
        </span>
      </div>
      
      <div className="flex justify-between items-center px-1">
        {weekProgress.map((day, index) => {
          const dayOfWeek = new Date(day.date).getDay();
          return (
            <div key={day.date} className="flex flex-col items-center gap-2.5">
              <span className="text-[11px] text-muted-foreground">
                {dayLabels[dayOfWeek]}
              </span>
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-[12px] ${
                  day.completed 
                    ? 'bg-primary text-primary-foreground shadow-soft' 
                    : 'ring-1 ring-border text-muted-foreground/50'
                }`}
              >
                {day.completed ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-muted-foreground"
        onClick={() => navigate("/progress")}
      >
        <Calendar className="w-4 h-4 mr-2" />
        View Progress
      </Button>
    </div>
  );
};

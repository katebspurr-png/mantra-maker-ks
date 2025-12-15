import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// America/Halifax timezone offset helper
const getHalifaxDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Halifax' });
};

const getHalifaxDateRange = (startDaysAgo: number, endDaysAgo: number = 0): { start: string; end: string } => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - startDaysAgo);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - endDaysAgo);
  
  return {
    start: startDate.toISOString(),
    end: new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // End of day
  };
};

interface DailyListening {
  date: string;
  minutes: number;
  seconds: number;
}

interface ListeningStats {
  todayMinutes: number;
  todaySeconds: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  lifetimeMinutes: number;
  dailyStats: DailyListening[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useListeningStats(): ListeningStats {
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [weeklySeconds, setWeeklySeconds] = useState(0);
  const [monthlySeconds, setMonthlySeconds] = useState(0);
  const [lifetimeSeconds, setLifetimeSeconds] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyListening[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;
      const todayHalifax = getHalifaxDate();

      // Fetch all listening events for the user
      const { data: events, error } = await supabase
        .from("listening_events")
        .select("seconds_listened, started_at")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching listening events:", error);
        setIsLoading(false);
        return;
      }

      if (!events || events.length === 0) {
        setIsLoading(false);
        return;
      }

      // Group by Halifax date
      const byDate = new Map<string, number>();
      let lifetime = 0;

      for (const event of events) {
        const eventDate = getHalifaxDate(new Date(event.started_at));
        const current = byDate.get(eventDate) || 0;
        byDate.set(eventDate, current + event.seconds_listened);
        lifetime += event.seconds_listened;
      }

      // Today's seconds
      const today = byDate.get(todayHalifax) || 0;
      setTodaySeconds(today);

      // Weekly (rolling 7 days)
      let weekly = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getHalifaxDate(d);
        weekly += byDate.get(dateStr) || 0;
      }
      setWeeklySeconds(weekly);

      // Monthly (current calendar month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      let monthly = 0;
      for (const [dateStr, seconds] of byDate.entries()) {
        const eventDate = new Date(dateStr);
        if (eventDate >= monthStart) {
          monthly += seconds;
        }
      }
      setMonthlySeconds(monthly);

      // Lifetime
      setLifetimeSeconds(lifetime);

      // Daily stats for current month calendar view
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dailyArray: DailyListening[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const seconds = byDate.get(dateStr) || 0;
        dailyArray.push({
          date: dateStr,
          minutes: Math.round(seconds / 60),
          seconds,
        });
      }
      setDailyStats(dailyArray);

    } catch (error) {
      console.error("Error in useListeningStats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    todayMinutes: Math.round(todaySeconds / 60),
    todaySeconds,
    weeklyMinutes: Math.round(weeklySeconds / 60),
    monthlyMinutes: Math.round(monthlySeconds / 60),
    lifetimeMinutes: Math.round(lifetimeSeconds / 60),
    dailyStats,
    isLoading,
    refetch: fetchStats,
  };
}

/**
 * Hook to log a listening event.
 * Call this when playback stops, pauses for >2s, or track ends.
 */
export function useListeningTracker() {
  const logListeningEvent = useCallback(async (params: {
    recordingId?: string | null;
    playlistId?: string | null;
    startedAt: Date;
    secondsListened: number;
  }) => {
    // Minimum threshold: 10 seconds
    if (params.secondsListened < 10) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("listening_events").insert({
        user_id: session.user.id,
        recording_id: params.recordingId || null,
        playlist_id: params.playlistId || null,
        started_at: params.startedAt.toISOString(),
        seconds_listened: Math.floor(params.secondsListened),
      });

      if (error) {
        console.error("Error logging listening event:", error);
      }
    } catch (error) {
      console.error("Error in logListeningEvent:", error);
    }
  }, []);

  return { logListeningEvent };
}
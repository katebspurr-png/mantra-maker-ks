import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";
import { BottomNavigation } from "@/components/BottomNavigation";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { InstallPromptBanner } from "@/components/InstallPromptBanner";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import {
  ThoughtTransformerCard,
  DailyProgressPreview,
  PlaylistsPreview,
  RecentRecordingsPreview,
  TryTodayCard,
} from "@/components/home";

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      
      setProfile(profileData);
      await fetchRecordings();
      setLoading(false);
      
      // Mark today as completed (user visited app)
      markTodayComplete(session.user.id);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRecordings = async () => {
    const { data, error } = await supabase
      .from("recordings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setRecordings((data as Recording[]) || []);
    }
  };

  const markTodayComplete = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Upsert today's progress
    await supabase
      .from("daily_progress")
      .upsert(
        { user_id: userId, date: today, completed: true },
        { onConflict: "user_id,date" }
      );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <WelcomeDialog />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">
            Hi, {profile?.first_name || "there"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Your daily affirmation practice
          </p>
        </div>
      </div>

      {/* Install Banner */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <InstallPromptBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 1. Thought Transformer */}
        <ThoughtTransformerCard />

        {/* 2. Record New Affirmation - Primary CTA */}
        <Button 
          size="lg"
          className="w-full h-14 text-lg font-semibold shadow-lg"
          onClick={() => navigate("/new-recording")}
        >
          <Mic className="w-5 h-5 mr-2" />
          Record New Affirmation
        </Button>

        {/* 3. Your Practice (Playlists) */}
        <PlaylistsPreview />

        {/* 4. Daily Progress */}
        <DailyProgressPreview />

        {/* 5. Recent Recordings */}
        <RecentRecordingsPreview recordings={recordings} />

        {/* 6. Try This Today */}
        <TryTodayCard />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;

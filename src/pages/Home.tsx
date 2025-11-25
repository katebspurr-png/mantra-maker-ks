import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types/recording";
import { Button } from "@/components/ui/button";
import RecordingsList from "@/components/RecordingsList";
import { Plus, LogOut } from "lucide-react";
import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check auth and fetch data
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      
      // Fetch recordings
      await fetchRecordings();
      setLoading(false);
    };

    init();

    // Listen for auth changes
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

    if (error) {
      toast.error("Failed to load recordings");
      return;
    }

    setRecordings(data || []);
  };

  const handlePlayToggle = async (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      const { data } = await supabase.storage
        .from("recordings")
        .createSignedUrl(recording.audio_file_path, 3600);

      if (data?.signedUrl) {
        if (audioRef.current) {
          audioRef.current.src = data.signedUrl;
          audioRef.current.play();
          setPlayingId(recording.id);
        }
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
      />
      
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Hi, {profile?.first_name || "there"}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                {recordings.length} {recordings.length === 1 ? "recording" : "recordings"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <RecordingsList
          recordings={recordings}
          onRecordingsChange={fetchRecordings}
          playingId={playingId}
          onPlayToggle={handlePlayToggle}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full touch-target shadow-lg"
            onClick={() => navigate("/new-recording")}
          >
            <Plus className="w-5 h-5" />
            New Recording
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
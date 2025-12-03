import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";
import RecordingsList from "@/components/RecordingsList";
import { BottomNavigation } from "@/components/BottomNavigation";

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        .single();
      
      setProfile(profileData);
      await fetchRecordings();
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">
            Hi, {profile?.first_name || "there"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {recordings.length} {recordings.length === 1 ? "affirmation" : "affirmations"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <RecordingsList
          recordings={recordings}
          onRecordingsChange={fetchRecordings}
          playingId={playingId}
          onPlayToggle={handlePlayToggle}
        />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;

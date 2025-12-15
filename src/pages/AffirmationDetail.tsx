import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording, ToneAnalysisSnapshot } from "@/types";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { ArrowLeft, Mic, Play, Pause, Star, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const AffirmationDetail = () => {
  const { affirmationId } = useParams();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [toneSnapshots, setToneSnapshots] = useState<Map<string, ToneAnalysisSnapshot>>(new Map());
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, source, playSingleRecording, togglePlayPause } = useGlobalAudio();

  useEffect(() => {
    if (affirmationId) {
      fetchRecordings();
    }
  }, [affirmationId]);

  const fetchRecordings = async () => {
    try {
      // Fetch all recordings with this affirmation_id
      const { data: recordingsData, error: recordingsError } = await supabase
        .from("recordings")
        .select("*")
        .eq("affirmation_id", affirmationId)
        .order("created_at", { ascending: false });

      if (recordingsError) throw recordingsError;

      const typedRecordings = recordingsData as Recording[];
      setRecordings(typedRecordings);

      // Fetch tone analysis snapshots for all recordings
      if (typedRecordings.length > 0) {
        const recordingIds = typedRecordings.map(r => r.id);
        const { data: snapshotsData, error: snapshotsError } = await supabase
          .from("tone_analysis_snapshots")
          .select("*")
          .in("recording_id", recordingIds);

        if (!snapshotsError && snapshotsData) {
          // Get the latest snapshot per recording
          const snapshotMap = new Map<string, ToneAnalysisSnapshot>();
          for (const snapshot of snapshotsData) {
            const existing = snapshotMap.get(snapshot.recording_id);
            if (!existing || new Date(snapshot.created_at) > new Date(existing.created_at)) {
              snapshotMap.set(snapshot.recording_id, snapshot as ToneAnalysisSnapshot);
            }
          }
          setToneSnapshots(snapshotMap);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load recordings");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  // Get the affirmation text from the first recording (they should all have the same text)
  const affirmationText = useMemo(() => {
    return recordings.find(r => r.text)?.text || null;
  }, [recordings]);

  // Get the best take
  const bestTake = useMemo(() => {
    return recordings.find(r => r.is_best_take);
  }, [recordings]);

  const handleRecordNewTake = () => {
    navigate("/new-recording", {
      state: {
        prefilledText: affirmationText,
        affirmationId: affirmationId,
      },
    });
  };

  const handlePlayToggle = async (recording: Recording, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentTrack = source?.type === "single" && currentTrack?.id === recording.id;

    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      await playSingleRecording(recording, {
        mode: "once",
        repeatCount: 1,
        durationMinutes: 15,
      });
    }
  };

  const isRecordingPlaying = (recordingId: string) =>
    source?.type === "single" && currentTrack?.id === recordingId && isPlaying;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No recordings found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Affirmation Practice</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Affirmation Text */}
        {affirmationText && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <p className="text-lg leading-relaxed">{affirmationText}</p>
          </div>
        )}

        {/* Record New Take Button */}
        <Button onClick={handleRecordNewTake} className="w-full" size="lg">
          <Mic className="w-5 h-5 mr-2" />
          Record New Take
        </Button>

        {/* Takes List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">
            Your Takes ({recordings.length})
          </h2>

          {recordings.map((recording) => {
            const playing = isRecordingPlaying(recording.id);
            const snapshot = toneSnapshots.get(recording.id);
            const isBestTake = recording.is_best_take;

            return (
              <div
                key={recording.id}
                className="bg-card rounded-xl p-4 border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/recording/${recording.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {format(new Date(recording.created_at), "MMM d, yyyy")}
                      </p>
                      {isBestTake && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(recording.duration_seconds)}
                      {snapshot && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {snapshot.conviction_score}% conviction
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {snapshot ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {Math.round((snapshot.conviction_score + snapshot.sincerity_score) / 2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not analyzed</span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={(e) => handlePlayToggle(recording, e)}
                    >
                      {playing ? (
                        <Pause className="w-5 h-5 text-primary" fill="currentColor" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Over Time Section - placeholder for future chart */}
        {recordings.length > 1 && toneSnapshots.size > 1 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Progress Over Time
            </h3>
            <p className="text-sm text-muted-foreground">
              You've recorded {recordings.length} takes of this affirmation.
              {toneSnapshots.size > 0 && (
                <span> Average conviction: {Math.round(
                  Array.from(toneSnapshots.values()).reduce((sum, s) => sum + s.conviction_score, 0) / toneSnapshots.size
                )}%</span>
              )}
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AffirmationDetail;

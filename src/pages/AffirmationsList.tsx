import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ArrowLeft, Search, Layers, Star, TrendingUp } from "lucide-react";

interface AffirmationGroup {
  affirmation_id: string;
  text: string | null;
  recordings: Recording[];
  bestTake: Recording | undefined;
  latestRecording: Recording;
  totalTakes: number;
}

const AffirmationsList = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("recordings")
      .select("*")
      .eq("user_id", user.id)
      .not("affirmation_id", "is", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecordings(data as Recording[]);
    }
    setLoading(false);
  };

  // Group recordings by affirmation_id
  const affirmationGroups = useMemo(() => {
    const groups = new Map<string, AffirmationGroup>();

    for (const recording of recordings) {
      if (!recording.affirmation_id) continue;

      const existing = groups.get(recording.affirmation_id);
      if (existing) {
        existing.recordings.push(recording);
        existing.totalTakes++;
        if (recording.is_best_take) {
          existing.bestTake = recording;
        }
        if (new Date(recording.created_at) > new Date(existing.latestRecording.created_at)) {
          existing.latestRecording = recording;
        }
      } else {
        groups.set(recording.affirmation_id, {
          affirmation_id: recording.affirmation_id,
          text: recording.text,
          recordings: [recording],
          bestTake: recording.is_best_take ? recording : undefined,
          latestRecording: recording,
          totalTakes: 1,
        });
      }
    }

    return Array.from(groups.values())
      .sort((a, b) => new Date(b.latestRecording.created_at).getTime() - new Date(a.latestRecording.created_at).getTime());
  }, [recordings]);

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return affirmationGroups;
    const searchLower = search.toLowerCase();
    return affirmationGroups.filter(group =>
      group.text?.toLowerCase().includes(searchLower) ||
      group.latestRecording.title.toLowerCase().includes(searchLower)
    );
  }, [affirmationGroups, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">My Affirmations</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search affirmations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Groups */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">
              {affirmationGroups.length === 0
                ? "No affirmation recordings yet"
                : "No affirmations match your search"}
            </p>
            {affirmationGroups.length === 0 && (
              <Button onClick={() => navigate("/new-recording")}>
                Record Your First Affirmation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div
                key={group.affirmation_id}
                className="bg-card rounded-xl p-4 border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/affirmation/${group.affirmation_id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium line-clamp-2">
                        {group.text || group.latestRecording.title}
                      </p>
                      {group.bestTake && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {group.totalTakes} {group.totalTakes === 1 ? "take" : "takes"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{group.totalTakes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AffirmationsList;

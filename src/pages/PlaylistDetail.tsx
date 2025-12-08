import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Plus, GripVertical, Trash2, Shuffle, Volume2 } from "lucide-react";
import { usePlaylistPlayer } from "@/hooks/usePlaylistPlayer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BottomNavigation } from "@/components/BottomNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Playlist, Recording, PlaylistRecording } from "@/types";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [recordings, setRecordings] = useState<(Recording & { position: number })[]>([]);
  const [allRecordings, setAllRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Playlist player hook - handles sequential playback of all recordings
  const {
    isPlaying,
    currentTrackIndex,
    currentTrackId,
    togglePlayPause,
    stop,
  } = usePlaylistPlayer({
    recordings,
    shuffle: playlist?.shuffle ?? false,
    loopPlaylist: playlist?.loop_playlist ?? false,
    delaySeconds: playlist?.delay_seconds ?? 0,
  });

  useEffect(() => {
    if (id) {
      fetchPlaylist();
      fetchAllRecordings();
    }
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", id)
        .single();

      if (playlistError) throw playlistError;
      setPlaylist(playlistData as Playlist);

      const { data: prData, error: prError } = await supabase
        .from("playlist_recordings")
        .select("*, recordings(*)")
        .eq("playlist_id", id)
        .order("position");

      if (prError) throw prError;

      const recs = (prData || []).map((pr: any) => ({
        ...pr.recordings,
        position: pr.position,
      }));
      setRecordings(recs);
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllRecordings((data as Recording[]) || []);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    }
  };

  const addRecording = async (recordingId: string) => {
    try {
      const maxPosition = Math.max(...recordings.map((r) => r.position), -1);

      const { error } = await supabase.from("playlist_recordings").insert({
        playlist_id: id,
        recording_id: recordingId,
        position: maxPosition + 1,
      });

      if (error) throw error;

      toast({ title: "Recording added" });
      setAddDialogOpen(false);
      fetchPlaylist();
    } catch (error) {
      console.error("Error adding recording:", error);
      toast({
        title: "Failed to add recording",
        variant: "destructive",
      });
    }
  };

  const removeRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from("playlist_recordings")
        .delete()
        .eq("playlist_id", id)
        .eq("recording_id", recordingId);

      if (error) throw error;

      toast({ title: "Recording removed" });
      fetchPlaylist();
    } catch (error) {
      console.error("Error removing recording:", error);
    }
  };

  const updatePlaylistSettings = async (updates: Partial<Playlist>) => {
    if (!playlist) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setPlaylist({ ...playlist, ...updates });
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const availableRecordings = allRecordings.filter(
    (r) => !recordings.find((pr) => pr.id === r.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Playlist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/playlists")} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{playlist.title}</h1>
        </div>

        {/* Play Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={togglePlayPause}
            disabled={recordings.length === 0}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </button>
        </div>

        {/* Settings */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Shuffle</span>
            </div>
            <Switch
              checked={playlist.shuffle}
              onCheckedChange={(checked) =>
                updatePlaylistSettings({ shuffle: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Loop Playlist</span>
            <Switch
              checked={playlist.loop_playlist}
              onCheckedChange={(checked) =>
                updatePlaylistSettings({ loop_playlist: checked })
              }
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Delay between tracks</span>
              <span className="text-sm text-muted-foreground">
                {playlist.delay_seconds}s
              </span>
            </div>
            <Slider
              value={[playlist.delay_seconds]}
              onValueChange={([value]) =>
                updatePlaylistSettings({ delay_seconds: value })
              }
              max={10}
              step={1}
            />
          </div>
        </div>

        {/* Recordings */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Recordings</h2>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recording</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableRecordings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recordings available
                  </p>
                ) : (
                  availableRecordings.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => addRecording(rec.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(rec.duration_seconds)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {recordings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No recordings in this playlist
          </p>
        ) : (
          <div className="space-y-2">
            {recordings.map((rec, index) => (
              <div
                key={rec.id}
                className={`flex items-center gap-3 p-3 bg-card rounded-xl border transition-colors ${
                  currentTrackId === rec.id && isPlaying
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                {/* Playing indicator */}
                {currentTrackId === rec.id && isPlaying ? (
                  <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                ) : (
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground w-5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(rec.duration_seconds)}
                  </p>
                </div>
                <button
                  onClick={() => removeRecording(rec.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

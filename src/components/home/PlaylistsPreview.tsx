import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, ListMusic } from "lucide-react";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";

interface Playlist {
  id: string;
  title: string;
  loop_playlist: boolean;
  shuffle: boolean;
  delay_seconds: number;
}

export const PlaylistsPreview = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { playPlaylist, source, isPlaying, togglePlayPause } = useGlobalAudio();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const { data } = await supabase
      .from("playlists")
      .select("id, title, loop_playlist, shuffle, delay_seconds")
      .order("created_at", { ascending: false })
      .limit(3);

    setPlaylists(data || []);
  };

  const handleQuickPlay = async (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if this playlist is currently playing
    if (source?.type === "playlist" && source.id === playlist.id) {
      togglePlayPause();
      return;
    }
    
    // Fetch recordings for this playlist
    const { data: playlistRecordings } = await supabase
      .from("playlist_recordings")
      .select(`
        position,
        recording:recordings(*)
      `)
      .eq("playlist_id", playlist.id)
      .order("position");

    if (playlistRecordings && playlistRecordings.length > 0) {
      const recordings = playlistRecordings
        .filter(pr => pr.recording)
        .sort((a, b) => a.position - b.position)
        .map(pr => pr.recording as any);

      await playPlaylist(recordings, {
        playlistId: playlist.id,
        playlistTitle: playlist.title,
        shuffle: playlist.shuffle || false,
        delaySeconds: playlist.delay_seconds || 0,
        playbackSettings: {
          mode: playlist.loop_playlist ? "loop" : "once",
          repeatCount: 1,
          durationMinutes: 15,
        }
      });
    }
  };

  const isPlaylistPlaying = (playlistId: string) => 
    source?.type === "playlist" && source.id === playlistId && isPlaying;

  if (playlists.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListMusic className="w-5 h-5 text-primary" />
            <span className="font-semibold text-[17px]">Your Practice</span>
          </div>
          <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
            Create playlists to organize your affirmations into daily routines.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/playlists")}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-primary" />
            <span className="font-semibold text-[17px]">Your Practice</span>
          </div>
        </div>
        
        <div className="space-y-2.5">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <span className="font-medium truncate flex-1">{playlist.title}</span>
              <Button 
                variant="ghost" 
                size="icon"
                className="shrink-0"
                onClick={(e) => handleQuickPlay(playlist, e)}
              >
                <Play 
                  className={`w-4 h-4 ${isPlaylistPlaying(playlist.id) ? 'text-primary' : ''}`} 
                  fill={isPlaylistPlaying(playlist.id) ? 'currentColor' : 'none'}
                />
              </Button>
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-muted-foreground"
          onClick={() => navigate("/playlists")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Playlist
        </Button>
      </CardContent>
    </Card>
  );
};

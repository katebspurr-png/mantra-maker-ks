import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ListMusic, MoreVertical, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Playlist } from "@/types";

export default function Playlists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaylists((data as Playlist[]) || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("playlists").insert({
        title: newTitle.trim(),
        user_id: user.id,
      });

      if (error) throw error;

      toast({ title: "Playlist created" });
      setNewTitle("");
      setDialogOpen(false);
      fetchPlaylists();
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({
        title: "Failed to create playlist",
        variant: "destructive",
      });
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Playlist deleted" });
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        title: "Failed to delete playlist",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Playlists</h1>
            <p className="text-muted-foreground text-sm">
              Organize your affirmations
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Playlist name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
                />
                <Button onClick={createPlaylist} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-12">
            <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No playlists yet</p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">
              Create your first playlist
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <button
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="flex-1 text-left"
                >
                  <p className="font-medium">{playlist.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(playlist.created_at)}
                  </p>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => deletePlaylist(playlist.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

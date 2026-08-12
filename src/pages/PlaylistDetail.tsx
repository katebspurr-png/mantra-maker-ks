import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Plus, GripVertical, Trash2, Shuffle, Volume2, Pencil, Check, X } from "lucide-react";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PlaybackSettings, usePlaybackSettings } from "@/components/PlaybackSettings";
import { PlaybackStatus } from "@/components/PlaybackStatus";
import { PlaybackSpeedControl } from "@/components/PlaybackSpeedControl";
import { ZenMusicControl } from "@/components/ZenMusicControl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Playlist, Recording, PlaybackSettings as PlaybackSettingsType } from "@/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast as sonnerToast } from "sonner";

interface SortableRecordingItemProps {
  rec: Recording & { position: number };
  index: number;
  isCurrentlyPlaying: boolean;
  formatDuration: (seconds: number) => string;
  onRemove: (id: string) => void;
}

function SortableRecordingItem({
  rec,
  index,
  isCurrentlyPlaying,
  formatDuration,
  onRemove,
}: SortableRecordingItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card rounded-xl border transition-colors ${
        isCurrentlyPlaying
          ? "border-primary bg-primary/5"
          : "border-border"
      }`}
    >
      {/* Drag handle or playing indicator */}
      {isCurrentlyPlaying ? (
        <Volume2 className="w-4 h-4 text-primary animate-pulse" />
      ) : (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
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
        onClick={() => onRemove(rec.id)}
        className="p-2 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [recordings, setRecordings] = useState<(Recording & { position: number })[]>([]);
  const [allRecordings, setAllRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Playback settings with session persistence
  const { settings: playbackSettings, setSettings: setPlaybackSettings, saveAsDefault } = usePlaybackSettings();

  // Use global audio context for persistent playback
  const {
    isPlaying,
    currentTrack,
    source,
    playbackStatus,
    playbackSpeed,
    playPlaylist,
    togglePlayPause,
    updatePlaybackSettings,
    setPlaybackSpeed,
    zenEnabled,
    zenTrackId,
    zenVolume,
    zenDuckingIntensity,
    setZenEnabled,
    setZenTrackId,
    setZenVolume,
    setZenDuckingIntensity,
  } = useGlobalAudio();

  // Check if this playlist is currently playing in global player
  const isThisPlaylistPlaying = source?.type === "playlist" && source?.id === id;
  const currentTrackId = isThisPlaylistPlaying ? currentTrack?.id : null;

  // Load playlist zen settings into global context when visiting this page (if not currently playing)
  useEffect(() => {
    if (playlist && !isThisPlaylistPlaying) {
      setZenEnabled(playlist.zen_enabled);
      setZenTrackId(playlist.zen_track_id || "");
      setZenVolume(playlist.zen_volume);
      setZenDuckingIntensity(playlist.zen_ducking_intensity);
    }
  }, [playlist?.id]); // Only on playlist load, not on every zen change

  // Save zen settings to playlist DB when changed (and not during playback, which handles its own saving)
  const zenSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedZenRef = useRef(false);
  useEffect(() => {
    if (!playlist || !id) return;
    // Skip the initial load
    if (!hasLoadedZenRef.current) {
      hasLoadedZenRef.current = true;
      return;
    }
    // Debounce saves
    if (zenSaveTimeoutRef.current) clearTimeout(zenSaveTimeoutRef.current);
    zenSaveTimeoutRef.current = setTimeout(() => {
      supabase.from("playlists").update({
        zen_enabled: zenEnabled,
        zen_track_id: zenTrackId,
        zen_volume: zenVolume,
        zen_ducking_intensity: zenDuckingIntensity,
      }).eq("id", id).then(() => {
        // Update local state
        setPlaylist(prev => prev ? { ...prev, zen_enabled: zenEnabled, zen_track_id: zenTrackId, zen_volume: zenVolume, zen_ducking_intensity: zenDuckingIntensity } : prev);
      });
    }, 500);
    return () => { if (zenSaveTimeoutRef.current) clearTimeout(zenSaveTimeoutRef.current); };
  }, [zenEnabled, zenTrackId, zenVolume, zenDuckingIntensity, id, playlist]);

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

  const handlePlaybackSettingsChange = (newSettings: PlaybackSettingsType) => {
    setPlaybackSettings(newSettings);
    // Also update the global player if this playlist is playing
    if (isThisPlaylistPlaying) {
      updatePlaybackSettings(newSettings);
    }
  };

  const handleSaveAsDefault = () => {
    saveAsDefault();
    sonnerToast.success("Saved as default playback settings");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = recordings.findIndex((r) => r.id === active.id);
      const newIndex = recordings.findIndex((r) => r.id === over.id);

      const newRecordings = arrayMove(recordings, oldIndex, newIndex);
      setRecordings(newRecordings);

      // Update positions in database
      try {
        const updates = newRecordings.map((rec, index) => ({
          playlist_id: id,
          recording_id: rec.id,
          position: index,
        }));

        for (const update of updates) {
          await supabase
            .from("playlist_recordings")
            .update({ position: update.position })
            .eq("playlist_id", update.playlist_id)
            .eq("recording_id", update.recording_id);
        }
      } catch (error) {
        console.error("Error updating positions:", error);
        toast({
          title: "Failed to save order",
          variant: "destructive",
        });
        fetchPlaylist(); // Revert on error
      }
    }
  };

  /**
   * Handle play/pause - uses global audio context
   * PWA COMPATIBILITY: Called directly from user gesture (button click)
   */
  const handlePlayPause = async () => {
    if (!playlist || recordings.length === 0) return;
    
    if (isThisPlaylistPlaying) {
      // This playlist is already in global player, just toggle
      togglePlayPause();
    } else {
      // Start playing this playlist in global player
      await playPlaylist(recordings, {
        shuffle: playlist.shuffle ?? false,
        delaySeconds: playlist.delay_seconds ?? 0,
        playlistId: playlist.id,
        playlistTitle: playlist.title,
        playbackSettings: playbackSettings,
        zenSettings: {
          enabled: playlist.zen_enabled,
          trackId: playlist.zen_track_id ?? null,
          volume: playlist.zen_volume,
          duckingIntensity: playlist.zen_ducking_intensity,
        },
      });
    }
  };

  const startEditingTitle = useCallback(() => {
    if (!playlist) return;
    setEditTitle(playlist.title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  }, [playlist]);

  const saveTitle = useCallback(async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || !playlist || trimmed === playlist.title) {
      setIsEditingTitle(false);
      return;
    }
    await updatePlaylistSettings({ title: trimmed });
    setIsEditingTitle(false);
    sonnerToast.success("Playlist renamed");
  }, [editTitle, playlist]);

  const availableRecordings = allRecordings.filter(
    (r) => !recordings.find((pr) => pr.id === r.id)
  );

  // Determine display state
  const displayIsPlaying = isThisPlaylistPlaying && isPlaying;

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
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                ref={titleInputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                className="text-xl font-semibold h-9"
              />
              <button onClick={saveTitle} className="p-1.5 text-primary">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setIsEditingTitle(false)} className="p-1.5 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">{playlist.title}</h1>
              <button onClick={startEditingTitle} className="p-1.5 text-muted-foreground hover:text-foreground shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Play Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handlePlayPause}
            disabled={recordings.length === 0}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            {displayIsPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </button>
        </div>

        {/* Playback Status */}
        {displayIsPlaying && (
          <div className="mb-4">
            <PlaybackStatus
              mode={playbackStatus.mode}
              currentRepetition={playbackStatus.currentRepetition}
              totalRepetitions={playbackStatus.totalRepetitions}
              elapsedSeconds={playbackStatus.elapsedSeconds}
              totalDurationSeconds={playbackStatus.totalDurationSeconds}
              isPlaying={displayIsPlaying}
            />
            {playbackStatus.totalTracks > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-1">
                Track {playbackStatus.currentTrackNumber} of {playbackStatus.totalTracks}
              </p>
            )}
          </div>
        )}

        {/* Playback Speed */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <PlaybackSpeedControl
            speed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
          />
        </div>

        {/* Playback Settings */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <PlaybackSettings
            settings={playbackSettings}
            onChange={handlePlaybackSettingsChange}
            onSaveAsDefault={handleSaveAsDefault}
          />
        </div>

        {/* Playlist Settings */}
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

        {/* Background Sounds */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <ZenMusicControl />
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={recordings.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {recordings.map((rec, index) => (
                  <SortableRecordingItem
                    key={rec.id}
                    rec={rec}
                    index={index}
                    isCurrentlyPlaying={currentTrackId === rec.id && displayIsPlaying}
                    formatDuration={formatDuration}
                    onRemove={removeRecording}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

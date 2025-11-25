import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recording, LoopMode } from "@/types/recording";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AudioPlayer from "@/components/AudioPlayer";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const RecordingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedLoopMode, setEditedLoopMode] = useState<LoopMode>("infinite");

  useEffect(() => {
    fetchRecording();
  }, [id]);

  const fetchRecording = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setRecording(data);
      setEditedTitle(data.title);
      setEditedLoopMode(data.loop_mode);

      // Get signed URL for audio
      const { data: urlData } = await supabase.storage
        .from("recordings")
        .createSignedUrl(data.audio_file_path, 3600);

      if (urlData?.signedUrl) {
        setAudioUrl(urlData.signedUrl);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load recording");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!recording || !editedTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("recordings")
        .update({ title: editedTitle })
        .eq("id", recording.id);

      if (error) throw error;

      setRecording({ ...recording, title: editedTitle });
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update title");
    }
  };

  const handleSaveLoopMode = async (newMode: LoopMode) => {
    if (!recording) return;

    try {
      const { error } = await supabase
        .from("recordings")
        .update({ loop_mode: newMode })
        .eq("id", recording.id);

      if (error) throw error;

      setRecording({ ...recording, loop_mode: newMode });
      setEditedLoopMode(newMode);
      toast.success("Loop mode updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update loop mode");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!recording || !audioUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Recording</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
          {/* Title Section */}
          <div className="space-y-3">
            {isEditingTitle ? (
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    disabled={!editedTitle.trim()}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(recording.title);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{recording.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(recording.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Audio Player */}
          <AudioPlayer
            audioUrl={audioUrl}
            loopMode={editedLoopMode}
            duration={recording.duration_seconds}
          />

          {/* Loop Mode Selection */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Loop Mode</Label>
            <RadioGroup
              value={editedLoopMode}
              onValueChange={(value) => handleSaveLoopMode(value as LoopMode)}
            >
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="once" id="detail-once" />
                <Label htmlFor="detail-once" className="flex-1 cursor-pointer font-normal">
                  Play once
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="three_times" id="detail-three" />
                <Label htmlFor="detail-three" className="flex-1 cursor-pointer font-normal">
                  Loop 3 times
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="infinite" id="detail-infinite" />
                <Label htmlFor="detail-infinite" className="flex-1 cursor-pointer font-normal">
                  Loop until I stop
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingDetail;
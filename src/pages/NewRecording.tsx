import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AudioRecorder from "@/components/AudioRecorder";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LoopMode } from "@/types/recording";

const NewRecording = () => {
  const navigate = useNavigate();
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [loopMode, setLoopMode] = useState<LoopMode>("infinite");
  const [saving, setSaving] = useState(false);

  const handleRecordingComplete = (blob: Blob, recordingDuration: number) => {
    setRecordingBlob(blob);
    setDuration(recordingDuration);
    
    // Generate default title
    const now = new Date();
    const defaultTitle = `Recording ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    setTitle(defaultTitle);
  };

  const handleSave = async () => {
    if (!recordingBlob) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload audio file
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(fileName, recordingBlob, {
          contentType: recordingBlob.type,
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase.from("recordings").insert({
        user_id: user.id,
        title,
        duration_seconds: duration,
        audio_file_path: fileName,
        loop_mode: loopMode,
      });

      if (dbError) throw dbError;

      toast.success("Recording saved!");
      navigate("/");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save recording");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (recordingBlob) {
      if (confirm("Discard this recording?")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDiscard}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">New Recording</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!recordingBlob ? (
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        ) : (
          <div className="space-y-6 animate-in">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="text-center space-y-2 mb-6">
                <div className="text-3xl font-bold text-primary">
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
                </div>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Recording title"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Loop Mode</Label>
                  <RadioGroup value={loopMode} onValueChange={(value) => setLoopMode(value as LoopMode)}>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="once" id="once" />
                      <Label htmlFor="once" className="flex-1 cursor-pointer font-normal">
                        Play once
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="three_times" id="three_times" />
                      <Label htmlFor="three_times" className="flex-1 cursor-pointer font-normal">
                        Loop 3 times
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="infinite" id="infinite" />
                      <Label htmlFor="infinite" className="flex-1 cursor-pointer font-normal">
                        Loop until I stop
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 touch-target"
                onClick={handleDiscard}
                disabled={saving}
              >
                Discard
              </Button>
              <Button
                className="flex-1 touch-target"
                onClick={handleSave}
                disabled={saving || !title.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRecording;
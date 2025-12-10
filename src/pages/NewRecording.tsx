import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AudioRecorder from "@/components/AudioRecorder";
import { Teleprompter } from "@/components/Teleprompter";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LoopMode } from "@/types";

const NewRecording = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledText = (location.state as { prefilledText?: string })?.prefilledText || "";
  
  const [teleprompterText, setTeleprompterText] = useState(prefilledText);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [loopMode, setLoopMode] = useState<LoopMode>(() => {
    const saved = localStorage.getItem("defaultLoopMode") as LoopMode;
    return saved || "infinite";
  });
  const [saving, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Clear location state after reading
    if (prefilledText) {
      window.history.replaceState({}, document.title);
    }
  }, [prefilledText]);

  const handleRecordingComplete = (blob: Blob, recordingDuration: number) => {
    setRecordingBlob(blob);
    setDuration(recordingDuration);
    setIsRecording(false);
    
    // Generate default title
    const now = new Date();
    const defaultTitle = teleprompterText
      ? teleprompterText.slice(0, 30) + (teleprompterText.length > 30 ? "..." : "")
      : `Affirmation – ${now.toLocaleDateString()}`;
    setTitle(defaultTitle);
  };

  const handleSave = async () => {
    if (!recordingBlob) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(fileName, recordingBlob, {
          contentType: recordingBlob.type,
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("recordings").insert({
        user_id: user.id,
        title,
        duration_seconds: duration,
        audio_file_path: fileName,
        loop_mode: loopMode,
        text: teleprompterText || null,
      });

      if (dbError) throw dbError;

      toast.success("Affirmation saved!");
      navigate("/home");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (recordingBlob) {
      if (confirm("Discard this recording?")) {
        setRecordingBlob(null);
        setDuration(0);
        setTitle("");
      }
    } else {
      navigate("/home");
    }
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={handleDiscard} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">New Recording</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!recordingBlob ? (
          <div className="space-y-6">
            {/* Teleprompter with auto-scroll, text size controls, and play/pause */}
            <Teleprompter
              value={teleprompterText}
              onChange={setTeleprompterText}
              disabled={isRecording}
              placeholder="Type or paste your affirmation here to read while recording..."
              isRecording={isRecording}
            />

            {/* Recorder - works seamlessly with teleprompter in PWA and web */}
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in">
            {/* Show teleprompter text if present */}
            {teleprompterText && (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground mb-1">Your affirmation:</p>
                <p className="text-base">{teleprompterText}</p>
              </div>
            )}

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
                    placeholder="Affirmation title"
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

      <BottomNavigation />
    </div>
  );
};

export default NewRecording;

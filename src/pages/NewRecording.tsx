import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeleprompterDisplay, TeleprompterDisplayRef } from "@/components/TeleprompterDisplay";
import { TeleprompterSettings } from "@/components/TeleprompterSettings";
import { RecordingControls } from "@/components/RecordingControls";
import { TextInputArea } from "@/components/TextInputArea";
import { AudioPreviewPlayer } from "@/components/AudioPreviewPlayer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TagInput } from "@/components/TagInput";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoopMode } from "@/types";
import { generateAffirmationId } from "@/hooks/useAffirmationId";

const DEFAULT_WPM = 120;

const NewRecording = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { 
    prefilledText?: string; 
    affirmationId?: string;
  } | null;
  const prefilledText = locationState?.prefilledText || "";
  const existingAffirmationId = locationState?.affirmationId || null;
  
  const [affirmationText, setAffirmationText] = useState(prefilledText);
  const [isEditMode, setIsEditMode] = useState(!prefilledText);
  
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingKey, setRecordingKey] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  
  const [title, setTitle] = useState("");
  const [loopMode, setLoopMode] = useState<LoopMode>(() => {
    const saved = localStorage.getItem("defaultLoopMode") as LoopMode;
    return saved || "infinite";
  });
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const [teleprompterEnabled, setTeleprompterEnabled] = useState(true);
  const [karaokeEnabled, setKaraokeEnabled] = useState(true);
  const [textSizeIndex, setTextSizeIndex] = useState(() => {
    const saved = sessionStorage.getItem("teleprompterTextSize");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [manualMode] = useState(false);

  const [calibratedWpm] = useState<number | null>(() => {
    const saved = localStorage.getItem("teleprompter_calibrated_wpm");
    return saved ? parseInt(saved, 10) : null;
  });
  const [wpm, setWpm] = useState(() => {
    const savedWpm = sessionStorage.getItem("teleprompter_wpm");
    if (savedWpm) return parseInt(savedWpm, 10);
    const cal = localStorage.getItem("teleprompter_calibrated_wpm");
    return cal ? parseInt(cal, 10) : DEFAULT_WPM;
  });
  const [currentCalibratedWpm, setCurrentCalibratedWpm] = useState(calibratedWpm);

  const teleprompterRef = useRef<TeleprompterDisplayRef>(null);

  useEffect(() => {
    if (prefilledText) {
      window.history.replaceState({}, document.title);
    }
  }, [prefilledText]);

  useEffect(() => {
    sessionStorage.setItem("teleprompterTextSize", textSizeIndex.toString());
  }, [textSizeIndex]);

  useEffect(() => {
    sessionStorage.setItem("teleprompter_wpm", wpm.toString());
  }, [wpm]);

  const handleRecordingComplete = (blob: Blob, recordingDuration: number) => {
    setRecordingBlob(blob);
    setDuration(recordingDuration);
    setIsRecording(false);
    
    const now = new Date();
    const defaultTitle = affirmationText
      ? affirmationText.slice(0, 30) + (affirmationText.length > 30 ? "..." : "")
      : `Affirmation – ${now.toLocaleDateString()}`;
    setTitle(defaultTitle);
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
    if (teleprompterEnabled && karaokeEnabled && affirmationText.trim()) {
      teleprompterRef.current?.startHighlighting();
    }
  };

  const handleRecordingPause = () => {
    if (teleprompterEnabled && karaokeEnabled) {
      teleprompterRef.current?.pauseHighlighting();
    }
  };

  const handleRecordingResume = () => {
    if (teleprompterEnabled && karaokeEnabled) {
      teleprompterRef.current?.resumeHighlighting();
    }
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    if (teleprompterEnabled && karaokeEnabled) {
      teleprompterRef.current?.stopHighlighting();
    }
  };

  const handleResetHighlight = () => {
    teleprompterRef.current?.resetHighlighting();
  };

  const handleCalibrated = (newWpm: number) => {
    setCurrentCalibratedWpm(newWpm);
    setWpm(newWpm);
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

      const affirmationIdToUse = existingAffirmationId 
        || (affirmationText.trim() ? generateAffirmationId() : null);

      const zenDefaults = (() => {
        try {
          const raw = localStorage.getItem("zen-default-settings");
          return raw ? JSON.parse(raw) : null;
        } catch { return null; }
      })();

      const { error: dbError } = await supabase.from("recordings").insert({
        user_id: user.id,
        title,
        duration_seconds: duration,
        audio_file_path: fileName,
        loop_mode: loopMode,
        text: affirmationText || null,
        tags: tags,
        affirmation_id: affirmationIdToUse,
        ...(zenDefaults ? {
          zen_enabled: zenDefaults.enabled,
          zen_track_id: zenDefaults.trackId,
          zen_volume: zenDefaults.volume,
          zen_ducking_intensity: zenDefaults.duckingIntensity,
        } : {}),
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

  const handleTryAgain = () => {
    setPreviewKey(prev => prev + 1);
    setRecordingBlob(null);
    setDuration(0);
    setTitle("");
    teleprompterRef.current?.resetHighlighting();
    setRecordingKey(prev => prev + 1);
  };

  const handleDiscard = () => {
    if (recordingBlob) {
      setShowDiscardDialog(true);
    } else {
      navigate("/home");
    }
  };

  const confirmDiscard = () => {
    setPreviewKey(prev => prev + 1);
    setRecordingBlob(null);
    setDuration(0);
    setTitle("");
    setTags([]);
    setShowDiscardDialog(false);
    navigate("/home");
  };

  const handleBack = () => {
    if (recordingBlob) {
      setShowDiscardDialog(true);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header — minimal, borderless */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-5 py-5">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-muted/60 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-medium tracking-tight text-foreground/90">New Recording</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4">
        {!recordingBlob ? (
          <div className="space-y-8">
            {/* Text Input or Teleprompter Display */}
            {isEditMode ? (
              <TextInputArea
                value={affirmationText}
                onChange={setAffirmationText}
                disabled={isRecording}
                placeholder="Type or paste your affirmation here to read while recording..."
                onPreviewClick={affirmationText.trim() ? () => setIsEditMode(false) : undefined}
              />
            ) : (
              <div className="space-y-6">
                <TeleprompterDisplay
                  ref={teleprompterRef}
                  text={affirmationText}
                  karaokeEnabled={teleprompterEnabled && karaokeEnabled}
                  textSizeIndex={textSizeIndex}
                  wpm={wpm}
                  manualMode={manualMode}
                  onEditClick={() => setIsEditMode(true)}
                  isEditable={!isRecording}
                />

                <TeleprompterSettings
                  teleprompterEnabled={teleprompterEnabled}
                  onTeleprompterEnabledChange={setTeleprompterEnabled}
                  karaokeEnabled={karaokeEnabled}
                  onKaraokeEnabledChange={setKaraokeEnabled}
                  textSizeIndex={textSizeIndex}
                  onTextSizeChange={setTextSizeIndex}
                  wpm={wpm}
                  onWpmChange={setWpm}
                  calibratedWpm={currentCalibratedWpm}
                  onCalibrated={handleCalibrated}
                />
              </div>
            )}

            {/* Recording Controls */}
            <RecordingControls
              key={recordingKey}
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
              onRecordingPause={handleRecordingPause}
              onRecordingResume={handleRecordingResume}
              onRecordingStop={handleRecordingStop}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in">
            {recordingBlob && (
              <AudioPreviewPlayer
                key={previewKey}
                audioBlob={recordingBlob}
                duration={duration}
              />
            )}

            {affirmationText && (
              <div className="rounded-2xl bg-muted/30 p-5">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Your affirmation</p>
                <p className="text-lg leading-relaxed text-foreground/90">{affirmationText}</p>
              </div>
            )}

            <div className="rounded-2xl p-6 shadow-[var(--shadow-soft)] bg-card">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Affirmation title"
                    className="border-0 bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tags (optional)</Label>
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    placeholder="Add tags (e.g., morning, sleep)..."
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Loop Mode</Label>
                  <RadioGroup value={loopMode} onValueChange={(value) => setLoopMode(value as LoopMode)}>
                    <div className="flex items-center space-x-3 rounded-xl p-4 hover:bg-muted/40 transition-colors cursor-pointer">
                      <RadioGroupItem value="once" id="once" />
                      <Label htmlFor="once" className="flex-1 cursor-pointer font-normal text-sm">
                        Play once
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-xl p-4 hover:bg-muted/40 transition-colors cursor-pointer">
                      <RadioGroupItem value="three_times" id="three_times" />
                      <Label htmlFor="three_times" className="flex-1 cursor-pointer font-normal text-sm">
                        Loop 3 times
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-xl p-4 hover:bg-muted/40 transition-colors cursor-pointer">
                      <RadioGroupItem value="infinite" id="infinite" />
                      <Label htmlFor="infinite" className="flex-1 cursor-pointer font-normal text-sm">
                        Loop until I stop
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                className="w-full touch-target h-14 text-base font-medium rounded-2xl shadow-[var(--shadow-medium)]"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                size="lg"
              >
                {saving ? "Saving..." : "Save Recording"}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full touch-target text-muted-foreground hover:text-foreground hover:bg-muted/40"
                onClick={handleTryAgain}
                disabled={saving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                variant="ghost"
                className="w-full touch-target text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                onClick={handleDiscard}
                disabled={saving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Discard
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard recording?</AlertDialogTitle>
            <AlertDialogDescription>
              This recording will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NewRecording;

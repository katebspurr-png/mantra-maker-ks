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

/**
 * NewRecording Page
 * 
 * Recording controls and teleprompter are INDEPENDENT:
 * - Recording controls affect audio capture only
 * - Teleprompter controls affect text display/highlighting only
 * - Full text is always visible when teleprompter is enabled
 */

const NewRecording = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { 
    prefilledText?: string; 
    affirmationId?: string;
  } | null;
  const prefilledText = locationState?.prefilledText || "";
  const existingAffirmationId = locationState?.affirmationId || null;
  
  // Text state
  const [affirmationText, setAffirmationText] = useState(prefilledText);
  const [isEditMode, setIsEditMode] = useState(!prefilledText);
  
  // Recording state
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingKey, setRecordingKey] = useState(0); // Key to force RecordingControls remount
  const [previewKey, setPreviewKey] = useState(0); // Key to force AudioPreviewPlayer remount
  
  // Save form state
  const [title, setTitle] = useState("");
  const [loopMode, setLoopMode] = useState<LoopMode>(() => {
    const saved = localStorage.getItem("defaultLoopMode") as LoopMode;
    return saved || "infinite";
  });
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Discard dialog state
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Teleprompter settings state
  const [teleprompterEnabled, setTeleprompterEnabled] = useState(true);
  const [karaokeEnabled, setKaraokeEnabled] = useState(true);
  const [textSizeIndex, setTextSizeIndex] = useState(() => {
    const saved = sessionStorage.getItem("teleprompterTextSize");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [paceIndex, setPaceIndex] = useState(() => {
    const saved = sessionStorage.getItem("teleprompterPace");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [manualMode, setManualMode] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);

  // Ref to control teleprompter display
  const teleprompterRef = useRef<TeleprompterDisplayRef>(null);

  useEffect(() => {
    // Clear location state after reading
    if (prefilledText) {
      window.history.replaceState({}, document.title);
    }
  }, [prefilledText]);

  // Persist teleprompter settings
  useEffect(() => {
    sessionStorage.setItem("teleprompterTextSize", textSizeIndex.toString());
  }, [textSizeIndex]);

  useEffect(() => {
    sessionStorage.setItem("teleprompterPace", paceIndex.toString());
  }, [paceIndex]);

  // Sync highlighting state from teleprompter ref
  const updateHighlightingState = useCallback(() => {
    if (teleprompterRef.current) {
      setIsHighlighting(teleprompterRef.current.isHighlighting());
    }
  }, []);

  const handleRecordingComplete = (blob: Blob, recordingDuration: number) => {
    setRecordingBlob(blob);
    setDuration(recordingDuration);
    setIsRecording(false);
    
    // Generate default title
    const now = new Date();
    const defaultTitle = affirmationText
      ? affirmationText.slice(0, 30) + (affirmationText.length > 30 ? "..." : "")
      : `Affirmation – ${now.toLocaleDateString()}`;
    setTitle(defaultTitle);
  };

  // Recording lifecycle callbacks - sync with teleprompter as UX convenience
  const handleRecordingStart = () => {
    setIsRecording(true);
    
    // If teleprompter + karaoke enabled, auto-start highlighting
    if (teleprompterEnabled && karaokeEnabled && affirmationText.trim()) {
      teleprompterRef.current?.startHighlighting();
      setTimeout(updateHighlightingState, 100);
    }
  };

  const handleRecordingPause = () => {
    // Also pause highlighting for nice UX sync
    if (teleprompterEnabled && karaokeEnabled) {
      teleprompterRef.current?.pauseHighlighting();
      setTimeout(updateHighlightingState, 100);
    }
  };

  const handleRecordingResume = () => {
    // Also resume highlighting for nice UX sync
    if (teleprompterEnabled && karaokeEnabled) {
      teleprompterRef.current?.resumeHighlighting();
      setTimeout(updateHighlightingState, 100);
    }
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    // Stop highlighting when recording stops
    if (teleprompterEnabled && karaokeEnabled) {
      teleprompterRef.current?.stopHighlighting();
      setTimeout(updateHighlightingState, 100);
    }
  };

  // Independent teleprompter highlight controls
  const handlePauseHighlight = () => {
    teleprompterRef.current?.pauseHighlighting();
    setTimeout(updateHighlightingState, 100);
  };

  const handleResumeHighlight = () => {
    teleprompterRef.current?.resumeHighlighting();
    setTimeout(updateHighlightingState, 100);
  };

  const handleResetHighlight = () => {
    teleprompterRef.current?.resetHighlighting();
    setTimeout(updateHighlightingState, 100);
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

      // Determine affirmation_id: reuse existing or generate new if there's text
      const affirmationIdToUse = existingAffirmationId 
        || (affirmationText.trim() ? generateAffirmationId() : null);

      // Load saved zen defaults for new recordings
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

  // Try Again: clears recording, resets timer & karaoke, keeps text/settings/tags
  const handleTryAgain = () => {
    // Force preview player to stop and cleanup (via key change)
    setPreviewKey(prev => prev + 1);
    
    // Release the recording blob
    setRecordingBlob(null);
    setDuration(0);
    setTitle("");
    
    // Reset karaoke highlighting to beginning
    teleprompterRef.current?.resetHighlighting();
    setTimeout(updateHighlightingState, 100);
    
    // Force RecordingControls to remount fresh (resets internal timer)
    setRecordingKey(prev => prev + 1);
    
    // Keep: affirmationText, tags, teleprompter settings (they're preserved automatically)
  };

  // Discard: show confirmation, then navigate away
  const handleDiscard = () => {
    if (recordingBlob) {
      setShowDiscardDialog(true);
    } else {
      navigate("/home");
    }
  };

  const confirmDiscard = () => {
    // Force preview player to stop and cleanup
    setPreviewKey(prev => prev + 1);
    
    setRecordingBlob(null);
    setDuration(0);
    setTitle("");
    setTags([]);
    setShowDiscardDialog(false);
    navigate("/home");
  };

  // Back button behavior
  const handleBack = () => {
    if (recordingBlob) {
      setShowDiscardDialog(true);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">New Recording</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!recordingBlob ? (
          <div className="space-y-6">
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
              <>
                {/* Teleprompter Display - always shows full text */}
                <TeleprompterDisplay
                  ref={teleprompterRef}
                  text={affirmationText}
                  karaokeEnabled={teleprompterEnabled && karaokeEnabled}
                  textSizeIndex={textSizeIndex}
                  paceIndex={paceIndex}
                  manualMode={manualMode}
                  onEditClick={() => setIsEditMode(true)}
                  isEditable={!isRecording}
                />

                {/* Teleprompter Settings - independent controls */}
                <TeleprompterSettings
                  teleprompterEnabled={teleprompterEnabled}
                  onTeleprompterEnabledChange={setTeleprompterEnabled}
                  karaokeEnabled={karaokeEnabled}
                  onKaraokeEnabledChange={setKaraokeEnabled}
                  textSizeIndex={textSizeIndex}
                  onTextSizeChange={setTextSizeIndex}
                  paceIndex={paceIndex}
                  onPaceChange={setPaceIndex}
                  manualMode={manualMode}
                  onManualModeChange={setManualMode}
                  isHighlighting={isHighlighting}
                  onPauseHighlight={handlePauseHighlight}
                  onResumeHighlight={handleResumeHighlight}
                  onResetHighlight={handleResetHighlight}
                />
              </>
            )}

            {/* Recording Controls - primary, at bottom */}
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
          <div className="space-y-6 animate-in">
            {/* Audio Preview with Waveform */}
            {recordingBlob && (
              <AudioPreviewPlayer
                key={previewKey}
                audioBlob={recordingBlob}
                duration={duration}
              />
            )}

            {/* Show affirmation text if present */}
            {affirmationText && (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground mb-1">Your affirmation:</p>
                <p className="text-base">{affirmationText}</p>
              </div>
            )}

            {/* Metadata form */}
            <div className="bg-card rounded-2xl p-6 border border-border">
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

                {/* Tags Input */}
                <div className="space-y-2">
                  <Label>Tags (optional)</Label>
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    placeholder="Add tags (e.g., morning, sleep)..."
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

            {/* Action buttons with clear hierarchy */}
            <div className="space-y-3">
              {/* Primary: Save */}
              <Button
                className="w-full touch-target"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                size="lg"
              >
                {saving ? "Saving..." : "Save Recording"}
              </Button>
              
              {/* Secondary: Try Again */}
              <Button
                variant="outline"
                className="w-full touch-target"
                onClick={handleTryAgain}
                disabled={saving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              {/* Tertiary/Destructive: Discard */}
              <Button
                variant="ghost"
                className="w-full touch-target text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Discard confirmation dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
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

import { useState, useRef, useCallback } from "react";
import { Volume2, AudioLines, Play, Square, Check, ChevronDown, Music, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { MUSIC_TRACKS, SOUND_TRACKS, ZEN_TRACKS, NONE_TRACK_ID, DEFAULT_MUSIC_TRACK_ID, ZenTrack } from "@/data/zenTracks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LS_KEY = "zen-default-settings";

export interface ZenDefaultSettings {
  trackId: string;
  volume: number;
  duckingIntensity: number;
  enabled: boolean;
}

export function getZenDefaults(): ZenDefaultSettings | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface ZenMusicControlProps {
  compact?: boolean;
}

export function ZenMusicControl({ compact }: ZenMusicControlProps) {
  const {
    zenEnabled, zenVolume, zenTrackId, zenDuckingIntensity,
    setZenEnabled, setZenVolume, setZenTrackId, setZenDuckingIntensity,
  } = useGlobalAudio();

  const [musicExpanded, setMusicExpanded] = useState(false);

  if (compact) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setZenEnabled(!zenEnabled); }}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          zenEnabled ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
        )}
        title={zenEnabled ? "Background sounds on" : "Background sounds off"}
      >
        <Volume2 className="w-4 h-4" />
      </button>
    );
  }

  const effectiveTrackId = zenEnabled ? zenTrackId : NONE_TRACK_ID;
  const currentTrack = ZEN_TRACKS.find(t => t.id === effectiveTrackId);
  const isMusicSelected = zenEnabled && MUSIC_TRACKS.some(t => t.id === zenTrackId);
  const selectedMusicTrack = MUSIC_TRACKS.find(t => t.id === zenTrackId);

  const handleSelectSound = (trackId: string) => {
    if (trackId === NONE_TRACK_ID) {
      setZenEnabled(false);
      setMusicExpanded(false);
    } else {
      if (!zenEnabled) setZenEnabled(true);
      setZenTrackId(trackId);
      setMusicExpanded(false);
    }
  };

  const handleMusicTileClick = () => {
    if (!zenEnabled) setZenEnabled(true);
    // If not currently on a music track, select default
    if (!MUSIC_TRACKS.some(t => t.id === zenTrackId)) {
      setZenTrackId(DEFAULT_MUSIC_TRACK_ID);
    }
    setMusicExpanded(prev => !prev);
  };

  const handleSaveDefault = () => {
    const settings: ZenDefaultSettings = {
      trackId: zenTrackId,
      volume: zenVolume,
      duckingIntensity: zenDuckingIntensity,
      enabled: zenEnabled,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
    toast.success("Default saved!");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Label className="font-medium">Background Sounds</Label>
        </div>
        <Switch checked={zenEnabled} onCheckedChange={setZenEnabled} />
      </div>

      {/* Sound picker grid: None + Music tile + 4 sound tiles = 6 tiles, 3 cols */}
      <div className="grid grid-cols-3 gap-2">
        {/* None */}
        <SoundOption
          id={NONE_TRACK_ID}
          title="None"
          icon="🔇"
          isSelected={!zenEnabled || effectiveTrackId === NONE_TRACK_ID}
          onSelect={() => handleSelectSound(NONE_TRACK_ID)}
        />

        {/* Music tile (expandable) */}
        <button
          onClick={handleMusicTileClick}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition-all min-h-[76px]",
            isMusicSelected
              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
              : "border-border bg-card hover:bg-accent/50 text-foreground"
          )}
        >
          {isMusicSelected && (
            <div className="absolute top-1.5 right-1.5">
              <Check className="w-3 h-3 text-primary" />
            </div>
          )}
          <Music className="w-5 h-5" />
          <span className="text-xs font-medium leading-tight text-center truncate w-full">
            {isMusicSelected && selectedMusicTrack ? selectedMusicTrack.title : "Music"}
          </span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", musicExpanded && "rotate-180")} />
        </button>

        {/* Sound tiles */}
        {SOUND_TRACKS.map(track => (
          <SoundOption
            key={track.id}
            id={track.id}
            title={track.title}
            icon={track.icon}
            previewUrl={track.previewUrl || track.url}
            isSelected={zenEnabled && zenTrackId === track.id}
            onSelect={() => handleSelectSound(track.id)}
          />
        ))}
      </div>

      {/* Music dropdown (expandable list) */}
      {musicExpanded && (
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          {MUSIC_TRACKS.map(track => (
            <MusicDropdownItem
              key={track.id}
              track={track}
              isSelected={zenEnabled && zenTrackId === track.id}
              onSelect={() => {
                if (!zenEnabled) setZenEnabled(true);
                setZenTrackId(track.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Volume, ducking, attribution — only when a sound is selected */}
      {zenEnabled && (
        <div className="space-y-3 animate-in fade-in">
          {/* Volume slider */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-sm text-muted-foreground">Volume</Label>
              <span className="text-xs text-muted-foreground ml-auto">{Math.round(zenVolume * 100)}%</span>
            </div>
            <Slider value={[zenVolume]} max={1} step={0.05} onValueChange={([v]) => setZenVolume(v)} className="w-full" />
          </div>

          {/* Ducking intensity slider */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AudioLines className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-sm text-muted-foreground">Voice Ducking</Label>
              <span className="text-xs text-muted-foreground ml-auto">{Math.round(zenDuckingIntensity * 100)}%</span>
            </div>
            <Slider value={[zenDuckingIntensity]} min={0} max={1} step={0.05} onValueChange={([v]) => setZenDuckingIntensity(v)} className="w-full" />
            <p className="text-[10px] text-muted-foreground/60">How much to lower music during voice playback</p>
          </div>

          {/* Dynamic attribution */}
          {currentTrack && (
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              {currentTrack.title} by {currentTrack.artist} • {currentTrack.license}
            </p>
          )}

          {/* Save as Default */}
          <button
            onClick={handleSaveDefault}
            className="flex items-center justify-center gap-1.5 text-xs font-medium w-full py-2 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 text-foreground transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save as Default
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SoundOption — A single tile in the picker grid                    */
/* ------------------------------------------------------------------ */

interface SoundOptionProps {
  id: string;
  title: string;
  icon: string;
  previewUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

function SoundOption({ id, title, icon, previewUrl, isSelected, onSelect }: SoundOptionProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPreview = useCallback(() => {
    if (previewTimerRef.current) { clearTimeout(previewTimerRef.current); previewTimerRef.current = null; }
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current.currentTime = 0; }
    setIsPreviewing(false);
  }, []);

  const togglePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewUrl) return;
    if (isPreviewing) { stopPreview(); return; }
    if (!previewAudioRef.current) previewAudioRef.current = new Audio();
    const audio = previewAudioRef.current;
    audio.src = previewUrl;
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setIsPreviewing(true);
    previewTimerRef.current = setTimeout(() => stopPreview(), 10000);
    audio.onended = () => stopPreview();
  }, [previewUrl, isPreviewing, stopPreview]);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition-all min-h-[76px]",
        isSelected
          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
          : "border-border bg-card hover:bg-accent/50 text-foreground"
      )}
    >
      {isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <Check className="w-3 h-3 text-primary" />
        </div>
      )}
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-xs font-medium leading-tight text-center">{title}</span>
      {previewUrl && (
        <button
          onClick={togglePreview}
          className={cn(
            "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
            isPreviewing
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={isPreviewing ? "Stop preview" : "Preview 10s"}
        >
          {isPreviewing ? <Square className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
        </button>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  MusicDropdownItem — A row inside the expandable music list        */
/* ------------------------------------------------------------------ */

interface MusicDropdownItemProps {
  track: ZenTrack;
  isSelected: boolean;
  onSelect: () => void;
}

function MusicDropdownItem({ track, isSelected, onSelect }: MusicDropdownItemProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPreview = useCallback(() => {
    if (previewTimerRef.current) { clearTimeout(previewTimerRef.current); previewTimerRef.current = null; }
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current.currentTime = 0; }
    setIsPreviewing(false);
  }, []);

  const togglePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewing) { stopPreview(); return; }
    if (!previewAudioRef.current) previewAudioRef.current = new Audio();
    const audio = previewAudioRef.current;
    audio.src = track.previewUrl || track.url;
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setIsPreviewing(true);
    previewTimerRef.current = setTimeout(() => stopPreview(), 10000);
    audio.onended = () => stopPreview();
  }, [isPreviewing, stopPreview, track]);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors border-b border-border last:border-b-0",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent/50 text-foreground"
      )}
    >
      <span className="text-base leading-none">{track.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{track.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{track.artist} • {track.license}</p>
      </div>
      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
      <button
        onClick={togglePreview}
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0",
          isPreviewing
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        title={isPreviewing ? "Stop preview" : "Preview 10s"}
      >
        {isPreviewing ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>
    </button>
  );
}

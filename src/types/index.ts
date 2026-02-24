export type LoopMode = "once" | "three_times" | "infinite";
export type TimerMode = "none" | "5" | "10" | "15" | "custom";

// New playback mode types
export type PlaybackMode = "once" | "loop" | "repeat" | "duration";

export interface PlaybackSettings {
  mode: PlaybackMode;
  repeatCount: number;      // For "repeat" mode
  durationMinutes: number;  // For "duration" mode
}

export const DEFAULT_PLAYBACK_SETTINGS: PlaybackSettings = {
  mode: "loop",
  repeatCount: 10,
  durationMinutes: 15,
};

export interface Recording {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  duration_seconds: number;
  audio_file_path: string;
  loop_mode: LoopMode;
  text?: string | null;
  is_favorite?: boolean;
  is_best_take?: boolean;
  tags?: string[];
  affirmation_id?: string | null;
  // Per-recording zen background music preferences
  zen_enabled?: boolean;
  zen_track_id?: string | null;
  zen_volume?: number;
  zen_ducking_intensity?: number;
}

export interface ToneAnalysisSnapshot {
  id: string;
  user_id: string;
  recording_id: string;
  created_at: string;
  sincerity_score: number;
  conviction_score: number;
  confidence_score?: number | null;
  summary: string;
  strengths?: string[] | null;
  improvements?: string[] | null;
  practice_exercise?: string | null;
  model_version?: string | null;
  signals?: Record<string, unknown> | null;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  shuffle: boolean;
  delay_seconds: number;
  loop_playlist: boolean;
  // Per-playlist zen background music preferences
  zen_enabled: boolean;
  zen_track_id?: string | null;
  zen_volume: number;
  zen_ducking_intensity: number;
}

export interface PlaylistRecording {
  id: string;
  playlist_id: string;
  recording_id: string;
  position: number;
  created_at: string;
}

export interface Affirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
}

export type AffirmationCategory = 
  | "confidence"
  | "self-love"
  | "abundance"
  | "calm"
  | "identity"
  | "healing"
  | "relationships";

export const AFFIRMATION_CATEGORIES: { value: AffirmationCategory; label: string }[] = [
  { value: "confidence", label: "Confidence" },
  { value: "self-love", label: "Self-Love" },
  { value: "abundance", label: "Money & Abundance" },
  { value: "calm", label: "Stress & Calm" },
  { value: "identity", label: "Identity Shifting" },
  { value: "healing", label: "Healing" },
  { value: "relationships", label: "Relationships" },
];

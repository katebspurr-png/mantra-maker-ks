export type LoopMode = "once" | "three_times" | "infinite";

export interface Recording {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  duration_seconds: number;
  audio_file_path: string;
  loop_mode: LoopMode;
  text?: string | null;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  shuffle: boolean;
  delay_seconds: number;
  loop_playlist: boolean;
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

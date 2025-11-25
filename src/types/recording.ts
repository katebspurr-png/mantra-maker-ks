export type LoopMode = "once" | "three_times" | "infinite";

export interface Recording {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  duration_seconds: number;
  audio_file_path: string;
  loop_mode: LoopMode;
}

-- Add zen music preference columns to recordings table
ALTER TABLE public.recordings
  ADD COLUMN zen_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN zen_track_id text,
  ADD COLUMN zen_volume real NOT NULL DEFAULT 0.3,
  ADD COLUMN zen_ducking_intensity real NOT NULL DEFAULT 0.83;

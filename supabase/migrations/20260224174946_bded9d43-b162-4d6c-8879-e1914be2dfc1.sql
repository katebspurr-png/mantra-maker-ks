
ALTER TABLE public.playlists
  ADD COLUMN zen_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN zen_track_id text,
  ADD COLUMN zen_volume numeric NOT NULL DEFAULT 0.3,
  ADD COLUMN zen_ducking_intensity numeric NOT NULL DEFAULT 0.83;

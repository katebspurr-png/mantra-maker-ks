-- Add is_best_take column to recordings table
-- This is a user-controlled marker, NOT auto-assigned or AI-scored
-- Future use: could be used to prefer Best Takes when building playlists
ALTER TABLE public.recordings 
ADD COLUMN is_best_take boolean NOT NULL DEFAULT false;
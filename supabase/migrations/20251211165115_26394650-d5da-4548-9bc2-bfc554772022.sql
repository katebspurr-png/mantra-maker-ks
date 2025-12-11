-- Add tags column to recordings table
-- Tags can later be used for filtering recordings or building smart playlists by theme
ALTER TABLE public.recordings 
ADD COLUMN tags text[] DEFAULT '{}' NOT NULL;
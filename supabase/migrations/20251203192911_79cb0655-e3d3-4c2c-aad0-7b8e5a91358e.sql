-- Add text column to recordings for teleprompter content
ALTER TABLE public.recordings 
ADD COLUMN text TEXT;

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shuffle BOOLEAN DEFAULT false,
  delay_seconds INTEGER DEFAULT 0,
  loop_playlist BOOLEAN DEFAULT false
);

-- Enable RLS on playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playlists
CREATE POLICY "Users can view their own playlists" 
ON public.playlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
ON public.playlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.playlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.playlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create junction table for playlist recordings (ordered)
CREATE TABLE public.playlist_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, recording_id)
);

-- Enable RLS on playlist_recordings
ALTER TABLE public.playlist_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for playlist_recordings (via playlist ownership)
CREATE POLICY "Users can view their playlist recordings" 
ON public.playlist_recordings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_recordings.playlist_id 
    AND playlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add to their playlists" 
ON public.playlist_recordings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_recordings.playlist_id 
    AND playlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their playlist recordings" 
ON public.playlist_recordings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_recordings.playlist_id 
    AND playlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove from their playlists" 
ON public.playlist_recordings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_recordings.playlist_id 
    AND playlists.user_id = auth.uid()
  )
);
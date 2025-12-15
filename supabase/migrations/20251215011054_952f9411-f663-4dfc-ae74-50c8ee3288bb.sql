-- Create listening_events table for tracking playback time
CREATE TABLE public.listening_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE SET NULL,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  seconds_listened INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listening_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own listening events"
ON public.listening_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own listening events"
ON public.listening_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listening events"
ON public.listening_events
FOR DELETE
USING (auth.uid() = user_id);

-- Indexes for efficient querying
CREATE INDEX idx_listening_events_user_id ON public.listening_events(user_id);
CREATE INDEX idx_listening_events_started_at ON public.listening_events(started_at);
CREATE INDEX idx_listening_events_user_date ON public.listening_events(user_id, started_at);
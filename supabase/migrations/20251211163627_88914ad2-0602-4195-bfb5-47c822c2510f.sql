-- Add is_favorite column to recordings
ALTER TABLE public.recordings ADD COLUMN is_favorite boolean DEFAULT false;

-- Create table for favorite affirmations (suggestions from the built-in library)
CREATE TABLE public.favorite_affirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  affirmation_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, affirmation_id)
);

-- Enable RLS
ALTER TABLE public.favorite_affirmations ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorite_affirmations
CREATE POLICY "Users can view their own favorite affirmations"
ON public.favorite_affirmations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite affirmations"
ON public.favorite_affirmations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite affirmations"
ON public.favorite_affirmations
FOR DELETE
USING (auth.uid() = user_id);
-- Add affirmation_id to recordings table for grouping takes
ALTER TABLE public.recordings 
ADD COLUMN affirmation_id uuid DEFAULT NULL;

-- Create index for efficient grouping queries
CREATE INDEX idx_recordings_affirmation_id ON public.recordings(affirmation_id) WHERE affirmation_id IS NOT NULL;

-- Create tone_analysis_snapshots table
CREATE TABLE public.tone_analysis_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recording_id uuid NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  sincerity_score integer NOT NULL CHECK (sincerity_score >= 0 AND sincerity_score <= 100),
  conviction_score integer NOT NULL CHECK (conviction_score >= 0 AND conviction_score <= 100),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  summary text NOT NULL,
  strengths text[],
  improvements text[],
  practice_exercise text,
  model_version text,
  signals jsonb
);

-- Enable RLS
ALTER TABLE public.tone_analysis_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for tone_analysis_snapshots
CREATE POLICY "Users can view their own tone analysis"
ON public.tone_analysis_snapshots
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tone analysis"
ON public.tone_analysis_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone analysis"
ON public.tone_analysis_snapshots
FOR DELETE
USING (auth.uid() = user_id);

-- Index for quick lookups by recording
CREATE INDEX idx_tone_analysis_recording_id ON public.tone_analysis_snapshots(recording_id);
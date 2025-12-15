-- Add UPDATE policy for tone_analysis_snapshots
CREATE POLICY "Users can update their own tone analysis"
ON public.tone_analysis_snapshots
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
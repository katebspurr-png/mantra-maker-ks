-- Drop the old constraint that doesn't allow 0 duration
ALTER TABLE public.recordings 
DROP CONSTRAINT recordings_duration_positive;

-- Add new constraint that allows 0 or greater
ALTER TABLE public.recordings 
ADD CONSTRAINT recordings_duration_positive CHECK (duration_seconds >= 0);
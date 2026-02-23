
-- Create a public storage bucket for zen background music tracks
INSERT INTO storage.buckets (id, name, public) VALUES ('zen-tracks', 'zen-tracks', true);

-- Allow anyone to read zen tracks (they're public ambient music)
CREATE POLICY "Zen tracks are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'zen-tracks');

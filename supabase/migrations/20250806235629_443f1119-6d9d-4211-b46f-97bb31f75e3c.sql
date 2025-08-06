-- Crea il bucket profile-images se non esiste
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'profile-images', 
  'profile-images', 
  true,
  ARRAY['image/jpeg', 'image/png', 'image/webp'],
  10485760  -- 10MB limit
) ON CONFLICT (id) DO NOTHING;

-- Policy per permettere a tutti di vedere le immagini
CREATE POLICY "Public access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Policy per permettere agli utenti autenticati di caricare immagini
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy per permettere agli utenti di aggiornare le proprie immagini
CREATE POLICY "Users can update own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy per permettere agli utenti di eliminare le proprie immagini
CREATE POLICY "Users can delete own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
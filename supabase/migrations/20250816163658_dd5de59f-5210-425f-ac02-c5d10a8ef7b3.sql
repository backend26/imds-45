-- Drop ALL existing storage object policies to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all existing policies on storage.objects
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Create fresh RLS policies for all storage buckets

-- Profile images bucket - users can upload their own profile images
CREATE POLICY "Users can upload their own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own profile images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket - public read, user-specific upload
CREATE POLICY "Public read access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Post-media bucket - journalists/editors can upload, public read
CREATE POLICY "Public read access to post media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

CREATE POLICY "Journalists can upload post media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
    AND public.is_user_editor_or_journalist(auth.uid())
  );

CREATE POLICY "Journalists can update their post media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_user_editor_or_journalist(auth.uid())
  );

CREATE POLICY "Journalists can delete their post media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_user_editor_or_journalist(auth.uid())
  );

-- Cover-images bucket - journalists/editors can upload, public read
CREATE POLICY "Public read access to cover images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cover-images');

CREATE POLICY "Journalists can upload cover images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cover-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
    AND public.is_user_editor_or_journalist(auth.uid())
  );

CREATE POLICY "Journalists can update their cover images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cover-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_user_editor_or_journalist(auth.uid())
  );

CREATE POLICY "Journalists can delete their cover images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cover-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_user_editor_or_journalist(auth.uid())
  );
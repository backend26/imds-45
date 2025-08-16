-- Fix storage RLS policies and triggers for image upload system

-- 1. Drop ALL existing storage object policies to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 2. Create corrected RLS policies with proper WITH CHECK conditions

-- AVATARS BUCKET - Public read, user-specific upload with standardized path
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
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

-- PROFILE-IMAGES BUCKET - User banners with standardized path
CREATE POLICY "Users can view their own profile images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

-- POST-MEDIA BUCKET - Journalists only, public read
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
    AND auth.role() = 'authenticated'
    AND public.is_user_editor_or_journalist(auth.uid())
  );

CREATE POLICY "Journalists can delete their post media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
    AND public.is_user_editor_or_journalist(auth.uid())
  );

-- COVER-IMAGES BUCKET - Journalists only, public read
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
    AND auth.role() = 'authenticated'
    AND public.is_user_editor_or_journalist(auth.uid())
  );

CREATE POLICY "Journalists can delete their cover images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cover-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
    AND public.is_user_editor_or_journalist(auth.uid())
  );

-- 3. Recreate the journalist upload trigger function
CREATE OR REPLACE FUNCTION public.check_journalist_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify user has authorized role for post image uploads
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  ) THEN
    RAISE EXCEPTION 'Solo i giornalisti possono caricare immagini nei post';
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. Apply trigger to posts table when cover_images or featured_image_url is updated
DROP TRIGGER IF EXISTS check_journalist_upload_trigger ON public.posts;
CREATE TRIGGER check_journalist_upload_trigger
  BEFORE INSERT OR UPDATE OF cover_images, featured_image_url ON public.posts
  FOR EACH ROW 
  EXECUTE FUNCTION public.check_journalist_upload();
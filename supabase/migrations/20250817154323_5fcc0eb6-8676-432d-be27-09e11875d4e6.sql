-- FASE 1: PULIZIA COMPLETA DATABASE
-- Cancellare tutti i dati esistenti per ricominciare da capo

-- Disable triggers temporarily
SET session_replication_role = replica;

-- Clean up storage objects
DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'profile-images', 'cover-images', 'post-media');

-- Clean up application data (in dependency order)
DELETE FROM public.notifications;
DELETE FROM public.follows;
DELETE FROM public.bookmarked_posts;
DELETE FROM public.post_likes;
DELETE FROM public.post_ratings;
DELETE FROM public.post_reports;
DELETE FROM public.comments;
DELETE FROM public.posts;
DELETE FROM public.user_sessions;
DELETE FROM public.user_activity;
DELETE FROM public.login_sessions;
DELETE FROM public.search_analytics;
DELETE FROM public.data_exports;
DELETE FROM public.data_deletions;
DELETE FROM public.notification_preferences;
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;

-- Clean up categories and start fresh
DELETE FROM public.categories;
DELETE FROM public.allowed_email_domains;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- FASE 2: CORREZIONE POLICY RLS STORAGE
-- Remove all existing conflicting storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Only editors can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Only editors can update cover images" ON storage.objects;
DROP POLICY IF EXISTS "Only editors can delete cover images" ON storage.objects;
DROP POLICY IF EXISTS "Post media are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Only editors can upload post media" ON storage.objects;
DROP POLICY IF EXISTS "Only editors can update post media" ON storage.objects;
DROP POLICY IF EXISTS "Only editors can delete post media" ON storage.objects;

-- Create clear and consistent storage policies

-- AVATARS BUCKET: Users can manage their own avatars
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_user_update" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_user_delete" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- PROFILE-IMAGES BUCKET: Users can manage their own profile images (banners)
CREATE POLICY "profile_images_public_read" ON storage.objects
FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_user_upload" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "profile_images_user_update" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "profile_images_user_delete" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- COVER-IMAGES BUCKET: Only editors/journalists/admins can manage
CREATE POLICY "cover_images_public_read" ON storage.objects
FOR SELECT 
USING (bucket_id = 'cover-images');

CREATE POLICY "cover_images_editor_upload" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'cover-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

CREATE POLICY "cover_images_editor_update" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'cover-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

CREATE POLICY "cover_images_editor_delete" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'cover-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

-- POST-MEDIA BUCKET: Only editors/journalists/admins can manage
CREATE POLICY "post_media_public_read" ON storage.objects
FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY "post_media_editor_upload" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'post-media' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

CREATE POLICY "post_media_editor_update" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'post-media' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

CREATE POLICY "post_media_editor_delete" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'post-media' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

-- FASE 3: CORREZIONE SECURITY ISSUES
-- Remove problematic public_profiles view if it exists
DROP VIEW IF EXISTS public.public_profiles;

-- FASE 4: OTTIMIZZAZIONE SCHEMA
-- Add missing columns to profiles table for better tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banner_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create index for posts
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

-- FASE 5: INSERIMENTO DATI DI TEST
-- Insert categories for testing
INSERT INTO public.categories (name, slug) VALUES
('Calcio', 'calcio'),
('Tennis', 'tennis'),
('Formula 1', 'f1'),
('NBA', 'basket'),
('NFL', 'nfl');

-- Insert allowed email domains
INSERT INTO public.allowed_email_domains (domain) VALUES
('gmail.com'),
('yahoo.com'),
('outlook.com'),
('hotmail.com'),
('libero.it'),
('virgilio.it'),
('alice.it'),
('tin.it'),
('fastwebnet.it'),
('tim.it'),
('tiscali.it'),
('email.it'),
('icloud.com'),
('protonmail.com');
-- Add missing columns to posts table for editorial system
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS cover_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS co_authoring_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));

-- Update profiles role enum to include editor and administrator
DO $$ 
BEGIN
    -- Check if the enum values already exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'editor' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
        ALTER TYPE app_role ADD VALUE 'editor';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'administrator' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
        ALTER TYPE app_role ADD VALUE 'administrator';
    END IF;
END
$$;

-- Create storage buckets for media management
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('post-media', 'post-media', true),
  ('cover-images', 'cover-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for post media
CREATE POLICY IF NOT EXISTS "Users can upload post media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'post-media' AND auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Post media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-media');

CREATE POLICY IF NOT EXISTS "Authors can update their post media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'post-media' AND auth.uid() IS NOT NULL);

-- Create storage policies for cover images
CREATE POLICY IF NOT EXISTS "Users can upload cover images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cover-images' AND auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Cover images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cover-images');

CREATE POLICY IF NOT EXISTS "Authors can update their cover images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cover-images' AND auth.uid() IS NOT NULL);
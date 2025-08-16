-- Fix Storage RLS policies for profile-images bucket
-- First ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for profile images
CREATE POLICY "Anyone can view profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own profile images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own profile images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Fix public_profiles view for anonymous access
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  bio,
  profile_picture_url,
  banner_url,
  role,
  preferred_sports,
  created_at,
  location,
  birth_date,
  privacy_settings
FROM public.profiles 
WHERE is_banned = false 
  AND (privacy_settings->>'public_profile')::boolean = true;

-- Grant access to public_profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
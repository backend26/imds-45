-- Fix RLS policies for profile-images bucket to allow current folder structure
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Create new RLS policies that support avatars/ and banners/ folders
CREATE POLICY "Authenticated users can upload to profile-images bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (
    name LIKE 'avatars/%' OR 
    name LIKE 'banners/%'
  )
);

CREATE POLICY "Users can update profile-images bucket" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (
    name LIKE 'avatars/%' OR 
    name LIKE 'banners/%'
  )
);

CREATE POLICY "Users can delete from profile-images bucket" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (
    name LIKE 'avatars/%' OR 
    name LIKE 'banners/%'
  )
);

-- Public read access remains the same
CREATE POLICY "Public read access to profile-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');
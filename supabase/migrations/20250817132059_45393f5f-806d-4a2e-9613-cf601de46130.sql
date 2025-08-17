-- Check and fix storage RLS policies for proper avatar/banner uploads

-- Ensure avatars bucket RLS policies allow proper user access
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;

-- Create comprehensive RLS policies for avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to update their own avatars" ON storage.objects
    FOR UPDATE TO authenticated 
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public access to avatars" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'avatars');

-- Fix profile-images bucket RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to profile images" ON storage.objects;

-- Create comprehensive RLS policies for profile-images bucket
CREATE POLICY "Allow authenticated users to upload profile images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to update their own profile images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own profile images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public access to profile images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'profile-images');
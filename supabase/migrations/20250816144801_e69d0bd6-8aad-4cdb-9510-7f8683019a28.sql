-- FASE 1: CORREZIONI DATABASE CRITICHE

-- 1. Creare bucket avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Creare politiche storage per avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Correggere RLS policy per data_deletions
DROP POLICY IF EXISTS "Users can create own deletion requests" ON public.data_deletions;
CREATE POLICY "Users can create own deletion requests" 
ON public.data_deletions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Aggiungere colonne banner_url e bio a profiles se non esistono
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 5. Aggiungere colonna per tracciare ultimo cambio username
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Creare funzione per controllare limite cambio username (15 giorni)
CREATE OR REPLACE FUNCTION public.can_change_username(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_change TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_username_change INTO last_change
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- Se non c'è mai stato un cambio o sono passati più di 15 giorni
  RETURN (last_change IS NULL OR last_change < NOW() - INTERVAL '15 days');
END;
$$;

-- 7. Aggiornare la view public_profiles per includere nuove colonne
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  id, user_id, username, display_name, bio, profile_picture_url, banner_url,
  role, preferred_sports, created_at, location, birth_date, privacy_settings
FROM public.profiles
WHERE is_banned = false
AND (
  privacy_settings->>'public_profile' = 'true' 
  OR privacy_settings->>'public_profile' IS NULL
);

-- 8. Garantire che la view sia accessibile pubblicamente
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
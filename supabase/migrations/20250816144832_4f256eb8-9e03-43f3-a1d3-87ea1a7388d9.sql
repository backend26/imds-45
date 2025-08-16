-- Fix sicurezza rilevati dal linter

-- 1. Fix Security Definer View - ricreare view senza SECURITY DEFINER
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

-- Garantire accesso pubblico alla view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- 2. Fix Function Search Path - già corretto, ma assicuriamoci
-- La funzione can_change_username ha già SET search_path = public quindi è OK
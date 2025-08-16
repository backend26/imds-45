-- Fix security definer view issue by recreating without SECURITY DEFINER
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
WHERE is_banned = false;

-- Grant access properly without security definer
GRANT SELECT ON public.public_profiles TO anon, authenticated;
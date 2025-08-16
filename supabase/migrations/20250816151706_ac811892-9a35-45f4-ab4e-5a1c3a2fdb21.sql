-- Correggo la view public_profiles (DROP + CREATE invece di ALTER)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.display_name,
  p.bio,
  p.location,
  p.birth_date,
  p.profile_picture_url,
  COALESCE(p.banner_url, 'https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public/profile-images/default-banner.jpg') as banner_url,
  p.role,
  p.preferred_sports,
  p.created_at,
  p.privacy_settings
FROM public.profiles p
WHERE p.is_banned = false OR p.is_banned IS NULL;
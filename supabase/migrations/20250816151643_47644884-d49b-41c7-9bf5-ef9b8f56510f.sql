-- FASE 1: Correzione trigger handle_new_user e RLS policies
-- Verifico e miglioro il trigger per evitare errori 500

-- Aggiorno la funzione handle_new_user per essere più robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile with data from user metadata, con fallback sicuri
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name,
    role,
    accepted_terms_at,
    privacy_settings
  )
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'username', 
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'username', 
      'User ' || substr(NEW.id::text, 1, 8)
    ),
    'registered_user'::app_role,  -- Cambio da journalist a registered_user per nuovi utenti
    NOW(),
    '{
      "email": false,
      "birth_date": false,
      "location": false,
      "activity": true,
      "posts": true,
      "likes": false,
      "bookmarks": false,
      "public_profile": true
    }'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error ma non bloccare la registrazione
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Aggiungo banner di default nella view public_profiles
CREATE OR REPLACE VIEW public.public_profiles AS
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
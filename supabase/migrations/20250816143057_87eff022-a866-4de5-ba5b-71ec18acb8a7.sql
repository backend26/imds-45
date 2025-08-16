-- Fix security issues from the linter

-- 1. Fix the public_profiles view to remove SECURITY DEFINER issue
DROP VIEW IF EXISTS public.public_profiles;

-- Create a simple view without security definer
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
  CASE 
    WHEN (privacy_settings->>'public_profile')::boolean = true THEN privacy_settings
    ELSE NULL
  END as privacy_settings
FROM public.profiles 
WHERE is_banned = false 
  AND COALESCE((privacy_settings->>'public_profile')::boolean, false) = true;

-- Grant access to public_profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Fix search_path issues for existing functions by updating them
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile with data from user metadata
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
    'journalist'::app_role,
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
    -- Log error but don't fail the signup process
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;
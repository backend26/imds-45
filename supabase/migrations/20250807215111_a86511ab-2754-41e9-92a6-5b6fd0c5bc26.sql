-- Phase 1: Critical Database and Profile Fixes

-- Update handle_new_user function for better profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create profile with better error handling and journalist role assignment
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
    -- Assign journalist role by default for new users (can be changed by admin later)
    'journalist'::app_role,
    NOW(),
    '{
      "email": false,
      "birth_date": false,
      "location": false,
      "activity": true,
      "posts": true,
      "likes": false,
      "bookmarks": false
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
$$;
-- 1) POSTS: ensure authors manage their own posts via auth.uid()
DROP POLICY IF EXISTS "Authors can manage their posts" ON public.posts;
CREATE POLICY "Authors can manage their posts"
  ON public.posts
  FOR ALL
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- 2) PROFILES: restrict direct public access and expose a safe public view
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

CREATE OR REPLACE VIEW public.public_profiles AS
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

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3) ADMIN ANALYTICS: expose via SECURITY DEFINER function (views don't support RLS)
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS SETOF public.admin_analytics
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.admin_analytics
  WHERE public.get_current_user_role() = 'administrator';
$$;

-- 4) FUNCTIONS: add missing search_path and harden initialize_admin
CREATE OR REPLACE FUNCTION public.initialize_admin(
  admin_user_id uuid,
  admin_username text DEFAULT 'admin',
  admin_display_name text DEFAULT 'Administrator'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_admin_count INTEGER;
  existing_profile_count INTEGER;
BEGIN
  -- Count existing admins
  SELECT COUNT(*) INTO existing_admin_count 
  FROM public.profiles 
  WHERE role = 'administrator';
  
  -- Prevent creating multiple admins via this helper
  IF existing_admin_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check if a profile already exists for this user
  SELECT COUNT(*) INTO existing_profile_count 
  FROM public.profiles 
  WHERE user_id = admin_user_id;
  
  IF existing_profile_count > 0 THEN
    -- Update existing profile
    UPDATE public.profiles 
    SET role = 'administrator',
        username = COALESCE(username, admin_username),
        display_name = COALESCE(display_name, admin_display_name),
        updated_at = NOW()
    WHERE user_id = admin_user_id;
  ELSE
    -- Create new admin profile
    INSERT INTO public.profiles (user_id, username, display_name, role)
    VALUES (admin_user_id, admin_username, admin_display_name, 'administrator');
  END IF;
  
  RETURN TRUE;
END;
$function$;
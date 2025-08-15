-- 1. Add missing trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add missing trigger for username uniqueness validation
CREATE TRIGGER validate_username_uniqueness
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_username_uniqueness();

-- 3. Create function to get email by username for login
CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT au.email INTO user_email
  FROM auth.users au
  JOIN public.profiles p ON p.user_id = au.id
  WHERE p.username = username_input
  AND p.is_banned = false
  LIMIT 1;
  
  RETURN user_email;
END;
$$;

-- 4. Add social links and favorite team fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS favorite_team text;
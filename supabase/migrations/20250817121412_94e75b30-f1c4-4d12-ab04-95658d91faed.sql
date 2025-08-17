-- Fix the handle_new_user trigger to resolve foreign key constraint violation
-- The issue is that notification_preferences has a foreign key to profiles.user_id
-- but the trigger tries to insert into notification_preferences before profiles exists

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- FIRST: Insert into profiles table - this MUST happen first
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'User')
  );

  -- SECOND: Insert into notification_preferences - this will work now since profiles exists
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Ensure the trigger is properly attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
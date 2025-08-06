-- Fix the INSERT policy for profiles to allow the trigger to work
DROP POLICY IF EXISTS "Users can sign up and insert their profile" ON public.profiles;

-- Create a new policy that allows both user self-insertion and trigger insertion
CREATE POLICY "Users can insert their profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IS NULL -- Allow trigger insertions when no active session
  );

-- Also ensure the handle_new_user function bypasses RLS completely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Temporarily disable RLS for this insert
  SET LOCAL row_security = off;
  
  INSERT INTO public.profiles (
    user_id,
    username,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'registered_user'::app_role,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;
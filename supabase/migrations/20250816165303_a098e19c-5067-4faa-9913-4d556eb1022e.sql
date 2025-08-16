-- Fix security linter warnings

-- 1. Fix function search_path issues by setting explicit search_path
CREATE OR REPLACE FUNCTION public.check_journalist_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify user has authorized role for post image uploads
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'editor', 'journalist')
  ) THEN
    RAISE EXCEPTION 'Solo i giornalisti possono caricare immagini nei post';
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix all other functions to have explicit search_path
CREATE OR REPLACE FUNCTION public.is_user_editor_or_journalist(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role IN ('administrator', 'editor', 'journalist')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND role = 'administrator'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'guest');
END;
$function$;
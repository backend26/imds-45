-- Username change enforcement: trigger and function
CREATE OR REPLACE FUNCTION public.enforce_username_change_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    -- Check 15-day window
    IF NOT public.can_change_username(OLD.user_id) THEN
      RAISE EXCEPTION 'Cambio username non consentito: attendi 15 giorni tra un cambio e l''altro';
    END IF;
    -- Update last change timestamp
    NEW.last_username_change := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_username_change ON public.profiles;
CREATE TRIGGER trg_enforce_username_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_username_change_limit();
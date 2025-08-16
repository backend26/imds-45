-- Continue fixing remaining functions

CREATE OR REPLACE FUNCTION public.enforce_username_change_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Password must be at least 8 characters
  IF length(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one uppercase letter
  IF NOT password ~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one lowercase letter  
  IF NOT password ~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one number
  IF NOT password ~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one special character
  IF NOT password ~ '[^A-Za-z0-9]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_session_security_score(p_user_agent text, p_ip_address inet, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  score INTEGER := 100;
  recent_login_count INTEGER;
  different_ip_count INTEGER;
BEGIN
  -- Check for multiple logins from different IPs in last hour
  SELECT COUNT(DISTINCT ip_address) INTO different_ip_count
  FROM public.user_sessions
  WHERE user_id = p_user_id 
    AND created_at > now() - interval '1 hour';
    
  IF different_ip_count > 3 THEN
    score := score - 30;
  END IF;
  
  -- Check for rapid login attempts
  SELECT COUNT(*) INTO recent_login_count
  FROM public.user_sessions  
  WHERE user_id = p_user_id
    AND created_at > now() - interval '5 minutes';
    
  IF recent_login_count > 5 THEN
    score := score - 50;
  END IF;
  
  -- Suspicious user agents
  IF p_user_agent IS NULL OR length(p_user_agent) < 10 THEN
    score := score - 20;
  END IF;
  
  RETURN GREATEST(score, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.safe_purge_user_content(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Consenti solo agli amministratori
  if not public.is_user_admin() then
    raise exception 'Non autorizzato';
  end if;

  -- Notifiche (come attore o destinatario)
  delete from public.notifications
   where actor_id = target_user_id
      or recipient_id = target_user_id;

  -- Follow
  delete from public.follows
   where follower_id = target_user_id
      or following_id = target_user_id;

  -- Preferiti / Likes / Ratings
  delete from public.bookmarked_posts where user_id = target_user_id;
  delete from public.post_likes        where user_id = target_user_id;
  delete from public.post_ratings      where user_id = target_user_id;

  -- Commenti dell'utente
  delete from public.comments where author_id = target_user_id;

  -- Segnalazioni effettuate dall'utente o riferite a suoi post
  delete from public.post_reports
   where reporter_id = target_user_id
      or post_id in (select id from public.posts where author_id = target_user_id);

  -- Sessioni e richieste privacy
  delete from public.user_sessions where user_id = target_user_id;
  delete from public.data_exports  where user_id = target_user_id;
  delete from public.data_deletions where user_id = target_user_id;

  -- Post dell'utente
  delete from public.posts where author_id = target_user_id;

  -- Profilo
  delete from public.profiles where user_id = target_user_id;
end;
$function$;
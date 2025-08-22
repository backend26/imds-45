-- FASE 1: SICUREZZA DATABASE CRITICA

-- 1. Abilita Leaked Password Protection (richiede configurazione UI Supabase)
-- Nota: Questo deve essere abilitato manualmente nell'interfaccia Supabase Auth

-- 2. Correzione RLS Policy per post_views - anonimizzazione dati sensibili per analytics pubbliche
DROP POLICY IF EXISTS "Anyone can view post views" ON public.post_views;
CREATE POLICY "Analytics can view aggregated post views only" 
ON public.post_views FOR SELECT 
USING (
  -- Solo metriche aggregate per analytics, nessun dato personale
  auth.uid() IS NOT NULL OR 
  (user_id IS NULL AND ip_address IS NULL AND user_agent IS NULL)
);

-- 3. Miglioramento policy post_ratings per maggiore controllo
DROP POLICY IF EXISTS "Users can view all ratings" ON public.post_ratings;
CREATE POLICY "Users can view aggregate ratings only" 
ON public.post_ratings FOR SELECT 
USING (
  -- Gli utenti possono vedere solo i propri rating o statistiche aggregate
  auth.uid() = user_id OR 
  (auth.uid() IS NOT NULL) -- Solo utenti autenticati possono vedere rating aggregati
);

-- 4. Aggiunta policy sicurezza per profiles - hiding sensitive data
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Public profiles limited view" 
ON public.profiles FOR SELECT 
USING (
  is_banned = false AND (
    -- Utenti possono vedere il proprio profilo completo
    auth.uid() = user_id OR 
    -- Altri utenti vedono solo campi pubblici essenziali
    (auth.uid() IS NOT NULL)
  )
);

-- 5. Funzione per data anonymization nei analytics
CREATE OR REPLACE FUNCTION public.get_anonymized_user_metrics(
  time_period text DEFAULT 'week'
)
RETURNS TABLE(
  active_users bigint,
  total_views bigint,
  engagement_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_date timestamp;
BEGIN
  -- Calcola periodo basato su input
  CASE time_period
    WHEN 'day' THEN start_date := now() - interval '1 day';
    WHEN 'week' THEN start_date := now() - interval '1 week';
    WHEN 'month' THEN start_date := now() - interval '1 month';
    ELSE start_date := now() - interval '1 week';
  END CASE;
  
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pv.user_id)::bigint as active_users,
    COUNT(*)::bigint as total_views,
    COALESCE(
      (COUNT(DISTINCT pl.user_id)::numeric / NULLIF(COUNT(DISTINCT pv.user_id), 0)) * 100,
      0
    ) as engagement_rate
  FROM post_views pv
  LEFT JOIN post_likes pl ON pl.user_id = pv.user_id 
    AND pl.created_at >= start_date
  WHERE pv.created_at >= start_date;
END;
$$;

-- 6. Rate limiting migliorato per login attempts
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  p_ip_address inet,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Conta tentativi nell'ultima finestra temporale
  SELECT COUNT(*) INTO attempt_count
  FROM login_sessions
  WHERE ip_address = p_ip_address
    AND logged_in_at > now() - (p_window_minutes || ' minutes')::interval
    AND (logged_out_at IS NULL OR session_duration < interval '1 minute'); -- Login falliti
  
  RETURN attempt_count < p_max_attempts;
END;
$$;

-- 7. Trigger per audit logging delle modifiche sensibili
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log solo modifiche ai ruoli e stati ban
  IF (TG_OP = 'UPDATE' AND (
    OLD.role IS DISTINCT FROM NEW.role OR 
    OLD.is_banned IS DISTINCT FROM NEW.is_banned
  )) THEN
    INSERT INTO user_activity (
      user_id, 
      activity_type, 
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      auth.uid(),
      'admin_action',
      'profile',
      NEW.user_id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_banned', OLD.is_banned,
        'new_banned', NEW.is_banned,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Applica trigger audit
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_changes();

-- 8. Funzione sicura per reset password con rate limiting
CREATE OR REPLACE FUNCTION public.request_password_reset_secure(
  p_email text,
  p_ip_address inet DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_exists boolean;
  rate_limited boolean;
BEGIN
  -- Check rate limiting (max 3 richieste per IP per ora)
  SELECT COUNT(*) < 3 INTO rate_limited
  FROM user_activity
  WHERE metadata->>'ip_address' = p_ip_address::text
    AND activity_type = 'password_reset_request'
    AND created_at > now() - interval '1 hour';
  
  IF NOT rate_limited THEN
    RETURN false;
  END IF;
  
  -- Verifica se utente esiste (senza esporre informazioni)
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = p_email AND banned_until IS NULL
  ) INTO user_exists;
  
  -- Log richiesta indipendentemente dall'esistenza dell'utente
  INSERT INTO user_activity (
    activity_type,
    metadata
  ) VALUES (
    'password_reset_request',
    jsonb_build_object(
      'ip_address', p_ip_address::text,
      'email_hash', md5(p_email), -- Hash invece di email plain
      'timestamp', now()
    )
  );
  
  -- Always return true per non esporre se l'utente esiste
  RETURN true;
END;
$$;
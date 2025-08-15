-- Fix security warnings by updating function search paths

-- Update validate_password_strength function with proper search path
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Update calculate_session_security_score function with proper search path
CREATE OR REPLACE FUNCTION public.calculate_session_security_score(
  p_user_agent TEXT,
  p_ip_address INET,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;
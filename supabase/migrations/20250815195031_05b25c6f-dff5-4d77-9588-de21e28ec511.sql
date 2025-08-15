-- Enable password protection and RLS security improvements

-- Create user_preferences table to implement TODOs
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{
    "email": true,
    "push": true,
    "desktop": true,
    "marketing": false,
    "digest_frequency": "weekly"
  }'::jsonb,
  display_settings JSONB DEFAULT '{
    "theme": "system",
    "language": "it",
    "font_size": "medium",
    "reduce_motion": false
  }'::jsonb,
  privacy_settings JSONB DEFAULT '{
    "public_profile": true,
    "show_activity": false,
    "show_reading_history": false,
    "analytics_consent": false
  }'::jsonb,
  reading_preferences JSONB DEFAULT '{
    "auto_play_videos": false,
    "show_related_articles": true,
    "preferred_sports": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can manage their preferences"
ON public.user_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function for password strength validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add trigger for updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Improve user_sessions table with better security tracking
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS location_info JSONB DEFAULT '{}'::jsonb;

-- Create enhanced function for session security scoring
CREATE OR REPLACE FUNCTION public.calculate_session_security_score(
  p_user_agent TEXT,
  p_ip_address INET,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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
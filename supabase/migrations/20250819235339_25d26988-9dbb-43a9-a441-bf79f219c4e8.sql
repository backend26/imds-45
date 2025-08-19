-- FASE 1: Correggi categoria NBA → Basket
UPDATE public.categories 
SET name = 'Basket', slug = 'basket' 
WHERE name = 'NBA' OR slug = 'nba';

-- FASE 5: Crea tabella per sistema visualizzazioni avanzato
CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Constraint per evitare visualizzazioni multiple dallo stesso utente
  UNIQUE(post_id, user_id),
  -- Index per performance
  INDEX idx_post_views_post_id ON public.post_views(post_id),
  INDEX idx_post_views_user_id ON public.post_views(user_id),
  INDEX idx_post_views_created_at ON public.post_views(created_at)
);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Policies per post_views
CREATE POLICY "Anyone can view post views" ON public.post_views
FOR SELECT USING (true);

CREATE POLICY "Users can track their own views" ON public.post_views
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR auth.uid() IS NULL
);

-- Funzione per incrementare visualizzazioni in modo sicuro
CREATE OR REPLACE FUNCTION public.increment_post_view(
  p_post_id uuid,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  view_exists boolean := false;
BEGIN
  -- Per utenti loggati: controlla se hanno già visto il post
  IF current_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.post_views 
      WHERE post_id = p_post_id AND user_id = current_user_id
    ) INTO view_exists;
    
    IF NOT view_exists THEN
      INSERT INTO public.post_views (post_id, user_id, ip_address, user_agent)
      VALUES (p_post_id, current_user_id, p_ip_address, p_user_agent);
      RETURN true;
    END IF;
  ELSE
    -- Per utenti anonimi: controlla IP nelle ultime 24 ore
    SELECT EXISTS(
      SELECT 1 FROM public.post_views 
      WHERE post_id = p_post_id 
        AND ip_address = p_ip_address 
        AND user_id IS NULL
        AND created_at > now() - interval '24 hours'
    ) INTO view_exists;
    
    IF NOT view_exists THEN
      INSERT INTO public.post_views (post_id, ip_address, user_agent)
      VALUES (p_post_id, p_ip_address, p_user_agent);
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$;

-- Funzione per ottenere conteggio visualizzazioni
CREATE OR REPLACE FUNCTION public.get_post_view_count(p_post_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::bigint FROM public.post_views WHERE post_id = p_post_id;
$$;
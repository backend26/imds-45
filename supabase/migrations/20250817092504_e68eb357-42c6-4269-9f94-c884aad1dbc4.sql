-- Rimuovi la vista SECURITY DEFINER e ricrea correttamente
DROP VIEW IF EXISTS public.public_profiles;

-- Crea la vista senza SECURITY DEFINER per evitare warning di sicurezza
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.user_id, 
  p.username,
  p.display_name,
  p.bio,
  p.location,
  p.birth_date,
  p.profile_picture_url,
  p.banner_url,
  p.privacy_settings,
  p.created_at,
  p.role,
  p.preferred_sports
FROM public.profiles p
WHERE p.is_banned = false;

-- RLS policy per permettere lettura a tutti sulla vista 
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Invalida cache ruoli e ottimizza le query per admin
CREATE OR REPLACE FUNCTION public.invalidate_user_role_cache(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Questa funzione può essere chiamata per invalidare la cache ruoli
  -- Inserisce/aggiorna un timestamp per forzare il refresh
  INSERT INTO public.user_activity (user_id, activity_type, metadata)
  VALUES (p_user_id, 'role_cache_invalidated', '{"timestamp": "now"}'::jsonb)
  ON CONFLICT DO NOTHING;
END;
$$;
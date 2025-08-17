-- Crea la vista public_profiles che manca e viene usata da diversi componenti
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Garantisce che solo profili pubblici siano visibili
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (is_banned = false);

-- Crea RLS policy per la vista
ALTER VIEW public.public_profiles OWNER TO postgres;

-- Funzione per verificare username esistente senza problemi di API key
CREATE OR REPLACE FUNCTION public.validate_unique_username(p_username text, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    -- Update case: escludi l'utente corrente
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = p_username 
      AND user_id != p_user_id
    );
  ELSE
    -- Insert case: controlla se username è libero
    RETURN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE username = p_username
    );
  END IF;
END;
$$;
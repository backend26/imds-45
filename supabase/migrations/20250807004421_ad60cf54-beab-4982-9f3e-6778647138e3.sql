-- FASE 1: ELIMINAZIONE RLS POLICIES PROBLEMATICHE
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger to create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- FASE 2: CREAZIONE FUNZIONI SECURITY DEFINER SICURE
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'guest');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND role = 'administrator'
  );
END;
$$;

-- FASE 3: CREAZIONE NUOVE RLS POLICIES SICURE
CREATE POLICY "Public profiles are viewable" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_user_admin() OR auth.uid() = user_id);

-- FASE 4: CORREZIONE RUOLO ADMIN PER UTENTE ESISTENTE
UPDATE public.profiles 
SET role = 'administrator',
    username = COALESCE(username, 'fradax2610'),
    display_name = COALESCE(display_name, 'Francesco')
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'fradax2610@gmail.com'
);
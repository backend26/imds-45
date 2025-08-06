-- SQL SCRIPT FOR BUG FIXES & NEW FEATURES

-- 1. (FIX CRITICO) Sostituzione della funzione 'handle_new_user'
-- Rimuoviamo il vecchio trigger per evitare conflitti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Rimuoviamo la vecchia funzione.
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Creiamo una nuova funzione 'idempotente' e più sicura.
-- Questa funzione tenta di inserire un nuovo profilo. Se il profilo esiste già (ON CONFLICT), non fa nulla.
-- Questo risolve definitivamente l'errore 'duplicate key'.
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Eseguita con i permessi dell'admin
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'registered_user'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Se esiste già, non fare nulla.
  RETURN NEW;
END;
$$;

-- Applichiamo il nuovo trigger al database.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- 2. Aggiunta di nuove colonne alla tabella 'profiles' per la personalizzazione
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 3. Aggiunta di una colonna per il banner alla tabella 'posts'
-- (Opzionale ma consigliato per coerenza)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 4. Aggiorna le policy RLS per supportare il nuovo trigger
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policy per permettere al trigger di creare profili
CREATE POLICY "Allow trigger to create profiles" ON public.profiles
FOR INSERT WITH CHECK (true);

-- Policy per permettere agli utenti di aggiornare il proprio profilo
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di vedere i profili
-- (questa dovrebbe già esistere ma la ricreiamo per sicurezza)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles
FOR SELECT USING (true);
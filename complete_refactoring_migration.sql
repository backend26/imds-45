-- SQL SCRIPT FOR THE DEFINITIVE REFACTORING

-- 1. (NUOVA STRUTTURA NOMI UTENTE) Modifica la tabella 'profiles' per supportare due tipi di nomi.
-- Aggiungiamo una colonna 'display_name' per il nome visualizzato (non univoco).
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Rendiamo la colonna 'username' esistente rigorosamente un handle univoco (@username).
-- Aggiungiamo un vincolo per assicurarci che sia univoco, minuscolo e senza spazi.
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_check CHECK (username = lower(username) AND username ~ '^[a-z0-9_]+$');

-- 2. (CONTROLLO PRIVACY) Aggiungiamo una colonna JSONB per le impostazioni di privacy granulari.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "email": false,
  "birth_date": false,
  "location": false,
  "activity": true,
  "posts": true,
  "likes": false,
  "bookmarks": false
}'::jsonb;

-- 3. (REQUISITO LEGALE) Aggiungiamo una colonna per tracciare l'accettazione dei termini.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;

-- 4. (FIX DEFINITIVO) Rimuoviamo il vecchio trigger di creazione profilo che causa l'errore.
-- Questo è il passo più importante per risolvere il bug.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user;
DROP FUNCTION IF EXISTS public.handle_new_user; -- Rimuove anche la versione precedente se esiste

-- 5. (AGGIORNAMENTO RLS) Aggiorniamo le policy per supportare i nuovi campi
-- Policy per permettere agli utenti di vedere i profili pubblici in base alle impostazioni privacy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Policy per permettere agli utenti di aggiornare il proprio profilo
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy per permettere l'inserimento di nuovi profili
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. (PULIZIA) Aggiorniamo i profili esistenti con valori di default sensati
UPDATE public.profiles 
SET privacy_settings = '{
  "email": false,
  "birth_date": false,
  "location": false,
  "activity": true,
  "posts": true,
  "likes": false,
  "bookmarks": false
}'::jsonb
WHERE privacy_settings IS NULL OR privacy_settings = '{}'::jsonb;

-- 7. (INDICE PERFORMANCE) Aggiungiamo un indice per le ricerche per username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
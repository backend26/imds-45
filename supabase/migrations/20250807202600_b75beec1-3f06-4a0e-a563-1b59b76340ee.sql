
-- 1) Funzioni sicure per profili pubblici: restituiscono solo campi “safe” e includono il filtro is_banned = false
create or replace function public.get_public_profile_by_username(p_username text)
returns table (
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  bio text,
  profile_picture_url text,
  banner_url text,
  role app_role,
  preferred_sports text[],
  created_at timestamptz,
  location text,
  birth_date date,
  privacy_settings jsonb
)
language sql
security definer
set search_path to 'public'
as $$
  select
    id, user_id, username, display_name, bio, profile_picture_url, banner_url,
    role, preferred_sports, created_at, location, birth_date, privacy_settings
  from public.profiles
  where is_banned = false
    and username = p_username
  limit 1
$$;

create or replace function public.list_public_profiles(
  p_query text default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  bio text,
  profile_picture_url text,
  banner_url text,
  role app_role,
  preferred_sports text[],
  created_at timestamptz,
  location text,
  birth_date date,
  privacy_settings jsonb
)
language sql
security definer
set search_path to 'public'
as $$
  select
    id, user_id, username, display_name, bio, profile_picture_url, banner_url,
    role, preferred_sports, created_at, location, birth_date, privacy_settings
  from public.profiles
  where is_banned = false
    and (
      p_query is null
      or username ilike '%' || p_query || '%'
      or display_name ilike '%' || p_query || '%'
    )
  order by created_at desc
  limit p_limit offset p_offset
$$;

-- 2) Rendere le VIEW “SECURITY INVOKER” per soddisfare il linter
alter view public.public_profiles set (security_invoker = on);
alter view public.admin_analytics set (security_invoker = on);

-- 3) Bloccare accesso diretto alla view admin_analytics, usare solo funzione
revoke all on view public.admin_analytics from anon, authenticated;

-- 4) Garantire l’esecuzione delle funzioni agli utenti applicativi
grant execute on function public.get_admin_analytics() to authenticated;
grant execute on function public.get_public_profile_by_username(text) to anon, authenticated;
grant execute on function public.list_public_profiles(text, int, int) to anon, authenticated;

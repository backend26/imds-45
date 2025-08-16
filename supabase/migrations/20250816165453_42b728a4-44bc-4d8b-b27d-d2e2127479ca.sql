-- Fix security definer views by dropping them and replacing with functions

-- 1. Drop the existing views that use security definer
DROP VIEW IF EXISTS public.admin_analytics CASCADE;
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- 2. Create a function for admin analytics instead of view
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE(
  total_users bigint,
  users_this_month bigint,
  users_last_month bigint,
  total_published_posts bigint,
  posts_this_month bigint,
  total_comments bigint,
  total_likes bigint,
  pending_reports bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    (SELECT count(*) FROM profiles) AS total_users,
    (SELECT count(*) FROM profiles WHERE created_at >= (CURRENT_DATE - '30 days'::interval)) AS users_this_month,
    (SELECT count(*) FROM profiles WHERE created_at >= (CURRENT_DATE - '60 days'::interval) AND created_at < (CURRENT_DATE - '30 days'::interval)) AS users_last_month,
    (SELECT count(*) FROM posts WHERE status = 'published') AS total_published_posts,
    (SELECT count(*) FROM posts WHERE published_at >= (CURRENT_DATE - '30 days'::interval)) AS posts_this_month,
    (SELECT count(*) FROM comments) AS total_comments,
    (SELECT count(*) FROM post_likes) AS total_likes,
    (SELECT count(*) FROM post_reports WHERE status = 'pending') AS pending_reports;
$function$;

-- 3. Create a function for public profiles instead of view  
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  bio text,
  location text,
  birth_date date,
  profile_picture_url text,
  banner_url text,
  privacy_settings jsonb,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id, user_id, username, display_name, bio, location, 
    birth_date, profile_picture_url, banner_url, 
    privacy_settings, created_at
  FROM profiles 
  WHERE is_banned = false;
$function$;
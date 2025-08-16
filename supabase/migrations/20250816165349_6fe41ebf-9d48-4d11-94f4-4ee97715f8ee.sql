-- Fix all remaining functions without explicit search_path

-- Update all security definer functions to have explicit search_path
CREATE OR REPLACE FUNCTION public.validate_profile_username_uniqueness()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  existing_username_count integer;
begin
  if new.username is not null then
    select count(*) into existing_username_count
    from public.profiles
    where username = new.username
      and (tg_op = 'INSERT' or user_id <> new.user_id);

    if existing_username_count > 0 then
      raise exception 'Username già esistente: %', new.username;
    end if;
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  user_email TEXT;
BEGIN
  SELECT au.email INTO user_email
  FROM auth.users au
  JOIN public.profiles p ON p.user_id = au.id
  WHERE p.username = username_input
  AND p.is_banned = false
  LIMIT 1;
  
  RETURN user_email;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notification if user is not commenting on their own post
  IF NEW.author_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, related_post_id)
    VALUES (
      (SELECT author_id FROM public.posts WHERE id = NEW.post_id),
      NEW.author_id,
      'comment'::notification_type,
      NEW.post_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notification if user is not liking their own post
  IF NEW.user_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, related_post_id)
    VALUES (
      (SELECT author_id FROM public.posts WHERE id = NEW.post_id),
      NEW.user_id,
      'like'::notification_type,
      NEW.post_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (recipient_id, actor_id, type)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'new_follower'::notification_type
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (
    user_id, 
    enabled, 
    push_enabled, 
    email_enabled,
    likes_on_posts,
    comments_on_posts,
    replies_to_comments,
    mentions,
    new_followers,
    posts_from_followed_authors,
    posts_by_sport,
    trending_posts,
    featured_posts,
    event_reminders,
    live_events,
    favorite_team_updates,
    email_digest_frequency
  ) VALUES (
    NEW.id,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    '{"calcio": true, "tennis": true, "f1": true, "basket": true, "nfl": true}'::jsonb,
    true,
    true,
    true,
    true,
    true,
    'weekly'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_change_username(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  last_change TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_username_change INTO last_change
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- Se non c'è mai stato un cambio o sono passati più di 15 giorni
  RETURN (last_change IS NULL OR last_change < NOW() - INTERVAL '15 days');
END;
$function$;
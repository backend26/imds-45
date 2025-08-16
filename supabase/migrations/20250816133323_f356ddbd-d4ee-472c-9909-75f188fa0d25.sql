-- 1. Create trigger for automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile with data from user metadata
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name,
    role,
    accepted_terms_at,
    privacy_settings
  )
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'username', 
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'username', 
      'User ' || substr(NEW.id::text, 1, 8)
    ),
    'journalist'::app_role,
    NOW(),
    '{
      "email": false,
      "birth_date": false,
      "location": false,
      "activity": true,
      "posts": true,
      "likes": false,
      "bookmarks": false
    }'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup process
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Update public_profiles view
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  bio,
  profile_picture_url,
  banner_url,
  role,
  preferred_sports,
  created_at,
  location,
  birth_date,
  privacy_settings
FROM public.profiles
WHERE is_banned = false;

-- Grant public read access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3. Create notification triggers

-- Function for comment notifications
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Function for like notifications
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Function for follow notifications
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, actor_id, type)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'new_follower'::notification_type
  );
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trg_comments_create_notification ON public.comments;
CREATE TRIGGER trg_comments_create_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();

DROP TRIGGER IF EXISTS trg_post_likes_create_notification ON public.post_likes;
CREATE TRIGGER trg_post_likes_create_notification
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

DROP TRIGGER IF EXISTS trg_follows_create_notification ON public.follows;
CREATE TRIGGER trg_follows_create_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.create_follow_notification();

-- 4. Update foreign key constraints to CASCADE DELETE
-- First, drop existing foreign key constraints and recreate with CASCADE

-- notification_preferences
ALTER TABLE public.notification_preferences 
DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;

ALTER TABLE public.notification_preferences 
ADD CONSTRAINT notification_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- user_sessions  
ALTER TABLE public.user_sessions
DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

ALTER TABLE public.user_sessions
ADD CONSTRAINT user_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- user_activity
ALTER TABLE public.user_activity
DROP CONSTRAINT IF EXISTS user_activity_user_id_fkey;

ALTER TABLE public.user_activity
ADD CONSTRAINT user_activity_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- data_exports
ALTER TABLE public.data_exports
DROP CONSTRAINT IF EXISTS data_exports_user_id_fkey;

ALTER TABLE public.data_exports
ADD CONSTRAINT data_exports_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- data_deletions
ALTER TABLE public.data_deletions
DROP CONSTRAINT IF EXISTS data_deletions_user_id_fkey;

ALTER TABLE public.data_deletions
ADD CONSTRAINT data_deletions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- search_analytics
ALTER TABLE public.search_analytics
DROP CONSTRAINT IF EXISTS search_analytics_user_id_fkey;

ALTER TABLE public.search_analytics
ADD CONSTRAINT search_analytics_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- follows
ALTER TABLE public.follows
DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;

ALTER TABLE public.follows
ADD CONSTRAINT follows_follower_id_fkey
FOREIGN KEY (follower_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.follows
DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE public.follows
ADD CONSTRAINT follows_following_id_fkey
FOREIGN KEY (following_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- posts
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

ALTER TABLE public.posts
ADD CONSTRAINT posts_author_id_fkey
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- comments
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_author_id_fkey
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- post_likes
ALTER TABLE public.post_likes
DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- bookmarked_posts
ALTER TABLE public.bookmarked_posts
DROP CONSTRAINT IF EXISTS bookmarked_posts_user_id_fkey;

ALTER TABLE public.bookmarked_posts
ADD CONSTRAINT bookmarked_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- post_ratings
ALTER TABLE public.post_ratings
DROP CONSTRAINT IF EXISTS post_ratings_user_id_fkey;

ALTER TABLE public.post_ratings
ADD CONSTRAINT post_ratings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- notifications
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
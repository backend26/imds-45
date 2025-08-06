-- Fix remaining function search paths and add missing policies
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Add RLS policy for categories table
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_ratings_updated_at
  BEFORE UPDATE ON public.post_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create triggers for notifications on likes and comments
CREATE TRIGGER create_like_notification_trigger
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

CREATE TRIGGER create_comment_notification_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();
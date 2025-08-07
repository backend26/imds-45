-- Sistemare le funzioni rimanenti con search_path mancante
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
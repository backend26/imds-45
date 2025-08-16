-- Fix notification_preferences RLS policies
DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can manage their notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Create function to initialize default notification preferences
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS create_default_notification_preferences_trigger ON auth.users;
CREATE TRIGGER create_default_notification_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();
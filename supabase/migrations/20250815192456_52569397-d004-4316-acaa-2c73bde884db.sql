-- Sports Events Management System
CREATE TABLE public.sports_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sport_category text NOT NULL,
  event_type text NOT NULL DEFAULT 'match',
  teams jsonb DEFAULT '[]'::jsonb,
  location text,
  venue text,
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz,
  timezone text DEFAULT 'Europe/Rome',
  status text DEFAULT 'scheduled',
  priority integer DEFAULT 1,
  external_id text,
  live_score jsonb DEFAULT '{}'::jsonb,
  streaming_url text,
  ticket_url text,
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trending Topics System
CREATE TABLE public.trending_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  mention_count integer DEFAULT 0,
  period text DEFAULT 'daily',
  sport_category text,
  score decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Notification Preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(user_id),
  enabled boolean DEFAULT true,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '08:00',
  likes_on_posts boolean DEFAULT true,
  likes_on_comments boolean DEFAULT true,
  comments_on_posts boolean DEFAULT true,
  replies_to_comments boolean DEFAULT true,
  mentions boolean DEFAULT true,
  new_followers boolean DEFAULT true,
  posts_from_all_authors boolean DEFAULT false,
  posts_from_followed_authors boolean DEFAULT true,
  posts_by_sport jsonb DEFAULT '{"calcio": true, "tennis": true, "f1": true, "basket": true, "nfl": true}'::jsonb,
  trending_posts boolean DEFAULT true,
  featured_posts boolean DEFAULT true,
  event_reminders boolean DEFAULT true,
  live_events boolean DEFAULT true,
  score_updates boolean DEFAULT false,
  favorite_team_updates boolean DEFAULT true,
  rating_milestones boolean DEFAULT true,
  badges_earned boolean DEFAULT true,
  content_moderation boolean DEFAULT true,
  system_announcements boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT false,
  email_digest_frequency text DEFAULT 'weekly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Login Sessions with Geolocation
CREATE TABLE public.login_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id),
  ip_address inet,
  user_agent text,
  location_data jsonb DEFAULT '{}'::jsonb,
  device_fingerprint text,
  login_method text DEFAULT 'email',
  is_new_location boolean DEFAULT false,
  is_suspicious boolean DEFAULT false,
  session_duration interval,
  logged_in_at timestamptz DEFAULT now(),
  logged_out_at timestamptz
);

-- Search Analytics
CREATE TABLE public.search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id),
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  clicked_result_id uuid,
  created_at timestamptz DEFAULT now()
);

-- User Activity Tracking
CREATE TABLE public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id),
  activity_type text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sports_events
CREATE POLICY "Anyone can view published events" ON public.sports_events FOR SELECT USING (true);
CREATE POLICY "Editors can manage events" ON public.sports_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('administrator', 'editor', 'journalist'))
);

-- RLS Policies for trending_topics
CREATE POLICY "Anyone can view trending topics" ON public.trending_topics FOR SELECT USING (true);
CREATE POLICY "System can manage trending topics" ON public.trending_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences FOR ALL USING (user_id = auth.uid());

-- RLS Policies for login_sessions
CREATE POLICY "Users can view their own sessions" ON public.login_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage sessions" ON public.login_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all sessions" ON public.login_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- RLS Policies for search_analytics
CREATE POLICY "Users can manage their search analytics" ON public.search_analytics FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity" ON public.user_activity FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can track user activity" ON public.user_activity FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all activity" ON public.user_activity FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Triggers for updated_at
CREATE TRIGGER update_sports_events_updated_at BEFORE UPDATE ON public.sports_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trending_topics_updated_at BEFORE UPDATE ON public.trending_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indices for performance
CREATE INDEX idx_sports_events_start_datetime ON public.sports_events (start_datetime);
CREATE INDEX idx_sports_events_sport_category ON public.sports_events (sport_category);
CREATE INDEX idx_sports_events_status ON public.sports_events (status);
CREATE INDEX idx_trending_topics_score ON public.trending_topics (score DESC);
CREATE INDEX idx_trending_topics_period_category ON public.trending_topics (period, sport_category);
CREATE INDEX idx_login_sessions_user_id_time ON public.login_sessions (user_id, logged_in_at DESC);
CREATE INDEX idx_search_analytics_query ON public.search_analytics (query);
CREATE INDEX idx_user_activity_user_type_time ON public.user_activity (user_id, activity_type, created_at DESC);

-- Insert default notification preferences for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT user_id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Insert some sample trending topics
INSERT INTO public.trending_topics (topic, mention_count, period, sport_category, score) VALUES
('Champions League', 156, 'daily', 'calcio', 95.5),
('Serie A', 142, 'daily', 'calcio', 89.2),
('US Open', 98, 'daily', 'tennis', 76.3),
('Formula 1', 134, 'daily', 'f1', 88.7),
('NBA Finals', 87, 'daily', 'basket', 71.4),
('Super Bowl', 203, 'weekly', 'nfl', 98.9);

-- Insert sample sports events
INSERT INTO public.sports_events (title, description, sport_category, event_type, teams, location, venue, start_datetime, status, priority) VALUES
('Inter vs Milan - Derby della Madonnina', 'Il derby più atteso della stagione', 'calcio', 'match', 
 '[{"name": "Inter", "logo": "/assets/images/inter-logo.png"}, {"name": "Milan", "logo": "/assets/images/milan-logo.png"}]'::jsonb,
 'Milano, Italia', 'Stadio San Siro', '2025-08-20 20:45:00+02', 'scheduled', 5),
('Gran Premio d''Italia - Monza', 'Formula 1 torna in Italia', 'f1', 'race',
 '[{"name": "Ferrari", "logo": "/assets/images/ferrari-logo.png"}, {"name": "Red Bull", "logo": "/assets/images/redbull-logo.png"}]'::jsonb,
 'Monza, Italia', 'Autodromo Nazionale Monza', '2025-08-24 15:00:00+02', 'scheduled', 5),
('Roland Garros - Finale', 'La finale del torneo francese', 'tennis', 'match',
 '[{"name": "Jannik Sinner", "logo": "/assets/images/sinner-logo.png"}, {"name": "Carlos Alcaraz", "logo": "/assets/images/alcaraz-logo.png"}]'::jsonb,
 'Parigi, Francia', 'Court Philippe-Chatrier', '2025-08-18 15:00:00+02', 'scheduled', 4);
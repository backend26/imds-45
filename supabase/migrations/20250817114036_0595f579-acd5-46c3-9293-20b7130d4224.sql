-- Fix follows table: add id column as primary key
ALTER TABLE public.follows ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Create proper indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_relation ON public.follows(follower_id, following_id);

-- Ensure sports_events table exists with all necessary columns
CREATE TABLE IF NOT EXISTS public.sports_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sport_category TEXT NOT NULL,
  event_type TEXT DEFAULT 'match',
  location TEXT,
  venue TEXT,
  timezone TEXT DEFAULT 'Europe/Rome',
  status TEXT DEFAULT 'scheduled',
  external_id TEXT,
  streaming_url TEXT,
  ticket_url TEXT,
  created_by UUID,
  teams JSONB DEFAULT '[]',
  live_score JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for sports_events
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events" ON public.sports_events
  FOR SELECT USING (true);

CREATE POLICY "Editors can manage events" ON public.sports_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('administrator', 'editor', 'journalist')
    )
  );

-- Storage bucket permissions for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
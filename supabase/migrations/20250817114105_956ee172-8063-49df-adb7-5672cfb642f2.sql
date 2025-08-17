-- Remove the failed column and use composite primary key approach
-- The follows table already has the correct composite primary key

-- Ensure sports_events table exists properly
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

DROP POLICY IF EXISTS "Anyone can view published events" ON public.sports_events;
CREATE POLICY "Anyone can view published events" ON public.sports_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Editors can manage events" ON public.sports_events;
CREATE POLICY "Editors can manage events" ON public.sports_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('administrator', 'editor', 'journalist')
    )
  );

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Clean up existing storage policies first
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

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
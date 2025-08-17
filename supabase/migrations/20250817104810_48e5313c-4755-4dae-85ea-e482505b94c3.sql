-- Create sports_events table for managing sports events
CREATE TABLE IF NOT EXISTS public.sports_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sport_category TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'match',
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  location TEXT,
  venue TEXT,
  timezone TEXT DEFAULT 'Europe/Rome',
  status TEXT DEFAULT 'scheduled',
  teams JSONB DEFAULT '[]',
  live_score JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  external_id TEXT,
  streaming_url TEXT,
  ticket_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published events"
ON public.sports_events
FOR SELECT
USING (true);

CREATE POLICY "Editors can manage events"
ON public.sports_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('administrator', 'editor', 'journalist')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_sports_events_updated_at
  BEFORE UPDATE ON public.sports_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create comment_reports table for reporting system
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for comment reports
CREATE POLICY "Users can create comment reports" 
ON public.comment_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own comment reports" 
ON public.comment_reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all comment reports" 
ON public.comment_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'administrator'::app_role
));

-- Create notification trigger for comment reports
CREATE OR REPLACE FUNCTION public.create_comment_report_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify admins about new comment report
  INSERT INTO public.notifications (recipient_id, actor_id, type, related_post_id)
  SELECT 
    p.user_id,
    NEW.reporter_id,
    'comment_report'::notification_type,
    c.post_id
  FROM public.profiles p, public.comments c
  WHERE p.role = 'administrator'::app_role 
  AND c.id = NEW.comment_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_report_created
  AFTER INSERT ON public.comment_reports
  FOR EACH ROW EXECUTE FUNCTION public.create_comment_report_notification();
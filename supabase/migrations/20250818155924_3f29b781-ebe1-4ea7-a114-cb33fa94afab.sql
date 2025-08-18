-- 1. Fix cascade deletion for posts
ALTER TABLE post_ratings DROP CONSTRAINT IF EXISTS post_ratings_post_id_fkey;
ALTER TABLE post_ratings ADD CONSTRAINT post_ratings_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE post_likes ADD CONSTRAINT post_likes_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE post_reports DROP CONSTRAINT IF EXISTS post_reports_post_id_fkey;
ALTER TABLE post_reports ADD CONSTRAINT post_reports_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE bookmarked_posts DROP CONSTRAINT IF EXISTS bookmarked_posts_post_id_fkey;
ALTER TABLE bookmarked_posts ADD CONSTRAINT bookmarked_posts_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 2. Create comment_likes table for comment likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  user_id UUID NOT NULL,
  comment_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_likes
CREATE POLICY "Users can manage their comment likes" 
ON public.comment_likes 
FOR ALL 
USING (user_id = auth.uid());

-- 3. Unify roles - change all 'editor' to 'journalist'
UPDATE public.profiles 
SET role = 'journalist' 
WHERE role = 'editor';

-- 4. Update RLS functions to only check for journalist and administrator
CREATE OR REPLACE FUNCTION public.is_user_journalist_or_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role IN ('administrator', 'journalist')
    );
END;
$$;

-- Update existing RLS policies to use the new function
DROP POLICY IF EXISTS "Editors can manage events" ON public.sports_events;
CREATE POLICY "Journalists can manage events" 
ON public.sports_events 
FOR ALL 
USING (public.is_user_journalist_or_admin());

-- 5. Create function to get real trending data
CREATE OR REPLACE FUNCTION public.update_trending_topics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear existing trending topics
  DELETE FROM public.trending_topics;
  
  -- Insert real trending topics based on post engagement
  INSERT INTO public.trending_topics (topic, score, mention_count, sport_category)
  WITH post_engagement AS (
    SELECT 
      p.tags,
      c.name as category_name,
      COUNT(*) as post_count,
      COALESCE(SUM(likes.like_count), 0) as total_likes,
      COALESCE(SUM(comments.comment_count), 0) as total_comments
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as like_count
      FROM post_likes
      WHERE created_at > now() - interval '7 days'
      GROUP BY post_id
    ) likes ON p.id = likes.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as comment_count
      FROM comments
      WHERE created_at > now() - interval '7 days'
      GROUP BY post_id
    ) comments ON p.id = comments.post_id
    WHERE p.published_at IS NOT NULL 
      AND p.published_at > now() - interval '7 days'
      AND p.tags IS NOT NULL
    GROUP BY c.name, p.tags
  ),
  tag_scores AS (
    SELECT 
      unnest(pe.tags) as tag,
      pe.category_name,
      SUM(pe.post_count * 1.0 + pe.total_likes * 0.5 + pe.total_comments * 0.3) as score,
      SUM(pe.post_count) as mention_count
    FROM post_engagement pe
    GROUP BY unnest(pe.tags), pe.category_name
  )
  SELECT 
    tag,
    score,
    mention_count::integer,
    category_name
  FROM tag_scores
  WHERE score > 0
  ORDER BY score DESC
  LIMIT 10;
END;
$$;
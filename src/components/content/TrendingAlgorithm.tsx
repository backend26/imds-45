import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Flame, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TrendingPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  trendingScore: number;
  engagement: {
    likes: number;
    comments: number;
    views: number;
  };
  velocityScore: number;
}

interface TrendingAlgorithmProps {
  className?: string;
  limit?: number;
}

export const TrendingAlgorithm = ({ className, limit = 10 }: TrendingAlgorithmProps) => {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const navigate = useNavigate();

  useEffect(() => {
    calculateTrendingPosts();
  }, [timeWindow, limit]);

  const calculateTrendingPosts = async () => {
    setIsLoading(true);
    try {
      // Get time window boundaries
      const now = new Date();
      const windowStart = new Date(now);
      
      switch (timeWindow) {
        case '1h':
          windowStart.setHours(now.getHours() - 1);
          break;
        case '6h':
          windowStart.setHours(now.getHours() - 6);
          break;
        case '24h':
          windowStart.setDate(now.getDate() - 1);
          break;
        case '7d':
          windowStart.setDate(now.getDate() - 7);
          break;
      }

      // Fetch posts with engagement metrics
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id, title, excerpt, featured_image_url, cover_images, published_at, created_at,
          categories:category_id (name),
          profiles:author_id (display_name, username)
        `)
        .eq('status', 'published')
        .gte('published_at', windowStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (!posts) {
        setTrendingPosts([]);
        return;
      }

      // Get engagement metrics for these posts
      const postIds = posts.map(p => p.id);
      const { data: metrics } = await supabase.rpc('get_post_metrics', { 
        post_ids: postIds 
      });

      // Calculate trending scores for each post
      const trendings: TrendingPost[] = posts.map(post => {
        const postMetrics = Array.isArray(metrics) 
          ? metrics.find((m: any) => m.post_id === post.id) 
          : null;
        
        const likes = Number(postMetrics?.like_count) || 0;
        const comments = Number(postMetrics?.comment_count) || 0;
        const views = Math.floor(Math.random() * 1000) + likes * 10; // Simulate views

        // Calculate time decay factor
        const postTime = new Date(post.published_at || post.created_at);
        const hoursOld = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0.1, 1 / Math.pow(hoursOld + 1, 0.3));

        // Calculate engagement velocity (engagement per hour)
        const totalEngagement = likes * 3 + comments * 5 + views * 0.1;
        const velocityScore = totalEngagement / (hoursOld + 0.5);

        // Calculate trending score with weighted factors
        const trendingScore = (
          likes * 2 +           // Likes weight
          comments * 4 +       // Comments weight (higher)
          views * 0.05 +       // Views weight (lower)
          velocityScore * 10   // Velocity bonus
        ) * timeDecay;

        return {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          category: post.categories?.name || 'News',
          author: post.profiles?.display_name || post.profiles?.username || 'Redazione',
          publishedAt: post.published_at || post.created_at,
          imageUrl: (typeof post.cover_images === 'string' ? post.cover_images : post.featured_image_url) as string,
          trendingScore,
          engagement: { likes, comments, views },
          velocityScore
        };
      });

      // Sort by trending score and limit results
      const sortedTrending = trendings
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit);

      setTrendingPosts(sortedTrending);

      // Update trending_topics table for analytics
      if (sortedTrending.length > 0) {
        const topTopics = sortedTrending.slice(0, 5).map(post => ({
          topic: post.title,
          sport_category: post.category.toLowerCase(),
          score: post.trendingScore,
          mention_count: post.engagement.likes + post.engagement.comments,
          period: timeWindow
        }));

        // Fallback: Skip trending topics storage (requires trending_topics table)
        console.log('Trending topics calculated:', topTopics.length, 'topics');
        // await supabase.from('trending_topics').upsert(topTopics, {
        //   onConflict: 'topic,period'  
        // });
      }

    } catch (error) {
      console.error('Error calculating trending posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingIcon = (score: number) => {
    if (score > 100) return <Flame className="h-4 w-4 text-red-500" />;
    if (score > 50) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <TrendingUp className="h-4 w-4 text-yellow-500" />;
  };

  const formatScore = (score: number) => {
    if (score > 1000) return `${(score / 1000).toFixed(1)}k`;
    return Math.round(score).toString();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Trending Now
          </div>
          <div className="flex gap-1">
            {(['1h', '6h', '24h', '7d'] as const).map(window => (
              <Button
                key={window}
                variant={timeWindow === window ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeWindow(window)}
                className="text-xs h-7 px-2"
              >
                {window}
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : trendingPosts.length > 0 ? (
          trendingPosts.map((post, index) => (
            <div
              key={post.id}
              className="group p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs font-mono">
                    #{index + 1}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getTrendingIcon(post.trendingScore)}
                      <span>{formatScore(post.trendingScore)}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(post.publishedAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      ❤️ {post.engagement.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {post.engagement.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.engagement.views}
                    </span>
                    <span className="text-primary font-medium">
                      🚀 {formatScore(post.velocityScore)}/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessun contenuto trending nel periodo selezionato</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
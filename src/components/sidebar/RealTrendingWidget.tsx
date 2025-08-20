import { useState, useEffect } from 'react';
import { TrendingUp, Hash, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTag {
  tag: string;
  post_count: number;
  view_count: number;
  score: number;
  sport_category?: string;
}

export const RealTrendingWidget = () => {
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        // Get posts with tags and their view counts from the last 7 days
        const { data: postsData, error } = await supabase
          .from('posts')
          .select(`
            id,
            tags,
            created_at,
            categories:category_id (name)
          `)
          .eq('status', 'published')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .not('tags', 'is', null);

        if (error) throw error;

        // Get view counts for these posts
        const postIds = postsData?.map(p => p.id) || [];
        let viewCounts: Record<string, number> = {};
        
        if (postIds.length > 0) {
          const { data: viewsData } = await supabase
            .from('post_views')
            .select('post_id, created_at')
            .in('post_id', postIds);

          // Count views per post
          viewCounts = (viewsData || []).reduce((acc, view) => {
            acc[view.post_id] = (acc[view.post_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }

        // Process tags and calculate scores
        const tagStats: Record<string, { 
          post_count: number; 
          view_count: number; 
          sport_category?: string;
        }> = {};

        postsData?.forEach(post => {
          if (post.tags && Array.isArray(post.tags)) {
            const postViews = viewCounts[post.id] || 0;
            const category = post.categories?.name?.toLowerCase();
            
            post.tags.forEach((tag: string) => {
              if (!tagStats[tag]) {
                tagStats[tag] = { post_count: 0, view_count: 0, sport_category: category };
              }
              tagStats[tag].post_count += 1;
              tagStats[tag].view_count += postViews;
            });
          }
        });

        // Convert to array and calculate trending score
        const trending = Object.entries(tagStats)
          .map(([tag, stats]) => ({
            tag,
            post_count: stats.post_count,
            view_count: stats.view_count,
            score: stats.post_count * 10 + stats.view_count * 2, // Weighted score
            sport_category: stats.sport_category
          }))
          .filter(item => item.post_count > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        setTrendingTags(trending);
      } catch (error) {
        console.error('Error fetching trending tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTags();

    // Refresh every 10 minutes
    const interval = setInterval(fetchTrendingTags, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSportBadgeVariant = (sport?: string) => {
    switch (sport) {
      case 'calcio': return 'default';
      case 'tennis': return 'secondary';
      case 'f1': return 'destructive';
      case 'basket': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend del Momento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trend del Momento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingTags.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun trend disponibile</p>
            </div>
          ) : (
            trendingTags.map((item, index) => (
              <div key={item.tag} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{item.tag}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.sport_category && (
                        <Badge variant={getSportBadgeVariant(item.sport_category)} className="text-xs px-1 py-0">
                          {item.sport_category.toUpperCase()}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {item.post_count} post
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {item.view_count}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-primary">
                    {item.score}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
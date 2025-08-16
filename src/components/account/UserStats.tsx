import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Star, TrendingUp, Heart, MessageCircle } from 'lucide-react';

interface UserStatsData {
  posts_count: number;
  likes_received: number;
  comments_received: number;
  followers_count: number;
  following_count: number;
}

export const UserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsData>({
    posts_count: 0,
    likes_received: 0,
    comments_received: 0,
    followers_count: 0,
    following_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Load posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user!.id)
        .not('published_at', 'is', null);

      // Load followers/following counts
      const [
        { count: followersCount },
        { count: followingCount }
      ] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', user!.id),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', user!.id)
      ]);

      // Try to get author stats (likes and comments received)
      try {
        const { data: authorStats } = await supabase
          .rpc('get_author_stats', { author_uuid: user!.id });
        
        if (authorStats && authorStats[0]) {
          setStats({
            posts_count: postsCount || 0,
            likes_received: Number(authorStats[0].likes_received) || 0,
            comments_received: Number(authorStats[0].comments_received) || 0,
            followers_count: followersCount || 0,
            following_count: followingCount || 0,
          });
        } else {
          // Fallback if RPC function doesn't exist
          setStats({
            posts_count: postsCount || 0,
            likes_received: 0,
            comments_received: 0,
            followers_count: followersCount || 0,
            following_count: followingCount || 0,
          });
        }
      } catch (rpcError) {
        // RPC function might not exist, use basic stats
        setStats({
          posts_count: postsCount || 0,
          likes_received: 0,
          comments_received: 0,
          followers_count: followersCount || 0,
          following_count: followingCount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            Statistiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" />
          Le Tue Statistiche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Post pubblicati</span>
          </div>
          <Badge variant="secondary">{stats.posts_count}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Like ricevuti</span>
          </div>
          <Badge variant="secondary">{stats.likes_received}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Commenti ricevuti</span>
          </div>
          <Badge variant="secondary">{stats.comments_received}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Follower</span>
          <Badge variant="outline">{stats.followers_count}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Seguiti</span>
          <Badge variant="outline">{stats.following_count}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
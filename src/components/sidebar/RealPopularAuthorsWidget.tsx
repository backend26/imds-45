import { useState, useEffect } from 'react';
import { Users, User, TrendingUp, Eye, MessageCircle, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PopularAuthor {
  user_id: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  role: string;
  posts_count: number;
  likes_received: number;
  comments_received: number;
  total_engagement: number;
}

export const RealPopularAuthorsWidget = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<PopularAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularAuthors();
  }, []);

  const fetchPopularAuthors = async () => {
    try {
      // Get authors with their stats using the existing database function
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, profile_picture_url, role')
        .in('role', ['journalist', 'administrator'])
        .eq('is_banned', false);

      if (profilesError) throw profilesError;

      if (!profilesData || profilesData.length === 0) {
        setAuthors([]);
        setLoading(false);
        return;
      }

      // Get stats for each author
      const authorsWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            const { data: stats } = await supabase
              .rpc('get_author_stats', { author_uuid: profile.user_id });

            const statsData = stats?.[0] || { posts_count: 0, likes_received: 0, comments_received: 0 };
            
            return {
              ...profile,
              posts_count: Number(statsData.posts_count) || 0,
              likes_received: Number(statsData.likes_received) || 0,
              comments_received: Number(statsData.comments_received) || 0,
              total_engagement: Number(statsData.likes_received) + Number(statsData.comments_received) || 0
            };
          } catch (error) {
            console.error(`Error fetching stats for ${profile.username}:`, error);
            return {
              ...profile,
              posts_count: 0,
              likes_received: 0,
              comments_received: 0,
              total_engagement: 0
            };
          }
        })
      );

      // Sort by total engagement and take top 5
      const sortedAuthors = authorsWithStats
        .sort((a, b) => b.total_engagement - a.total_engagement)
        .slice(0, 5);

      setAuthors(sortedAuthors);
    } catch (error) {
      console.error('Error fetching popular authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = (username: string) => {
    navigate(`/@${username}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Badge variant="destructive" className="text-xs px-1 py-0">Admin</Badge>;
      case 'journalist':
        return <Badge variant="default" className="text-xs px-1 py-0">Journalist</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Autori Popolari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-2/3 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Autori Popolari
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {authors.length > 0 ? (
            authors.map((author, index) => (
              <div 
                key={author.user_id} 
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                onClick={() => handleAuthorClick(author.username)}
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-sm text-muted-foreground w-4 text-center">
                    {index + 1}
                  </span>
                  <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={author.profile_picture_url} />
                    <AvatarFallback className="text-xs">
                      {author.display_name?.charAt(0) || author.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {author.display_name || author.username}
                    </span>
                    {getRoleBadge(author.role)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{author.posts_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{author.likes_received}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{author.comments_received}</span>
                    </div>
                  </div>
                </div>
                
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-primary">
                      {author.total_engagement}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      interazioni
                    </div>
                  </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-2">
                Nessun autore trovato
              </p>
              <p className="text-xs text-muted-foreground">
                Gli autori più attivi appariranno qui
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
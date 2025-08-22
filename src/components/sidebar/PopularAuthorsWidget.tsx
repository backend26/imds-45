import { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthorStats {
  author: {
    id: string;
    username: string;
    display_name: string;
    profile_picture_url?: string;
    role: string;
    bio?: string;
  };
  postsCount: number;
  totalLikes: number;
  totalComments: number;
  engagementScore: number;
}

export const PopularAuthorsWidget = () => {
  const [authors, setAuthors] = useState<AuthorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularAuthors = async () => {
      try {
        // Get authors with their post counts and engagement metrics
        const { data: authorsData, error } = await supabase
          .from('profiles')
          .select(`
            *,
            posts!posts_author_id_fkey (
              id,
              created_at,
              post_likes (count),
              comments (count)
            )
          `)
          .in('role', ['administrator', 'editor', 'journalist'])
          .eq('is_banned', false);

        if (error) throw error;

        // Calculate engagement scores
        const authorsWithStats: AuthorStats[] = authorsData
          .map((author: any) => {
            const posts = author.posts || [];
            const postsCount = posts.length;
            const totalLikes = posts.reduce((sum: number, post: any) => 
              sum + (post.post_likes?.[0]?.count || 0), 0);
            const totalComments = posts.reduce((sum: number, post: any) => 
              sum + (post.comments?.[0]?.count || 0), 0);
            
            // Simple engagement score calculation
            const engagementScore = postsCount > 0 
              ? (totalLikes + totalComments * 2) / postsCount 
              : 0;

            return {
              author: {
                id: author.id,
                user_id: author.user_id,
                username: author.username,
                display_name: author.display_name,
                bio: author.bio,
                profile_picture_url: author.profile_picture_url,
                role: author.role,
                preferred_sports: author.preferred_sports,
                created_at: author.created_at,
                updated_at: author.updated_at,
                banner_url: author.banner_url,
                location: author.location,
                birth_date: author.birth_date,
                theme_preference: author.theme_preference,
                notification_preferences: author.notification_preferences,
                privacy_settings: author.privacy_settings,
                social_links: author.social_links,
                favorite_team: author.favorite_team,
                favorite_teams: author.favorite_teams,
                is_banned: author.is_banned,
                accepted_terms_at: author.accepted_terms_at,
                cookie_consent: author.cookie_consent,
                cookie_consent_date: author.cookie_consent_date,
                tfa_enabled: author.tfa_enabled,
                tfa_secret: author.tfa_secret,
                login_count: author.login_count,
                last_login: author.last_login,
                last_username_change: author.last_username_change
              },
              postsCount,
              totalLikes,
              totalComments,
              engagementScore
            };
          })
          .filter(author => author.postsCount > 0)
          .sort((a, b) => b.engagementScore - a.engagementScore)
          .slice(0, 5);

        setAuthors(authorsWithStats);
      } catch (error) {
        console.error('Error fetching popular authors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularAuthors();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrator': return 'destructive';
      case 'editor': return 'default';
      case 'journalist': return 'secondary';
      default: return 'outline';
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
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
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
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Autori Popolari
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {authors.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun autore disponibile</p>
            </div>
          ) : (
            authors.map((authorStats, index) => (
              <div key={authorStats.author.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={authorStats.author.profile_picture_url || undefined} />
                    <AvatarFallback>
                      {authorStats.author.display_name?.charAt(0) || authorStats.author.username?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {authorStats.author.display_name || authorStats.author.username}
                    </h4>
                    <Badge variant={getRoleBadgeVariant(authorStats.author.role)} className="text-xs px-1 py-0">
                      {authorStats.author.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {authorStats.postsCount} post
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(authorStats.engagementScore)} eng.
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  Segui
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
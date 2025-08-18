import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, Heart, MessageCircle, Bookmark, Users, TrendingUp, Calendar, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface UserStats {
  posts_count: number;
  likes_received: number;
  comments_received: number;
}

interface RecentPost {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

export const ActivitySection = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({ posts_count: 0, likes_received: 0, comments_received: 0 });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserActivity = async () => {
    if (!user) return;

    try {
      // Fetch basic stats from posts and likes
      const { data: postsCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id);

      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, posts!inner(author_id)', { count: 'exact', head: true })
        .eq('posts.author_id', user.id);

      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, posts!inner(author_id)', { count: 'exact', head: true })
        .eq('posts.author_id', user.id);

      setStats({
        posts_count: postsCount?.length || 0,
        likes_received: likesData?.length || 0,
        comments_received: commentsData?.length || 0,
      });

      // Fetch recent posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, created_at, published_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsData) {
        setRecentPosts(postsData.map(post => ({
          ...post,
          status: post.published_at ? 'published' : 'draft'
        })));
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivity();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Post Pubblicati',
      value: stats.posts_count,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Like Ricevuti',
      value: stats.likes_received,
      icon: Heart,
      color: 'text-red-500'
    },
    {
      title: 'Commenti Ricevuti',
      value: stats.comments_received,
      icon: MessageCircle,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            I Tuoi Post Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post, index) => (
                <div key={post.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={post.status === 'published' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {post.status === 'published' ? 'Pubblicato' : 
                           post.status === 'draft' ? 'Bozza' : 
                           post.status === 'scheduled' ? 'Programmato' : post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.created_at), 'dd MMM yyyy', { locale: it })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/editor/${post.id}/edit`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < recentPosts.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Non hai ancora pubblicato nessun post</p>
              <Button 
                className="mt-3" 
                onClick={() => window.open('/editor/new', '_blank')}
              >
                Scrivi il Primo Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informazioni Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email Account</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Membro dal</span>
            <span className="text-sm font-medium">
              {user?.created_at && format(new Date(user.created_at), 'dd MMMM yyyy', { locale: it })}
            </span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ultimo accesso</span>
            <span className="text-sm font-medium">
              {user?.last_sign_in_at && format(new Date(user.last_sign_in_at), 'dd MMM yyyy - HH:mm', { locale: it })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('/editor/new', '_blank')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Nuovo Post
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(`/@${user?.email?.split('@')[0]}`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vedi Profilo Pubblico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
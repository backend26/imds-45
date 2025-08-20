import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, Star, Flag, Users, Calendar, Clock, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface UserActivity {
  liked_posts: number;
  recent_comments: number;
  bookmarked_posts: number;
  ratings_given: number;
  reports_submitted: number;
}

interface RecentActivity {
  id: string;
  type: 'like' | 'comment' | 'bookmark' | 'rating' | 'report';
  post_title?: string;
  post_id?: string;
  content?: string;
  rating?: number;
  created_at: string;
  status?: string;
}

export const UserActivitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<UserActivity>({ 
    liked_posts: 0, 
    recent_comments: 0, 
    bookmarked_posts: 0, 
    ratings_given: 0, 
    reports_submitted: 0 
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserActivity = async () => {
    if (!user) return;

    try {
      // Get liked posts count
      const { count: likedCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get user comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      // Get bookmarked posts count
      const { count: bookmarkedCount } = await supabase
        .from('bookmarked_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get ratings count
      const { count: ratingsCount } = await supabase
        .from('post_ratings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get reports count
      const { count: reportsCount } = await supabase
        .from('post_reports')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', user.id);

      setActivity({
        liked_posts: likedCount || 0,
        recent_comments: commentsCount || 0,
        bookmarked_posts: bookmarkedCount || 0,
        ratings_given: ratingsCount || 0,
        reports_submitted: reportsCount || 0,
      });

      // Get recent activity (last 10 activities)
      const activities: RecentActivity[] = [];

      // Recent likes
      const { data: likes } = await supabase
        .from('post_likes')
        .select(`
          post_id,
          created_at,
          posts:post_id(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      likes?.forEach(like => {
        activities.push({
          id: like.post_id,
          type: 'like',
          post_title: like.posts?.title,
          post_id: like.post_id,
          created_at: like.created_at
        });
      });

      // Recent comments
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          post_id,
          created_at,
          posts:post_id(title)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      comments?.forEach(comment => {
        activities.push({
          id: comment.id,
          type: 'comment',
          post_title: comment.posts?.title,
          post_id: comment.post_id,
          content: comment.content,
          created_at: comment.created_at
        });
      });

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 8));

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
      title: 'Post Piaciuti',
      value: activity.liked_posts,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20'
    },
    {
      title: 'Commenti Scritti',
      value: activity.recent_comments,
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Post Salvati',
      value: activity.bookmarked_posts,
      icon: Bookmark,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
    },
    {
      title: 'Valutazioni Date',
      value: activity.ratings_given,
      icon: Star,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'bookmark':
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case 'rating':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'report':
        return <Flag className="h-4 w-4 text-orange-500" />;
      default:
        return <FileCheck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'like':
        return `Hai messo mi piace a "${activity.post_title?.substring(0, 40)}..."`;
      case 'comment':
        return `Hai commentato "${activity.post_title?.substring(0, 40)}..."`;
      case 'bookmark':
        return `Hai salvato "${activity.post_title?.substring(0, 40)}..."`;
      case 'rating':
        return `Hai valutato "${activity.post_title?.substring(0, 40)}..." con ${activity.rating} stelle`;
      case 'report':
        return `Hai segnalato un contenuto`;
      default:
        return 'Attività';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attività Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={activity.id + activity.type}>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {getActivityText(activity)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'dd MMM yyyy - HH:mm', { locale: it })}
                        </span>
                        {activity.post_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => navigate(`/post/${activity.post_id}`)}
                          >
                            Vedi post
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nessuna attività recente</p>
              <p className="text-sm">Inizia a esplorare i contenuti per vedere qui la tua attività</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-12"
              onClick={() => navigate('/search?tab=saved')}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              I Miei Preferiti
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-12"
              onClick={() => navigate('/account#preferences')}
            >
              <Star className="h-4 w-4 mr-2" />
              Le Mie Valutazioni
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informazioni Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
    </div>
  );
};
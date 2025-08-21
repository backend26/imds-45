import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Share2, Bookmark, Calendar, User, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from '@/utils/dateUtilsV3';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PostMetricsProps {
  postId: string;
  authorId: string;
  title: string;
  publishedAt: string;
  categoryName: string;
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
}

interface PostStats {
  likes_count: number;
  comments_count: number;
  views_count: number;
  bookmarks_count: number;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  author: {
    username: string;
    display_name: string;
    profile_picture_url?: string;
  };
}

export const EnhancedPostMetrics = ({ 
  postId, 
  authorId, 
  title, 
  publishedAt, 
  categoryName,
  className,
  variant = 'card' 
}: PostMetricsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PostStats>({
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    bookmarks_count: 0,
    user_has_liked: false,
    user_has_bookmarked: false,
    author: {
      username: '',
      display_name: '',
      profile_picture_url: undefined
    }
  });
  const [loading, setLoading] = useState(false);

  // Load post metrics
  const loadMetrics = async () => {
    try {
      // Get author info
      const { data: authorData } = await supabase
        .from('profiles')
        .select('username, display_name, profile_picture_url')
        .eq('user_id', authorId)
        .single();

      // Get post metrics using RPC function if available
      const { data: metricsData } = await supabase
        .rpc('get_post_metrics', { post_ids: [postId] });

      let likes_count = 0;
      let comments_count = 0;
      let bookmarks_count = 0;

      if (metricsData && metricsData.length > 0) {
        const metrics = metricsData[0];
        likes_count = metrics.like_count || 0;
        comments_count = metrics.comment_count || 0;
      }

      // Get views count
      const { count: views_count } = await supabase
        .from('post_views')
        .select('*', { count: 'exact' })
        .eq('post_id', postId);

      // Get bookmarks count
      const { count: bookmarksCount } = await supabase
        .from('bookmarked_posts')
        .select('*', { count: 'exact' })
        .eq('post_id', postId);

      // Check user interactions if logged in
      let user_has_liked = false;
      let user_has_bookmarked = false;

      if (user) {
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        const { data: bookmarkData } = await supabase
          .from('bookmarked_posts')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        user_has_liked = !!likeData;
        user_has_bookmarked = !!bookmarkData;
      }

      setStats({
        likes_count,
        comments_count,
        views_count: views_count || 0,
        bookmarks_count: bookmarksCount || 0,
        user_has_liked,
        user_has_bookmarked,
        author: authorData || { username: '', display_name: 'Autore', profile_picture_url: undefined }
      });
    } catch (error) {
      console.error('Error loading post metrics:', error);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Accedi per mettere mi piace ai post",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (stats.user_has_liked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setStats(prev => ({
          ...prev,
          likes_count: prev.likes_count - 1,
          user_has_liked: false
        }));
      } else {
        // Add like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        setStats(prev => ({
          ...prev,
          likes_count: prev.likes_count + 1,
          user_has_liked: true
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Accedi per salvare i post",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (stats.user_has_bookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarked_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setStats(prev => ({
          ...prev,
          bookmarks_count: prev.bookmarks_count - 1,
          user_has_bookmarked: false
        }));

        toast({
          title: "Post rimosso dai salvati"
        });
      } else {
        // Add bookmark
        await supabase
          .from('bookmarked_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        setStats(prev => ({
          ...prev,
          bookmarks_count: prev.bookmarks_count + 1,
          user_has_bookmarked: true
        }));

        toast({
          title: "Post salvato",
          description: "Trovi i post salvati nel tuo profilo"
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i salvati",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Leggi "${title}" su I Malati dello Sport`,
          url: url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiato",
          description: "Il link dell'articolo è stato copiato negli appunti"
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Errore",
          description: "Impossibile copiare il link",
          variant: "destructive"
        });
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}>
        <div className="flex items-center gap-1">
          <Heart className={cn("h-3 w-3", stats.user_has_liked && "fill-red-500 text-red-500")} />
          <span>{stats.likes_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{stats.comments_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{stats.views_count}</span>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={cn(
              "h-8 px-2 hover:bg-red-50 dark:hover:bg-red-950/20",
              stats.user_has_liked && "text-red-600 dark:text-red-400"
            )}
          >
            <Heart className={cn("h-4 w-4 mr-1", stats.user_has_liked && "fill-current")} />
            {formatNumber(stats.likes_count)}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/post/${postId}#comments`)}
            className="h-8 px-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {formatNumber(stats.comments_count)}
          </Button>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {formatNumber(stats.views_count)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={loading}
            className={cn(
              "h-8 w-8 p-0",
              stats.user_has_bookmarked && "text-yellow-600 dark:text-yellow-400"
            )}
          >
            <Bookmark className={cn("h-4 w-4", stats.user_has_bookmarked && "fill-current")} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-8 w-8 p-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Author and Category */}
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/profile/${stats.author.username}`)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-medium">
              {stats.author.display_name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium">{stats.author.display_name}</p>
              <p className="text-xs text-muted-foreground">@{stats.author.username}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            {categoryName}
          </Badge>
        </div>

        {/* Publication Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
                    <Heart className={cn("h-4 w-4", stats.user_has_liked && "fill-current")} />
                  </div>
                  <div className="text-lg font-bold">{formatNumber(stats.likes_count)}</div>
                  <div className="text-xs text-muted-foreground">Mi piace</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Persone che hanno messo mi piace</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{formatNumber(stats.comments_count)}</div>
                  <div className="text-xs text-muted-foreground">Commenti</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Numero di commenti</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{formatNumber(stats.views_count)}</div>
                  <div className="text-xs text-muted-foreground">Visualizzazioni</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Persone che hanno letto l'articolo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
                    <Bookmark className={cn("h-4 w-4", stats.user_has_bookmarked && "fill-current")} />
                  </div>
                  <div className="text-lg font-bold">{formatNumber(stats.bookmarks_count)}</div>
                  <div className="text-xs text-muted-foreground">Salvati</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Persone che hanno salvato l'articolo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant={stats.user_has_liked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className="flex-1"
          >
            <Heart className={cn("h-4 w-4 mr-2", stats.user_has_liked && "fill-current")} />
            {stats.user_has_liked ? 'Ti piace' : 'Mi piace'}
          </Button>

          <Button
            variant={stats.user_has_bookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
            disabled={loading}
            className="flex-1"
          >
            <Bookmark className={cn("h-4 w-4 mr-2", stats.user_has_bookmarked && "fill-current")} />
            {stats.user_has_bookmarked ? 'Salvato' : 'Salva'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
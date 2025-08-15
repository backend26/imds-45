import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, Clock, User, ArrowLeft, CalendarDays } from 'lucide-react';
import { SocialInteractions } from '@/components/posts/SocialInteractions';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';
import { getCoverImageFromPost } from '@/utils/getCoverImageFromPost';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  category_id: string;
  published_at: string;
  cover_images: any;
  tags: string[];
  // Joined data
  profiles?: {
    username: string;
    display_name: string;
    profile_picture_url?: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

interface PostStats {
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [stats, setStats] = useState<PostStats>({
    likes: 0,
    comments: 0,
    isLiked: false,
    isBookmarked: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          author_id,
          category_id,
          published_at,
          cover_images,
          tags,
          profiles:author_id (
            username,
            display_name,
            profile_picture_url
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq('id', postId)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Articolo non trovato');
        return;
      }

      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Errore nel caricamento dell\'articolo');
    }
  };

  const fetchStats = async () => {
    if (!postId) return;

    try {
      // Get likes count
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      let isLiked = false;
      let isBookmarked = false;

      if (user) {
      // Check if user liked this post
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

        isLiked = !!likeData;

        // Check if user bookmarked this post
        const { data: bookmarkData } = await supabase
          .from('bookmarked_posts')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        isBookmarked = !!bookmarkData;
      }

      setStats({
        likes: likesCount || 0,
        comments: commentsCount || 0,
        isLiked,
        isBookmarked
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLike = async () => {
    if (!user || !postId) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per mettere mi piace",
        variant: "destructive",
      });
      return;
    }

    try {
      if (stats.isLiked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setStats(prev => ({
          ...prev,
          likes: prev.likes - 1,
          isLiked: false
        }));
      } else {
        // Add like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        setStats(prev => ({
          ...prev,
          likes: prev.likes + 1,
          isLiked: true
        }));
      }
    } catch (err) {
      console.error('Error handling like:', err);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il mi piace",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    if (!user || !postId) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per salvare l'articolo",
        variant: "destructive",
      });
      return;
    }

    try {
      if (stats.isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarked_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setStats(prev => ({
          ...prev,
          isBookmarked: false
        }));
        
        toast({
          title: "Rimosso dai salvati",
          description: "Articolo rimosso dai tuoi salvati",
        });
      } else {
        // Add bookmark
        await supabase
          .from('bookmarked_posts')
          .insert({ post_id: postId, user_id: user.id });

        setStats(prev => ({
          ...prev,
          isBookmarked: true
        }));

        toast({
          title: "Salvato",
          description: "Articolo aggiunto ai tuoi salvati",
        });
      }
    } catch (err) {
      console.error('Error handling bookmark:', err);
      toast({
        title: "Errore",
        description: "Impossibile salvare l'articolo",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiato",
          description: "Il link dell'articolo è stato copiato negli appunti",
        });
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiato",
        description: "Il link dell'articolo è stato copiato negli appunti",
      });
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(textLength / wordsPerMinute);
  };

  useEffect(() => {
    document.title = post ? `${post.title} | Malati dello Sport` : 'Caricamento... | Malati dello Sport';
  }, [post]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPost(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [postId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={false} toggleTheme={() => {}} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={false} toggleTheme={() => {}} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-destructive mb-2">
                {error || 'Articolo non trovato'}
              </h2>
              <p className="text-muted-foreground mb-4">
                L'articolo che stai cercando non è disponibile.
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={false} toggleTheme={() => {}} />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla home
          </Button>

          {post.categories && (
            <Badge variant="secondary" className="mb-4">
              {post.categories.name}
            </Badge>
          )}

          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author info */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                {post.profiles?.profile_picture_url ? (
                  <img 
                    src={post.profiles.profile_picture_url} 
                    alt="Author" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {post.profiles?.display_name || post.profiles?.username || 'Redazione'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(post.published_at).toLocaleDateString('it-IT')}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {calculateReadingTime(post.content)} min di lettura
                  </span>
                </div>
              </div>
            </div>

            {/* Social actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={stats.isLiked ? 'text-red-600 border-red-600' : ''}
              >
                <Heart className={`w-4 h-4 mr-1 ${stats.isLiked ? 'fill-current' : ''}`} />
                {stats.likes}
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                {stats.comments}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={stats.isBookmarked ? 'text-yellow-600 border-yellow-600' : ''}
              >
                <Bookmark className={`w-4 h-4 ${stats.isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Cover image */}
          {(() => {
            const coverImage = getCoverImageFromPost(post);
            return coverImage ? (
              <div className="mb-8">
                <img
                  src={coverImage}
                  alt={post.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            ) : null;
          })()}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, {
                ADD_ATTR: ['style', 'class', 'data-alert-type', 'data-cta', 'data-cta-title', 'data-cta-content', 'data-cta-button'],
                ALLOW_DATA_ATTR: true
              })
            }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostPage;
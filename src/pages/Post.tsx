import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, Clock, User, ArrowLeft, Star, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';
import { SmartImage } from '@/components/ui/smart-image';
import { useEnhancedPostInteractions } from '@/hooks/use-enhanced-post-interactions';
import { useImageUrl } from '@/hooks/use-image-url';
import { PostRatingSystem } from '@/components/posts/PostRatingSystem';
import { PostReportModal } from '@/components/posts/PostReportModal';
import { EnhancedCommentSystem } from '@/components/comments/EnhancedCommentSystem';
import { usePostViews } from '@/hooks/use-post-views';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true);
  });

  // Use enhanced post interactions hook
  const interactions = useEnhancedPostInteractions(postId || '');
  
  // Use post views hook
  const { viewCount, incrementView } = usePostViews(postId || '');
  
  // Gestione robusta dell'URL cover image
  const coverImageUrl = useImageUrl(post?.cover_images);

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

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
      await fetchPost();
      // Increment view after post loads
      if (postId) {
        incrementView();
      }
      setLoading(false);
    };

    loadData();
  }, [postId, user, incrementView]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Apply theme on mount
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
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
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Column */}
          <article className="lg:col-span-2">
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
              <Link 
                to={`/@${post.profiles?.username}`}
                className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity"
              >
                {post.profiles?.profile_picture_url ? (
                  <img 
                    src={post.profiles.profile_picture_url} 
                    alt="Author" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </Link>
              <div>
                <Link 
                  to={`/@${post.profiles?.username}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {post.profiles?.display_name || post.profiles?.username || 'Redazione'}
                </Link>
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
                onClick={interactions.toggleLike}
                disabled={interactions.isLoading}
                className={interactions.isLiked ? 'text-red-600 border-red-600' : ''}
              >
                <Heart className={`w-4 h-4 mr-1 ${interactions.isLiked ? 'fill-current' : ''}`} />
                {interactions.likesCount}
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                {interactions.commentsCount}
              </Button>
              
              <Button variant="outline" size="sm" className="text-muted-foreground">
                <span className="text-xs">{viewCount} visualizzazioni</span>
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={interactions.toggleBookmark}
                disabled={interactions.isLoading}
                className={interactions.isBookmarked ? 'text-yellow-600 border-yellow-600' : ''}
              >
                <Bookmark className={`w-4 h-4 ${interactions.isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <div className="flex items-center gap-1 ml-2">
                {interactions.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="text-sm font-medium">{interactions.averageRating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({interactions.totalRatings})
                    </span>
                  </div>
                )}
                
                <PostReportModal
                  postId={postId!}
                  onReport={interactions.reportPost}
                  isLoading={interactions.isLoading}
                />
              </div>
            </div>
          </div>

          {/* Cover image */}
          {coverImageUrl && coverImageUrl !== '/assets/images/default-banner.jpg' && (
            <div className="mb-8">
              <img 
                src={coverImageUrl} 
                alt={post.title} 
                className="w-full h-96 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/default-banner.jpg';
                }}
              />
            </div>
          )}
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

            {/* Rating System */}
            <div className="mt-8 pt-8 border-t border-border">
              <PostRatingSystem
                postId={postId!}
                currentRating={interactions.userRating}
                onRatingChange={interactions.setRating}
                isLoading={interactions.isLoading}
              />
            </div>
          </article>

          {/* Comments Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <EnhancedCommentSystem postId={postId!} />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostPage;
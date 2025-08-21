import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { ContentPreview } from '@/components/posts/ContentPreview';
import { ArticlePreviewModal } from '@/components/posts/ArticlePreviewModal';
import { Heart, MessageCircle, Eye, Share2, Bookmark, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { usePostInteractions } from '@/hooks/use-post-interactions';
import { usePostViews } from '@/hooks/use-post-views';

interface UltraModernNewsCardProps {
  id?: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
  timeAgo?: string;
  author: string;
  readTime?: string;
  likes: number;
  comments: number;
  views: number;
  className?: string;
  article?: any;
  onClick?: () => void;
}

export const UltraModernNewsCard: React.FC<UltraModernNewsCardProps> = ({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  publishedAt,
  timeAgo,
  author,
  readTime,
  likes,
  comments,
  views,
  className,
  article,
  onClick
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Real Supabase interactions
  const { viewCount } = usePostViews(id || '');
  const {
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    userRating,
    isLoading,
    toggleLike,
    toggleBookmark,
    setRating,
    reportPost
  } = usePostInteractions(id || '', {
    isLiked: false,
    isBookmarked: false,
    likesCount: likes,
    commentsCount: comments
  });

  const displayViews = viewCount || views;

  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const content = contentRef.current;

    if (!card || !image || !content) return;

    const tl = gsap.timeline({ paused: true });
    
    tl.to(image, {
      scale: 1.05,
      duration: 0.4,
      ease: "power2.out"
    })
    .to(content, {
      y: -4,
      duration: 0.3,
      ease: "power2.out"
    }, 0)
    .to(card, {
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 48, 54, 0.1)",
      duration: 0.3,
      ease: "power2.out"
    }, 0);

    const handleMouseEnter = () => {
      setIsHovered(true);
      tl.play();
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      tl.reverse();
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    };
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    
    // Heart burst animation
    gsap.timeline()
      .to(button, {
        scale: 0.8,
        duration: 0.1,
        ease: "power2.in"
      })
      .to(button, {
        scale: 1.2,
        duration: 0.15,
        ease: "back.out(3)"
      })
      .to(button, {
        scale: 1,
        duration: 0.1,
        ease: "power2.out"
      });

    if (!isLiked) {
      // Create floating heart effect
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'absolute pointer-events-none text-lg z-50';
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%, -50%)';
      
      button.appendChild(heart);
      
      gsap.timeline()
        .to(heart, {
          y: -40,
          opacity: 0,
          scale: 1.5,
          duration: 0.8,
          ease: "power2.out"
        })
        .call(() => button.removeChild(heart));
    }
    
    await toggleLike();
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    
    gsap.timeline()
      .to(button, {
        rotateY: 180,
        scale: 0.9,
        duration: 0.2,
        ease: "power2.inOut"
      })
      .to(button, {
        rotateY: 0,
        scale: 1,
        duration: 0.2,
        ease: "power2.inOut"
      });
    
    await toggleBookmark();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Share functionality
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getCategoryGradient = (cat: string): string => {
    const gradients: Record<string, string> = {
      'calcio': 'from-green-500 via-green-600 to-emerald-700',
      'tennis': 'from-yellow-500 via-orange-500 to-red-500',
      'f1': 'from-red-500 via-red-600 to-red-700',
      'basket': 'from-orange-500 via-orange-600 to-amber-700',
      'nfl': 'from-purple-500 via-purple-600 to-indigo-700'
    };
    return gradients[cat.toLowerCase()] || 'from-primary via-primary to-primary';
  };

  return (
    <>
      <Card 
        ref={cardRef}
        className={cn(
          "group cursor-pointer overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm",
          "transition-all duration-300 hover:border-primary/20",
          className
        )}
        onClick={onClick}
      >
        <div className="flex h-32 sm:h-36 md:h-40">
          {/* Image Section - 40% width with dynamic overlay */}
          <div 
            ref={imageRef}
            className="relative w-[40%] min-w-[140px] overflow-hidden"
          >
            <SmartImage
              src={article?.cover_images || imageUrl}
              alt={`Immagine per: ${title}`}
              className="w-full h-full object-cover"
            />
            
            {/* Dynamic category overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-20 mix-blend-multiply",
              getCategoryGradient(category)
            )} />
            
            {/* Category badge with glassmorphism */}
            <Badge className={cn(
              "absolute top-2 left-2 text-xs font-medium border-0",
              "bg-white/20 backdrop-blur-md text-white shadow-lg",
              "transition-all duration-300 group-hover:bg-white/30"
            )}>
              {category.toUpperCase()}
            </Badge>

            {/* Quick preview hint */}
            <div className={cn(
              "absolute bottom-2 right-2 opacity-0 transition-all duration-300",
              "group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            )}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(true);
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content Section - 60% width */}
          <div 
            ref={contentRef}
            className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0"
          >
            {/* Header content */}
            <div className="space-y-2">
              <h3 className={cn(
                "font-bold text-sm sm:text-base lg:text-lg leading-tight",
                "line-clamp-2 group-hover:text-primary transition-colors duration-200",
                "text-foreground"
              )}>
                {title}
              </h3>
              
              {article?.content ? (
                <ContentPreview 
                  content={article.content} 
                  maxLength={80}
                  className="text-xs sm:text-sm text-muted-foreground line-clamp-2"
                />
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {excerpt}
                </p>
              )}
            </div>

            {/* Footer with author and metrics */}
            <div className="space-y-2">
              {/* Author info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="font-medium truncate">{author}</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="shrink-0">{timeAgo || publishedAt}</span>
                {readTime && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <Clock className="h-3 w-3" />
                    <span className="shrink-0">{readTime}</span>
                  </>
                )}
              </div>

              {/* Interaction bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {/* Like button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 px-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 relative",
                      isLiked ? "text-red-500 bg-red-50 dark:bg-red-950/30" : "hover:text-red-500"
                    )}
                    onClick={handleLike}
                    disabled={isLoading}
                  >
                    <Heart className={cn(
                      "h-3 w-3 mr-1 transition-all duration-200",
                      isLiked ? "fill-current" : ""
                    )} />
                    <span className="text-xs font-medium">{formatNumber(likesCount)}</span>
                  </Button>
                  
                  {/* Comments */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    <span className="text-xs font-medium">{formatNumber(commentsCount)}</span>
                  </Button>

                  {/* Views with eye icon */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span className="font-medium">{formatNumber(displayViews)}</span>
                  </div>
                </div>

                {/* Secondary actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 w-6 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all duration-200 relative",
                      isBookmarked ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : "hover:text-yellow-500"
                    )}
                    onClick={handleBookmark}
                    disabled={isLoading}
                  >
                    <Bookmark className={cn(
                      "h-3 w-3 transition-all duration-200",
                      isBookmarked ? "fill-current" : ""
                    )} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreview && article && (
        <ArticlePreviewModal
          article={{
            id: article.id || 'preview',
            title,
            excerpt,
            imageUrl: article?.cover_images || imageUrl,
            category,
            author,
            publishedAt,
            content: article.content || excerpt,
            likes: likesCount,
            comments: commentsCount,
            views: displayViews,
            readTime
          }}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onReadFull={() => {
            setShowPreview(false);
            onClick?.();
          }}
        />
      )}
    </>
  );
};
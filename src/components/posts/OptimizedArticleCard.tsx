import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { ContentPreview } from '@/components/posts/ContentPreview';
import { SocialShareModal } from '@/components/posts/SocialShareModal';
import { Heart, MessageCircle, Eye, Share2, Bookmark, User, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { usePostInteractions } from '@/hooks/use-post-interactions';
import { usePostViews } from '@/hooks/use-post-views';

interface OptimizedArticleCardProps {
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
  views?: number;
  featured?: boolean;
  trending?: boolean;
  className?: string;
  onClick?: () => void;
  article?: any;
}

export const OptimizedArticleCard: React.FC<OptimizedArticleCardProps> = ({
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
  views = 0,
  featured = false,
  trending = false,
  className,
  onClick,
  article
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { viewCount } = usePostViews(id || '');
  const {
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    toggleLike,
    toggleBookmark,
    isLoading
  } = usePostInteractions(id || '', {
    isLiked: false,
    isBookmarked: false,
    likesCount: likes,
    commentsCount: comments
  });

  const displayViews = viewCount || views;

  // Smooth hover animations
  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;

    if (!card || !image) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -4,
        scale: 1.01,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 48, 54, 0.05)"
      });
      gsap.to(image, {
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      });
      gsap.to(image, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Smart number formatting
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Category colors
  const getCategoryColor = (cat: string): string => {
    const colors: Record<string, string> = {
      'calcio': 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      'tennis': 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      'f1': 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      'basket': 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
      'nfl': 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
    };
    return colors[cat.toLowerCase()] || 'text-primary bg-primary/10 border-primary/20';
  };

  // Interaction handlers
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    
    gsap.timeline()
      .to(button, { scale: 0.9, duration: 0.1 })
      .to(button, { scale: 1.1, duration: 0.2, ease: "back.out(2)" })
      .to(button, { scale: 1, duration: 0.1 });

    await toggleLike();
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    
    gsap.timeline()
      .to(button, { scale: 0.9, duration: 0.1 })
      .to(button, { scale: 1.1, duration: 0.2, ease: "back.out(2)" })
      .to(button, { scale: 1, duration: 0.1 });

    await toggleBookmark();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  if (featured) {
    return (
      <>
        <Card 
          ref={cardRef}
          className={cn(
            "group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-background to-background/95",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            className
          )}
          onClick={onClick}
        >
          <div className="relative">
            <div ref={imageRef} className="relative overflow-hidden">
              <SmartImage
                src={article?.cover_images || imageUrl}
                alt={`Immagine per: ${title}`}
                aspectRatio="21/9"
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Category badge */}
              <Badge className={cn(
                "absolute top-4 left-4 text-xs font-semibold border backdrop-blur-sm",
                getCategoryColor(category)
              )}>
                {category.toUpperCase()}
              </Badge>

              {/* Featured badge */}
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground backdrop-blur-sm">
                In Evidenza
              </Badge>

              {/* Trending indicator */}
              {trending && (
                <div className="absolute top-16 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2 shadow-lg">
                  <TrendingUp className="h-4 w-4" />
                </div>
              )}

              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <div className="space-y-4">
                  <h2 className="text-white font-bold text-2xl lg:text-4xl leading-tight">
                    {title}
                  </h2>
                  
                  {/* Using original excerpt for better readability */}
                  <p className="text-white/90 text-lg leading-relaxed line-clamp-2">
                    {excerpt}
                  </p>

                  {/* Author and interaction bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-white/80">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{author}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{timeAgo || publishedAt}</span>
                      </div>
                    </div>

                    {/* Interaction buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-9 px-3 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-0",
                          isLiked ? "text-red-400" : "hover:text-red-400"
                        )}
                        onClick={handleLike}
                        disabled={isLoading}
                      >
                        <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                        <span className="font-medium">{formatNumber(likesCount)}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 bg-black/20 backdrop-blur-sm hover:bg-black/30 hover:text-blue-400 text-white border-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        <span className="font-medium">{formatNumber(commentsCount)}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-9 w-9 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-0",
                          isBookmarked ? "text-yellow-400" : "hover:text-yellow-400"
                        )}
                        onClick={handleBookmark}
                        disabled={isLoading}
                      >
                        <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {showShareModal && (
          <SocialShareModal
            postId={id || ''}
            postTitle={title}
            postUrl={window.location.href}
          />
        )}
      </>
    );
  }

  // Regular article - Vertical layout for better readability
  return (
    <>
      <Card 
        ref={cardRef}
        className={cn(
          "group cursor-pointer overflow-hidden border border-border/50 bg-card",
          "transition-all duration-300 hover:border-primary/30",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Image section */}
          <div 
            ref={imageRef}
            className="relative overflow-hidden"
          >
            <SmartImage
              src={article?.cover_images || imageUrl}
              alt={`Immagine per: ${title}`}
              aspectRatio="4/3"
              className="w-full h-full object-cover"
            />
            
            {/* Category badge */}
            <Badge className={cn(
              "absolute top-3 left-3 text-xs font-medium border shadow-sm backdrop-blur-sm",
              getCategoryColor(category)
            )}>
              {category.toUpperCase()}
            </Badge>

            {/* Trending indicator */}
            {trending && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-1.5 shadow-lg">
                <TrendingUp className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Content section with more padding */}
          <div className="p-5 space-y-4">
            {/* Title - more prominent */}
            <h3 className={cn(
              "font-bold text-lg leading-tight line-clamp-2",
              "group-hover:text-primary transition-colors duration-300",
              "text-foreground"
            )}>
              {title}
            </h3>
            
            {/* Excerpt */}
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
              {excerpt}
            </p>

            {/* Author info - fully visible */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span className="font-medium">{author}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{timeAgo || publishedAt}</span>
            </div>

            {/* Interaction bar - ultra-compact spacing */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                {/* Like button - optimized compact */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200",
                    isLiked ? "text-red-600 bg-red-50 dark:bg-red-950/30" : "hover:text-red-600"
                  )}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <Heart className={cn(
                    "h-3.5 w-3.5 mr-1",
                    isLiked ? "fill-current" : ""
                  )} />
                  <span className="text-xs font-semibold">{formatNumber(likesCount)}</span>
                </Button>
                
                {/* Comments - optimized compact */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs font-semibold">{formatNumber(commentsCount)}</span>
                </Button>

                {/* Views with eye icon - optimized compact */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground px-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-semibold">{formatNumber(displayViews)}</span>
                </div>
              </div>

              {/* Secondary actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all duration-200",
                    isBookmarked ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : "hover:text-yellow-500"
                  )}
                  onClick={handleBookmark}
                  disabled={isLoading}
                >
                  <Bookmark className={cn(
                    "h-4 w-4",
                    isBookmarked ? "fill-current" : ""
                  )} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showShareModal && (
        <SocialShareModal
          postId={id || ''}
          postTitle={title}
          postUrl={window.location.href}
        />
      )}
    </>
  );
};
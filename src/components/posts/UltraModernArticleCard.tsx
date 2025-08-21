import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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

interface UltraModernArticleCardProps {
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

export const UltraModernArticleCard: React.FC<UltraModernArticleCardProps> = ({
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
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Advanced GSAP animations
  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    const content = contentRef.current;

    if (!card || !image || !content) return;

    const tl = gsap.timeline({ paused: true });
    
    tl.to(card, {
      y: -8,
      scale: featured ? 1.01 : 1.02,
      duration: 0.4,
      ease: "power2.out",
      boxShadow: featured 
        ? "0 30px 60px -12px rgba(255, 48, 54, 0.15), 0 0 0 1px rgba(255, 48, 54, 0.05)"
        : "0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 48, 54, 0.05)"
    })
    .to(image, {
      scale: 1.08,
      duration: 0.6,
      ease: "power2.out"
    }, 0)
    .to(content, {
      y: -2,
      duration: 0.3,
      ease: "power2.out"
    }, 0.1);

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
  }, [featured]);

  // Smart number formatting
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Dynamic category gradients
  const getCategoryGradient = (cat: string): string => {
    const gradients: Record<string, string> = {
      'calcio': 'from-green-500/20 via-emerald-500/15 to-green-600/10',
      'tennis': 'from-yellow-500/20 via-amber-500/15 to-orange-500/10',
      'f1': 'from-red-500/20 via-red-600/15 to-red-700/10',
      'basket': 'from-orange-500/20 via-orange-600/15 to-amber-600/10',
      'nfl': 'from-purple-500/20 via-indigo-500/15 to-purple-600/10'
    };
    return gradients[cat.toLowerCase()] || 'from-primary/20 via-primary/15 to-primary/10';
  };

  const getCategoryColor = (cat: string): string => {
    const colors: Record<string, string> = {
      'calcio': 'text-green-700 dark:text-green-400 bg-green-50/80 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/40',
      'tennis': 'text-yellow-700 dark:text-yellow-400 bg-yellow-50/80 dark:bg-yellow-950/30 border-yellow-200/60 dark:border-yellow-800/40',
      'f1': 'text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-950/30 border-red-200/60 dark:border-red-800/40',
      'basket': 'text-orange-700 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-950/30 border-orange-200/60 dark:border-orange-800/40',
      'nfl': 'text-purple-700 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800/40'
    };
    return colors[cat.toLowerCase()] || 'text-primary bg-primary/5 border-primary/20';
  };

  // Interaction handlers with micro-animations
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    
    // Heart burst animation
    gsap.timeline()
      .to(button, { scale: 0.8, duration: 0.1, ease: "power2.in" })
      .to(button, { scale: 1.3, duration: 0.2, ease: "back.out(3)" })
      .to(button, { scale: 1, duration: 0.15, ease: "power2.out" });

    // Create floating heart effect if liked
    if (!isLiked) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'absolute pointer-events-none text-sm z-50';
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%, -50%)';
      
      button.appendChild(heart);
      
      gsap.timeline()
        .to(heart, {
          y: -30,
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
      .to(button, { rotateY: 180, scale: 0.9, duration: 0.2, ease: "power2.inOut" })
      .to(button, { rotateY: 0, scale: 1, duration: 0.2, ease: "power2.inOut" });

    await toggleBookmark();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    
    gsap.timeline()
      .to(button, { scale: 0.9, duration: 0.1 })
      .to(button, { scale: 1.1, duration: 0.15, ease: "back.out(2)" })
      .to(button, { scale: 1, duration: 0.1 });
  };

  if (featured) {
    return (
      <Card 
        ref={cardRef}
        className={cn(
          "group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-background via-background/95 to-background/90",
          "shadow-lg hover:shadow-2xl transition-all duration-500",
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
            
            {/* Dynamic gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-30 mix-blend-multiply",
              getCategoryGradient(category)
            )} />
            
            {/* Text overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Category badge */}
            <Badge className={cn(
              "absolute top-4 left-4 text-xs font-semibold border backdrop-blur-md z-20",
              getCategoryColor(category)
            )}>
              {category.toUpperCase()}
            </Badge>

            {/* Featured badge */}
            <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground backdrop-blur-sm z-20">
              In Evidenza
            </Badge>

            {/* Trending indicator */}
            {trending && (
              <div className="absolute top-16 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2 shadow-lg z-20">
                <TrendingUp className="h-4 w-4" />
              </div>
            )}

            {/* Featured content overlay */}
            <div ref={contentRef} className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
              <div className="space-y-4">
                <h2 className="text-white font-bold text-2xl lg:text-4xl xl:text-5xl leading-tight">
                  {title}
                </h2>
                
                <p className="text-white/95 text-lg lg:text-xl leading-relaxed line-clamp-2">
                  {article?.content ? (
                    <ContentPreview content={article.content} maxLength={150} className="text-white/95" />
                  ) : (
                    excerpt
                  )}
                </p>

                {/* Author and meta info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-white/90">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="font-medium">{author}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>{timeAgo || publishedAt}</span>
                    </div>
                  </div>

                  {/* Featured interaction bar */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-10 px-3 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border-0 relative",
                        isLiked ? "text-red-400 bg-red-500/20" : "hover:text-red-400"
                      )}
                      onClick={handleLike}
                      disabled={isLoading}
                    >
                      <Heart className={cn("h-5 w-5 mr-2", isLiked && "fill-current")} />
                      <span className="font-semibold">{formatNumber(likesCount)}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3 bg-black/20 backdrop-blur-sm hover:bg-black/40 hover:text-blue-400 text-white border-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span className="font-semibold">{formatNumber(commentsCount)}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-10 w-10 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white border-0 relative",
                        isBookmarked ? "text-yellow-400 bg-yellow-500/20" : "hover:text-yellow-400"
                      )}
                      onClick={handleBookmark}
                      disabled={isLoading}
                    >
                      <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Regular article layout - 40/60 optimized
  return (
    <Card 
      ref={cardRef}
      className={cn(
        "group cursor-pointer overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm",
        "transition-all duration-300 hover:border-primary/20 h-full",
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-36 md:h-40">
        {/* Image Section - 40% width */}
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
          
          {/* Category badge */}
          <Badge className={cn(
            "absolute top-2 left-2 text-xs font-medium border shadow-sm backdrop-blur-sm",
            getCategoryColor(category)
          )}>
            {category.toUpperCase()}
          </Badge>

          {/* Trending indicator */}
          {trending && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-1.5 shadow-lg">
              <TrendingUp className="h-3 w-3" />
            </div>
          )}
        </div>

        {/* Content Section - 60% width */}
        <div 
          ref={contentRef}
          className="flex-1 p-4 flex flex-col justify-between min-w-0"
        >
          {/* Header content */}
          <div className="space-y-2 flex-1">
            <h3 className={cn(
              "font-bold text-base lg:text-lg leading-tight line-clamp-2",
              "group-hover:text-primary transition-colors duration-300",
              "text-foreground"
            )}>
              {title}
            </h3>
            
            <div className="space-y-1">
              {article?.content ? (
                <ContentPreview 
                  content={article.content} 
                  maxLength={80}
                  className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
                />
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {excerpt}
                </p>
              )}
            </div>
          </div>

          {/* Footer with author and metrics */}
          <div className="space-y-3 mt-2">
            {/* Author info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="font-medium truncate">{author}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="shrink-0">{timeAgo || publishedAt}</span>
            </div>

            {/* Modern interaction bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Like button with micro-animation */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 relative",
                    isLiked ? "text-red-500 bg-red-50 dark:bg-red-950/30" : "hover:text-red-500"
                  )}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <Heart className={cn(
                    "h-3.5 w-3.5 mr-1.5 transition-all duration-200",
                    isLiked ? "fill-current" : ""
                  )} />
                  <span className="text-xs font-semibold">{formatNumber(likesCount)}</span>
                </Button>
                
                {/* Comments */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-500 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs font-semibold">{formatNumber(commentsCount)}</span>
                </Button>

                {/* Views with eye icon */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-semibold">{formatNumber(displayViews)}</span>
                </div>
              </div>

              {/* Secondary actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  onClick={handleShare}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all duration-200 relative",
                    isBookmarked ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : "hover:text-yellow-500"
                  )}
                  onClick={handleBookmark}
                  disabled={isLoading}
                >
                  <Bookmark className={cn(
                    "h-3.5 w-3.5 transition-all duration-200",
                    isBookmarked ? "fill-current" : ""
                  )} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
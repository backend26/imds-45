import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Heart, MessageCircle, Share2, Bookmark, Eye, MoreHorizontal,
  ThumbsUp, Users, TrendingUp, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialShareModal } from './SocialShareModal';
import { PostReportModal } from './PostReportModal';
import { gsap } from 'gsap';

interface ModernInteractionBarProps {
  id: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount?: number;
  isLoading?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onPreview?: () => void;
  compact?: boolean;
  showAllMetrics?: boolean;
  className?: string;
}

export const ModernInteractionBar: React.FC<ModernInteractionBarProps> = ({
  id,
  isLiked = false,
  isBookmarked = false,
  likesCount,
  commentsCount,
  viewsCount,
  sharesCount = 0,
  isLoading = false,
  onLike,
  onBookmark,
  onShare,
  onComment,
  onPreview,
  compact = false,
  showAllMetrics = false,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState<string | null>(null);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!onLike || isLoading) return;

    setIsAnimating('like');
    
    // Enhanced like animation
    const button = e.currentTarget;
    gsap.timeline()
      .to(button, {
        scale: 0.8,
        duration: 0.1,
        ease: 'power2.in'
      })
      .to(button, {
        scale: 1.3,
        duration: 0.15,
        ease: 'back.out(2)'
      })
      .to(button, {
        scale: 1,
        duration: 0.1,
        ease: 'power2.out'
      });

    // Heart burst effect for likes
    if (!isLiked) {
      const hearts = ['❤️', '💕', '💖'];
      const heart = hearts[Math.floor(Math.random() * hearts.length)];
      
      const burstElement = document.createElement('div');
      burstElement.textContent = heart;
      burstElement.className = 'absolute pointer-events-none text-red-500 font-bold z-50';
      burstElement.style.left = '50%';
      burstElement.style.top = '50%';
      burstElement.style.transform = 'translate(-50%, -50%)';
      
      button.appendChild(burstElement);
      
      gsap.timeline()
        .to(burstElement, {
          y: -30,
          opacity: 0,
          scale: 1.5,
          duration: 0.6,
          ease: 'power2.out'
        })
        .call(() => button.removeChild(burstElement));
    }

    await onLike();
    setTimeout(() => setIsAnimating(null), 400);
  };

  const handleBookmark = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!onBookmark || isLoading) return;

    setIsAnimating('bookmark');
    
    const button = e.currentTarget;
    gsap.timeline()
      .to(button, {
        rotateY: 180,
        duration: 0.3,
        ease: 'power2.inOut'
      })
      .to(button, {
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });

    await onBookmark();
    setTimeout(() => setIsAnimating(null), 600);
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onShare?.();
  };

  const handleComment = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onComment?.();
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between gap-1", className)}>
        {/* Primary actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 hover:bg-primary/10 transition-all duration-200 relative",
              isLiked ? "text-red-500" : "hover:text-red-500"
            )}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart className={cn(
              "h-3 w-3 mr-1 transition-all duration-200",
              isLiked ? "fill-current" : "",
              isAnimating === 'like' ? "animate-pulse" : ""
            )} />
            <span className="text-xs font-medium">{formatCount(likesCount)}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 hover:bg-primary/10 hover:text-blue-500"
            onClick={handleComment}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            <span className="text-xs font-medium">{formatCount(commentsCount)}</span>
          </Button>

          <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
            <Eye className="h-3 w-3" />
            <span>{formatCount(viewsCount)}</span>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="flex items-center gap-0.5">
          <SocialShareModal
            postId={id}
            postTitle={`Articolo interessante`}
          />
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 hover:bg-primary/10 transition-all duration-200 relative",
              isBookmarked ? "text-yellow-500" : "hover:text-yellow-500"
            )}
            onClick={handleBookmark}
            disabled={isLoading}
          >
            <Bookmark className={cn(
              "h-3 w-3 transition-all duration-200",
              isBookmarked ? "fill-current" : "",
              isAnimating === 'bookmark' ? "animate-bounce" : ""
            )} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {/* Enhanced metrics display */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 relative group",
            isLiked ? "text-red-500 bg-red-50 dark:bg-red-950/20" : "hover:text-red-500"
          )}
          onClick={handleLike}
          disabled={isLoading}
        >
          <Heart className={cn(
            "h-4 w-4 mr-2 transition-all duration-200",
            isLiked ? "fill-current scale-110" : "group-hover:scale-110",
            isAnimating === 'like' ? "animate-pulse" : ""
          )} />
          <span className="font-medium">{formatCount(likesCount)}</span>
          {!isLiked && (
            <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              ❤️
            </span>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-500 group"
          onClick={handleComment}
        >
          <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{formatCount(commentsCount)}</span>
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span className="font-medium">{formatCount(viewsCount)}</span>
          </div>
          {showAllMetrics && sharesCount > 0 && (
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span className="font-medium">{formatCount(sharesCount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <SocialShareModal
          postId={id}
          postTitle={`Articolo interessante`}
        />
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-all duration-200 relative group",
            isBookmarked ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : "hover:text-yellow-500"
          )}
          onClick={handleBookmark}
          disabled={isLoading}
        >
          <Bookmark className={cn(
            "h-4 w-4 transition-all duration-200",
            isBookmarked ? "fill-current" : "group-hover:scale-110",
            isAnimating === 'bookmark' ? "animate-bounce" : ""
          )} />
          {!isBookmarked && (
            <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              📌
            </span>
          )}
        </Button>

        {onPreview && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <Zap className="h-4 w-4" />
          </Button>
        )}

        <PostReportModal
          postId={id}
          onReport={async (reason, description) => {
            console.log('Report:', reason, description);
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
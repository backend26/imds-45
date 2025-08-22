import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, MessageCircle, Share2, Bookmark, Eye, Clock, 
  TrendingUp, Star, ThumbsUp, Users, Calendar, ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/smart-image";
import { ContentPreview } from "@/components/posts/ContentPreview";
import { ModernInteractionBar } from "./ModernInteractionBar";
import { SmartMetrics } from "./SmartMetrics";
import { ArticlePreviewModal } from "./ArticlePreviewModal";
import { usePostInteractions } from "@/hooks/use-post-interactions";
import { usePostViews } from "@/hooks/use-post-views";
import { formatDistanceToNow } from "@/utils/dateUtilsV3";
import { gsap } from "gsap";

interface EnhancedHorizontalArticleCardProps {
  id?: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  categoryColor?: string;
  publishedAt: string;
  timeAgo?: string;
  author: string;
  authorAvatar?: string;
  authorId?: string;
  readTime?: string;
  likes: number;
  comments: number;
  views?: number;
  rating?: number;
  totalRatings?: number;
  trending?: boolean;
  className?: string;
  article?: any;
  onClick?: () => void;
}

export const EnhancedHorizontalArticleCard: React.FC<EnhancedHorizontalArticleCardProps> = ({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  categoryColor = "primary",
  publishedAt,
  timeAgo,
  author,
  authorAvatar,
  authorId,
  readTime,
  likes,
  comments,
  views = 0,
  rating = 0,
  totalRatings = 0,
  trending = false,
  className,
  article,
  onClick
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
  const displayRating = rating || 0;
  const displayRatingCount = totalRatings || 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -4,
        scale: 1.01,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: `0 20px 40px hsl(var(--primary) / 0.15), 0 8px 25px rgba(0, 0, 0, 0.1)`
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      });
    }
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      'calcio': 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      'tennis': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      'f1': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      'basket': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      'nfl': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      'default': 'bg-primary/10 text-primary border-primary/20'
    };
    return styles[category.toLowerCase()] || styles.default;
  };

  return (
    <>
      <Card 
        ref={cardRef}
        className={cn(
          "group cursor-pointer overflow-hidden border transition-all duration-300",
          "hover:border-primary/20 bg-gradient-to-br from-background/95 to-background/80",
          "backdrop-blur-sm shadow-sm hover:shadow-lg",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex h-32 sm:h-36 md:h-40">
            {/* Enhanced Image Section - 35% width */}
            <div className="relative w-[35%] min-w-[140px] overflow-hidden">
              <SmartImage
                src={article?.cover_images || imageUrl}
                alt={`${title} - ${category}`}
                className={cn(
                  "h-full w-full object-cover transition-all duration-500",
                  isHovered ? "scale-110" : "scale-100"
                )}
              />

              {/* Gradient overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />
              
              {/* Category badge with enhanced styling */}
              <Badge 
                className={cn(
                  "absolute top-2 left-2 text-xs font-medium border shadow-sm backdrop-blur-sm",
                  "animate-in slide-in-from-left-2 duration-300",
                  getCategoryStyle(category)
                )}
              >
                {category.toUpperCase()}
              </Badge>

              {/* Trending indicator */}
              {trending && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-1.5 shadow-lg">
                  <TrendingUp className="h-3 w-3" />
                </div>
              )}

              {/* Read time indicator */}
              {readTime && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {readTime}
                </div>
              )}
            </div>

            {/* Enhanced Content Section - 65% width */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
              {/* Header with author info */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback className="text-xs">
                      {author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                    <span className="font-medium truncate">{author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate">
                        {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Title */}
                <h3 className={cn(
                  "font-bold text-sm sm:text-base leading-tight line-clamp-2 mb-1",
                  "group-hover:text-primary transition-colors duration-300",
                  "hover:underline decoration-primary/30 underline-offset-2"
                )}>
                  {title}
                </h3>

                {/* Smart excerpt with content preview */}
                {article?.content ? (
                  <ContentPreview 
                    content={article.content} 
                    maxLength={85}
                    className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    {excerpt}
                  </p>
                )}
              </div>

              {/* Smart metrics and rating */}
              <div className="space-y-2">
                {/* Rating display */}
                {displayRating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium ml-0.5">{displayRating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({displayRatingCount})
                    </span>
                  </div>
                )}

                {/* Enhanced interaction bar */}
                <ModernInteractionBar
                  id={id || ''}
                  isLiked={isLiked}
                  isBookmarked={isBookmarked}
                  likesCount={likesCount}
                  commentsCount={commentsCount}
                  viewsCount={displayViews}
                  isLoading={isLoading}
                  onLike={toggleLike}
                  onBookmark={toggleBookmark}
                  onShare={() => {}}
                  onComment={() => onClick?.()}
                  onPreview={() => setIsPreviewOpen(true)}
                  compact={true}
                />
              </div>
            </div>

            {/* Hover arrow indicator */}
            <div className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-300",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}>
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article preview modal */}
      {isPreviewOpen && (
        <ArticlePreviewModal
          article={{
            id: id || '',
            title,
            excerpt,
            imageUrl: article?.cover_images || imageUrl,
            category,
            author,
            authorAvatar,
            publishedAt,
            content: article?.content || excerpt,
            likes: likesCount,
            comments: commentsCount,
            views: displayViews
          }}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onReadFull={() => {
            setIsPreviewOpen(false);
            onClick?.();
          }}
        />
      )}
    </>
  );
};
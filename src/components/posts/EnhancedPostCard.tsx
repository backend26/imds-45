import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Star, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEnhancedPostInteractions } from '@/hooks/use-enhanced-post-interactions';
import { PostRatingSystem } from './PostRatingSystem';
import { PostReportModal } from './PostReportModal';
import { formatDistanceToNow } from '@/utils/dateUtilsV3';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EnhancedPostCardProps {
  postId: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  authorId?: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
  className?: string;
  onClick?: () => void;
}

export const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({
  postId,
  title,
  excerpt,
  imageUrl,
  authorName,
  authorAvatar,
  authorId,
  publishedAt,
  category,
  tags = [],
  className = "",
  onClick
}) => {
  const {
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    userRating,
    averageRating,
    totalRatings,
    isLoading,
    toggleLike,
    toggleBookmark,
    setRating,
    reportPost
  } = useEnhancedPostInteractions(postId);

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-0">
        {/* Image */}
        {imageUrl && (
          <div 
            className="relative h-48 overflow-hidden rounded-t-lg cursor-pointer"
            onClick={onClick}
          >
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {category && (
              <Badge 
                variant="secondary" 
                className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm"
              >
                {category}
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Author and Date */}
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>
                {authorName?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(publishedAt), { 
                  addSuffix: true
                })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="font-bold text-lg mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2"
            onClick={onClick}
          >
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Rating Display */}
          {totalRatings > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({totalRatings} {totalRatings === 1 ? 'valutazione' : 'valutazioni'})
              </span>
            </div>
          )}

          {/* Interactions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Like */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2",
                  isLiked ? "text-red-500" : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike();
                }}
                disabled={isLoading}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="ml-1 text-xs">{likesCount}</span>
              </Button>

              {/* Comments */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={onClick}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1 text-xs">{commentsCount}</span>
              </Button>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-1">
              {/* Bookmark */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  isBookmarked ? "text-primary" : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark();
                }}
                disabled={isLoading}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </Button>

              {/* Report */}
              <PostReportModal
                postId={postId}
                onReport={reportPost}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
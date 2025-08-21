import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Heart, MessageCircle, Eye, Share2, Bookmark, TrendingUp, 
  Clock, Users, Star, Zap, Activity, Target, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartMetricsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount?: number;
  bookmarksCount?: number;
  rating?: number;
  totalRatings?: number;
  readTime?: string;
  engagementRate?: number;
  trendingScore?: number;
  publishedAt: string;
  compact?: boolean;
  showTrending?: boolean;
  showEngagement?: boolean;
  className?: string;
}

export const SmartMetrics: React.FC<SmartMetricsProps> = ({
  postId,
  likesCount,
  commentsCount,
  viewsCount,
  sharesCount = 0,
  bookmarksCount = 0,
  rating = 0,
  totalRatings = 0,
  readTime,
  engagementRate = 0,
  trendingScore = 0,
  publishedAt,
  compact = false,
  showTrending = false,
  showEngagement = false,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const calculateEngagement = (): number => {
    const totalEngagement = likesCount + commentsCount + sharesCount + bookmarksCount;
    return viewsCount > 0 ? ((totalEngagement / viewsCount) * 100) : 0;
  };

  const getEngagementLevel = (rate: number): { level: string; color: string; icon: React.ReactNode } => {
    if (rate >= 10) return { level: 'Virale', color: 'text-red-500', icon: <Zap className="h-3 w-3" /> };
    if (rate >= 5) return { level: 'Alto', color: 'text-orange-500', icon: <TrendingUp className="h-3 w-3" /> };
    if (rate >= 2) return { level: 'Buono', color: 'text-green-500', icon: <Target className="h-3 w-3" /> };
    if (rate >= 0.5) return { level: 'Medio', color: 'text-blue-500', icon: <Activity className="h-3 w-3" /> };
    return { level: 'Basso', color: 'text-gray-500', icon: <Users className="h-3 w-3" /> };
  };

  const getTrendingLevel = (score: number): { level: string; color: string } => {
    if (score >= 100) return { level: 'Trending 🔥', color: 'text-red-500' };
    if (score >= 50) return { level: 'Popolare 📈', color: 'text-orange-500' };
    if (score >= 25) return { level: 'In Crescita ⬆️', color: 'text-green-500' };
    return { level: '', color: '' };
  };

  const actualEngagementRate = engagementRate || calculateEngagement();
  const engagementInfo = getEngagementLevel(actualEngagementRate);
  const trendingInfo = getTrendingLevel(trendingScore);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 text-xs text-muted-foreground",
        "animate-in fade-in duration-300",
        !isVisible && "opacity-0",
        className
      )}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="h-3 w-3" />
                <span className="font-medium">{formatNumber(likesCount)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{likesCount} like</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <MessageCircle className="h-3 w-3" />
                <span className="font-medium">{formatNumber(commentsCount)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{commentsCount} commenti</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <Eye className="h-3 w-3" />
                <span className="font-medium">{formatNumber(viewsCount)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{viewsCount} visualizzazioni</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {readTime && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readTime}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tempo di lettura stimato</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {rating > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{rating.toFixed(1)} stelle ({totalRatings} valutazioni)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg bg-muted/30 border",
      "animate-in slide-in-from-bottom-2 duration-500",
      !isVisible && "opacity-0 translate-y-2",
      className
    )}>
      {/* Primary metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-center text-red-500 mb-1">
            <Heart className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold">{formatNumber(likesCount)}</div>
          <div className="text-xs text-muted-foreground">Like</div>
        </div>

        <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-center text-blue-500 mb-1">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold">{formatNumber(commentsCount)}</div>
          <div className="text-xs text-muted-foreground">Commenti</div>
        </div>

        <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-center text-green-500 mb-1">
            <Eye className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold">{formatNumber(viewsCount)}</div>
          <div className="text-xs text-muted-foreground">Visite</div>
        </div>

        <div className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-center text-purple-500 mb-1">
            <Share2 className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold">{formatNumber(sharesCount)}</div>
          <div className="text-xs text-muted-foreground">Share</div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        {rating > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)} ({totalRatings})</span>
          </Badge>
        )}

        {readTime && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{readTime}</span>
          </Badge>
        )}

        {showEngagement && actualEngagementRate > 0 && (
          <Badge 
            variant="secondary" 
            className={cn("flex items-center gap-1", engagementInfo.color)}
          >
            {engagementInfo.icon}
            <span>{engagementInfo.level} ({actualEngagementRate.toFixed(1)}%)</span>
          </Badge>
        )}

        {showTrending && trendingScore > 25 && (
          <Badge 
            variant="secondary"
            className={cn("flex items-center gap-1", trendingInfo.color)}
          >
            <TrendingUp className="h-3 w-3" />
            <span>{trendingInfo.level}</span>
          </Badge>
        )}

        {bookmarksCount > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            <span>{formatNumber(bookmarksCount)} salvati</span>
          </Badge>
        )}
      </div>

      {/* Engagement progress bar */}
      {showEngagement && actualEngagementRate > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Engagement</span>
            <span className={engagementInfo.color}>{actualEngagementRate.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out",
                actualEngagementRate >= 10 ? "bg-red-500" :
                actualEngagementRate >= 5 ? "bg-orange-500" :
                actualEngagementRate >= 2 ? "bg-green-500" :
                actualEngagementRate >= 0.5 ? "bg-blue-500" : "bg-gray-400"
              )}
              style={{ 
                width: `${Math.min(100, actualEngagementRate * 10)}%`,
                animationDelay: '300ms'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, ExternalLink, Heart, MessageCircle, Share2, Bookmark, Eye, 
  Clock, Calendar, User, ArrowRight, Zap, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartImage } from '@/components/ui/smart-image';
import { ModernInteractionBar } from './ModernInteractionBar';
import { SmartMetrics } from './SmartMetrics';
import { formatDistanceToNow } from '@/utils/dateUtilsV3';

interface ArticlePreviewModalProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    imageUrl?: string;
    category: string;
    author: string;
    authorAvatar?: string;
    publishedAt: string;
    content: string;
    likes: number;
    comments: number;
    views: number;
    rating?: number;
    totalRatings?: number;
    readTime?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onReadFull: () => void;
}

export const ArticlePreviewModal: React.FC<ArticlePreviewModalProps> = ({
  article,
  isOpen,
  onClose,
  onReadFull
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setPreviewProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(timer);
    } else {
      setPreviewProgress(0);
    }
  }, [isOpen]);

  const handleReadFull = () => {
    setIsLoading(true);
    setTimeout(() => {
      onReadFull();
      setIsLoading(false);
    }, 300);
  };

  const getPreviewText = (content: string): string => {
    // Remove HTML tags and get first 300 characters
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 300 ? textContent.substring(0, 300) + '...' : textContent;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'calcio': 'bg-green-500',
      'tennis': 'bg-yellow-500',
      'f1': 'bg-red-500',
      'basket': 'bg-orange-500',
      'nfl': 'bg-purple-500'
    };
    return colors[category.toLowerCase()] || 'bg-primary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header with progress bar */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden z-10">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-100 ease-out"
              style={{ width: `${previewProgress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Badge className={cn("text-white", getCategoryColor(article.category))}>
                {article.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span>Anteprima Rapida</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Hero Section */}
            <div className="relative">
              {article.imageUrl && (
                <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                  <SmartImage
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating metrics */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views}
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {article.likes}
                    </div>
                  </div>
                </div>
              )}

              {/* Title and meta */}
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={article.authorAvatar} />
                      <AvatarFallback>
                        {article.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{article.author}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                        {article.readTime && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {article.rating && article.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{article.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({article.totalRatings} valutazioni)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-muted-foreground text-sm mb-2">ANTEPRIMA</p>
                <p className="text-lg leading-relaxed">
                  {getPreviewText(article.content)}
                </p>
              </div>

              {/* Content preview fade effect */}
              <div className="relative">
                <div className="h-20 bg-gradient-to-t from-background to-transparent" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Continua a leggere per scoprire il resto dell'articolo
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive metrics */}
            <SmartMetrics
              postId={article.id}
              likesCount={article.likes}
              commentsCount={article.comments}
              viewsCount={article.views}
              rating={article.rating}
              totalRatings={article.totalRatings}
              readTime={article.readTime}
              publishedAt={article.publishedAt}
              showEngagement={true}
              showTrending={true}
            />
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <ModernInteractionBar
              id={article.id}
              likesCount={article.likes}
              commentsCount={article.comments}
              viewsCount={article.views}
              showAllMetrics={true}
              className="flex-1"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Chiudi
              </Button>
              
              <Button
                onClick={handleReadFull}
                disabled={isLoading}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Leggi Articolo Completo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
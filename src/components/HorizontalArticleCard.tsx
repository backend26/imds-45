import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { getImageUrl } from "@/config/images";

interface HorizontalArticleCardProps {
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  author: string;
  readTime: string;
  likes: number;
  comments: number;
  className?: string;
}

export const HorizontalArticleCard: React.FC<HorizontalArticleCardProps> = ({
  title,
  excerpt,
  imageUrl,
  category,
  publishedAt,
  author,
  readTime,
  likes,
  comments,
  className
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);

  const { imgRef, isLoaded, isInView } = useLazyImage();

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 600);
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Handle share functionality
  };

  const handleBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    setIsSaveAnimating(true);
    setTimeout(() => setIsSaveAnimating(false), 400);
  };

  return (
    <article 
      className={cn(
        "group cursor-pointer hover-lift overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
      role="article"
      aria-labelledby={`article-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <CardContent className="p-0">
        <div className="flex h-full">
          {/* Image Section - 30% width */}
          <div className="relative w-1/3 min-w-[120px]">
<div className="relative h-full overflow-hidden">
  {/* Background image layer */}
  <div
    className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
    style={{
      backgroundImage: isInView ? `url(${getImageUrl(imageUrl)})` : 'none',
      opacity: isLoaded ? 1 : 0,
    }}
  />

  {/* Fallback muted background */}
  {!isLoaded && (
    <div className="absolute inset-0 bg-muted animate-pulse opacity-10" />
  )}

  {/* Image trigger for lazy loading */}
  <img
    ref={imgRef}
    src={isInView ? getImageUrl(imageUrl) : ''}
    alt={`Immagine per l'articolo: ${title}`}
    className="absolute w-0 h-0 opacity-0"
    loading="lazy"
  />

  {/* Category badge */}
  <Badge 
    className="absolute top-2 left-2 bg-primary text-primary-foreground animate-scale-in z-10 text-xs"
  >
    {category}
  </Badge>
</div>


          {/* Content Section - 70% width */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 
                id={`article-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight"
              >
                {title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
              
              {/* Author and metadata */}
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <Icon name="user" className="h-3 w-3" />
                  <span className="font-medium">{author}</span>
                </div>
                <span aria-hidden="true">•</span>
                <span>{publishedAt}</span>
                <span aria-hidden="true">•</span>
                <div className="flex items-center space-x-1">
                  <Icon name="clock" className="h-3 w-3" />
                  <span className="font-medium">{readTime}</span>
                </div>
              </div>
            </div>

            {/* Interaction buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 hover:bg-primary/10 transition-all duration-200",
                    isLiked ? "text-primary" : "hover:text-primary"
                  )}
                  onClick={handleLike}
                  aria-label={`${isLiked ? 'Rimuovi like' : 'Metti like'} - ${likes} like`}
                  aria-pressed={isLiked}
                >
                  <Icon 
                    name="like" 
                    className={cn(
                      "h-3 w-3 mr-1 transition-all duration-200",
                      isLiked ? "text-primary" : "",
                      isLikeAnimating ? "animate-like-burst" : ""
                    )} 
                  />
                  <span className="text-xs font-medium">{likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-primary/10 hover:text-primary"
                  onClick={handleShare}
                  aria-label={`${comments} commenti`}
                >
                  <Icon name="comment" className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">{comments}</span>
                </Button>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  onClick={handleShare}
                  aria-label="Condividi articolo"
                >
                  <Icon name="share" className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 hover:bg-primary/10 transition-all duration-200",
                    isSaved ? "text-primary" : "hover:text-primary"
                  )}
                  onClick={handleBookmark}
                  aria-label={`${isSaved ? 'Rimuovi dai salvati' : 'Salva articolo'}`}
                  aria-pressed={isSaved}
                >
                  <Icon 
                    name="bookmark" 
                    className={cn(
                      "h-3 w-3 transition-all duration-200",
                      isSaved ? "text-primary" : "",
                      isSaveAnimating ? "animate-save-fold" : ""
                    )} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </article>
  );
}; 

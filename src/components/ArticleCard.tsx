import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { getImageUrl } from "@/config/images";
import { gsap } from "gsap";

interface ArticleCardProps {
  id?: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  author: string;
  readTime: string;
  likes: number;
  comments: number;
  featured?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  publishedAt,
  author,
  readTime,
  likes,
  comments,
  featured = false,
  className,
  onClick
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { imgRef, isLoaded, isInView } = useLazyImage();

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setIsLikeAnimating(true);
    
    // GSAP animation for like button
    const button = e.currentTarget;
    gsap.timeline()
      .to(button, {
        scale: 0.8,
        duration: 0.1,
        ease: 'power2.in'
      })
      .to(button, {
        scale: 1.2,
        duration: 0.2,
        ease: 'back.out(1.7)'
      })
      .to(button, {
        scale: 1,
        duration: 0.1,
        ease: 'power2.out'
      });
    
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
    
    // GSAP animation for bookmark button
    const button = e.currentTarget;
    gsap.timeline()
      .to(button, {
        scale: 0.8,
        duration: 0.1,
        ease: 'power2.in'
      })
      .to(button, {
        scale: 1.2,
        duration: 0.2,
        ease: 'back.out(1.7)'
      })
      .to(button, {
        scale: 1,
        duration: 0.1,
        ease: 'power2.out'
      });
    
    setTimeout(() => setIsSaveAnimating(false), 400);
  };

  return (
    <article 
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "article-card group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
        featured && "w-full",
        className
      )}
      role="article"
      aria-labelledby={`article-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      onMouseEnter={() => {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 25px 50px rgba(255, 48, 54, 0.25), 0 10px 30px rgba(0, 0, 0, 0.3)'
          });
        }
      }}
      onMouseLeave={() => {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          });
        }
      }}
    >
      <div className="relative">
        <div 
          className={cn(
            "bg-cover bg-center relative overflow-hidden",
            featured ? "aspect-[21/9]" : "aspect-[4/3]"
          )}
          style={{ 
            backgroundImage: isInView ? `url(${getImageUrl(imageUrl)})` : 'none',
            backgroundColor: isLoaded ? 'transparent' : 'hsl(var(--muted))'
          }}
          role="img"
          aria-label={`Immagine per l'articolo: ${title}`}
        >
          {/* Loading skeleton */}
          {!isLoaded && (
            <div className="absolute inset-0 loading-skeleton" />
          )}

          {/* Hidden image for lazy loading */}
                        <img
                ref={imgRef}
                src={isInView ? getImageUrl(imageUrl) : ''}
                alt={`Immagine per l'articolo: ${title}`}
                className="hidden"
                loading="lazy"
              />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category badge - highest z-index */}
          <Badge 
            className="absolute top-4 left-4 bg-primary text-primary-foreground animate-scale-in z-30"
          >
            {category}
          </Badge>

          {/* Featured badge and interaction buttons */}
          {featured && (
            <>
              <Badge 
                variant="secondary" 
                className="absolute top-4 right-4 bg-card/90 text-card-foreground animate-scale-in z-20"
              >
                In Evidenza
              </Badge>
              
              {/* Interaction buttons for featured articles */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white transition-all duration-200",
                    isLiked ? "text-red-400" : "hover:text-red-400"
                  )}
                  onClick={handleLike}
                  aria-label={`${isLiked ? 'Rimuovi like' : 'Metti like'} - ${likes} like`}
                  aria-pressed={isLiked}
                >
                                     <Icon 
                     name="like" 
                     className={cn(
                       "h-4 w-4 transition-all duration-200",
                       isLiked ? "text-red-400" : "text-white",
                       isLikeAnimating ? "animate-like-burst" : ""
                     )} 
                   />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white hover:text-blue-400"
                  onClick={handleShare}
                  aria-label={`${comments} commenti`}
                >
                                     <Icon name="comment" className="h-4 w-4 text-white" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white transition-all duration-200",
                    isSaved ? "text-yellow-400" : "hover:text-yellow-400"
                  )}
                  onClick={handleBookmark}
                  aria-label={`${isSaved ? 'Rimuovi dai salvati' : 'Salva articolo'}`}
                  aria-pressed={isSaved}
                >
                                     <Icon 
                     name="bookmark" 
                     className={cn(
                       "h-4 w-4 transition-all duration-200",
                       isSaved ? "text-yellow-400" : "text-white",
                       isSaveAnimating ? "animate-save-fold" : ""
                     )} 
                   />
                </Button>
              </div>
            </>
          )}

          {/* Image overlay content - only for featured articles */}
          {featured && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
              <div className="z-10">
                <h3 
                  id={`article-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
                  className="text-white font-bold leading-tight mb-3 text-2xl md:text-3xl lg:text-4xl"
                >
                  {title}
                </h3>
                
                <p className="text-white/95 text-base md:text-lg mb-4 line-clamp-3 leading-relaxed">
                  {excerpt}
                </p>

                <div className="flex items-center space-x-4 text-white/80 text-sm md:text-base">
                                     <div className="flex items-center space-x-1">
                     <Icon name="user" className="h-4 w-4" />
                     <span className="font-medium">{author}</span>
                   </div>
                  <span aria-hidden="true">•</span>
                  <span>{publishedAt}</span>
                  <span aria-hidden="true">•</span>
                                     <div className="flex items-center space-x-1">
                     <Icon name="clock" className="h-4 w-4" />
                     <span className="font-medium">{readTime}</span>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content for non-featured articles */}
      {!featured && (
        <CardContent className="p-4">
          <h3 
            id={`article-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="font-bold text-base md:text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight"
          >
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
          
          {/* Author and metadata */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-4">
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

          {/* Interaction buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 hover:bg-primary/10 transition-all duration-200",
                isLiked ? "text-primary" : "hover:text-primary"
              )}
              onClick={handleLike}
              aria-label={`${isLiked ? 'Rimuovi like' : 'Metti like'} - ${likes} like`}
              aria-pressed={isLiked}
            >
              <Icon name="like" className={cn(
                "h-4 w-4 mr-1 transition-all duration-200",
                isLiked ? "text-primary" : "",
                isLikeAnimating ? "animate-like-burst" : ""
              )} />
              <span className="text-xs font-medium">{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
              onClick={handleShare}
              aria-label={`${comments} commenti`}
            >
              <Icon name="comment" className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">{comments}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              onClick={handleShare}
              aria-label="Condividi articolo"
            >
              <Icon name="share" className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200",
                isSaved ? "text-primary" : "hover:text-primary"
              )}
              onClick={handleBookmark}
              aria-label={`${isSaved ? 'Rimuovi dai salvati' : 'Salva articolo'}`}
              aria-pressed={isSaved}
            >
              <Icon name="bookmark" className={cn(
                "h-4 w-4 transition-all duration-200",
                isSaved ? "text-primary" : "",
                isSaveAnimating ? "animate-save-fold" : ""
              )} />
            </Button>
            </div>
          </div>
        </CardContent>
      )}
    </article>
  );
};
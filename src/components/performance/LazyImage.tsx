import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({ 
  src, 
  alt, 
  className,
  width,
  height,
  aspectRatio = '16/9',
  loading = 'lazy',
  placeholder,
  onLoad,
  onError 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(container);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    aspectRatio: aspectRatio,
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted animate-pulse',
        className
      )}
      style={imageStyle}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
          style={imageStyle}
        >
          {placeholder ? (
            <img 
              src={placeholder} 
              alt="" 
              className="w-16 h-16 opacity-30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground"
          style={imageStyle}
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded bg-destructive/20" />
            <p className="text-xs">Immagine non disponibile</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300 object-cover w-full h-full',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'hidden'
          )}
          style={imageStyle}
        />
      )}

      {/* Loading overlay */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent animate-pulse">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent to-background/30 animate-[loading_1.5s_infinite]" />
        </div>
      )}
    </div>
  );
};
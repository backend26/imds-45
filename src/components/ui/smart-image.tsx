import React, { useState, useRef, useEffect } from 'react';
import { useImageUrl } from '@/hooks/use-image-url';
import { cn } from '@/lib/utils';

export interface SmartImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: unknown; // Can handle any input type
  fallback?: string;
  showDebug?: boolean;
  lazy?: boolean;
  aspectRatio?: string;
  className?: string;
}

/**
 * Universal Smart Image Component
 * Handles all image URL formats automatically with fallbacks and optimization
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallback,
  showDebug = false,
  lazy = true,
  aspectRatio,
  className,
  alt = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Process the image URL using the new hook
  const imageUrl = useImageUrl(src, fallback);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [lazy, isInView]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    
    if (import.meta.env.DEV) {
      console.warn('SmartImage: Failed to load:', {
        originalSrc: src,
        processedUrl: imageUrl
      });
    }
  };

  // Determine what to render
  const shouldShowImage = isInView && imageUrl !== fallback && !hasError;
  const finalImageUrl = shouldShowImage ? imageUrl : '';

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
      {/* Debug info overlay (development only) */}
      {showDebug && import.meta.env.DEV && (
        <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-2 max-w-xs">
          <div>Original: {String(src).substring(0, 50)}...</div>
          <div>Processed: {imageUrl.substring(0, 50)}...</div>
          <div>Valid: {imageUrl !== fallback ? '✅' : '❌'}</div>
          <div>Loaded: {isLoaded ? '✅' : '❌'}</div>
          <div>Error: {hasError ? '❌' : '✅'}</div>
        </div>
      )}

      {/* Loading placeholder */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={finalImageUrl}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
};

// Export default for easier imports
export default SmartImage;
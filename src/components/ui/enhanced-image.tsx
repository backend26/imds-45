import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * FASE 2: PERFORMANCE - Enhanced Image Component
 * Optimized image component with lazy loading, error handling, and performance features
 */

interface EnhancedImageProps {
  src: string | string[];
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: 'high' | 'low' | 'auto';
  sizes?: string;
  fallbackSrc?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
  blur?: boolean;
  quality?: number;
}

const EnhancedImage = memo<EnhancedImageProps>(({
  src,
  alt,
  className,
  loading = 'lazy',
  priority = 'auto',
  sizes,
  fallbackSrc = '/assets/images/default-banner.jpg',
  placeholder,
  onLoad,
  onError,
  aspectRatio,
  blur = true,
  quality = 75
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const intersectionRef = useRef<IntersectionObserver>();

  // Process src to get optimal image URL
  const processImageSrc = (imageSrc: string | string[]): string => {
    if (Array.isArray(imageSrc)) {
      // If array, pick the best quality image available
      return imageSrc.find(url => url && url.trim()) || fallbackSrc;
    }
    
    if (!imageSrc || imageSrc.trim() === '') {
      return fallbackSrc;
    }
    
    // Add quality parameter for Supabase storage URLs
    if (imageSrc.includes('supabase.co') && !imageSrc.includes('quality=')) {
      const url = new URL(imageSrc);
      url.searchParams.set('quality', quality.toString());
      return url.toString();
    }
    
    return imageSrc;
  };

  // Initialize image source
  useEffect(() => {
    const processedSrc = processImageSrc(src);
    setCurrentSrc(processedSrc);
  }, [src, quality, fallbackSrc]);

  // Enhanced intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || !imgRef.current) return;

    intersectionRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            // Start loading when image comes into view with margin
            const img = imgRef.current;
            if (!img.src && currentSrc) {
              img.src = currentSrc;
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before image is visible
        threshold: 0.01
      }
    );

    intersectionRef.current.observe(imgRef.current);

    return () => {
      if (intersectionRef.current) {
        intersectionRef.current.disconnect();
      }
    };
  }, [loading, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      // Try fallback image
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  const imageClasses = cn(
    'transition-all duration-300',
    {
      'opacity-0': !isLoaded && !hasError,
      'opacity-100': isLoaded,
      'filter blur-sm': blur && !isLoaded,
      'filter blur-none': blur && isLoaded,
    },
    className
  );

  const containerClasses = cn(
    'relative overflow-hidden bg-muted',
    {
      'animate-pulse': !isLoaded && !hasError,
    }
  );

  return (
    <div 
      className={containerClasses}
      style={{ aspectRatio }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {placeholder ? (
            <img 
              src={placeholder} 
              alt=""
              className="w-full h-full object-cover opacity-50 blur-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={loading === 'eager' ? currentSrc : undefined}
        alt={alt}
        className={imageClasses}
        loading={loading}
        sizes={sizes}
        fetchPriority={priority}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <svg
            className="w-8 h-8 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-sm">Immagine non disponibile</span>
        </div>
      )}
    </div>
  );
});

EnhancedImage.displayName = 'EnhancedImage';

// Enhanced image with responsive sources
interface ResponsiveImageProps extends Omit<EnhancedImageProps, 'src'> {
  sources: {
    src: string;
    media?: string;
    sizes?: string;
    type?: string;
  }[];
  src: string; // Fallback
}

export const ResponsiveImage = memo<ResponsiveImageProps>(({
  sources,
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.src}
          media={source.media}
          sizes={source.sizes}
          type={source.type}
        />
      ))}
      <EnhancedImage
        src={src}
        alt={alt}
        className={className}
        {...props}
      />
    </picture>
  );
});

ResponsiveImage.displayName = 'ResponsiveImage';

export { EnhancedImage };
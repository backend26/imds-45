import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton = ({ 
  className, 
  variant = 'text',
  width,
  height,
  lines = 1 
}: SkeletonProps) => {
  const baseClasses = 'loading-skeleton animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 && 'w-3/4' // Last line shorter
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases
export const ArticleCardSkeleton = () => (
  <div className="article-card bg-card border border-border/50 rounded-lg p-4 space-y-4">
    <Skeleton variant="rectangular" height={200} className="rounded-lg" />
    <div className="space-y-3">
      <Skeleton variant="text" lines={2} />
      <div className="flex items-center space-x-2">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  </div>
);

export const SidebarWidgetSkeleton = () => (
  <div className="sidebar-card p-4 space-y-4">
    <Skeleton variant="text" width="50%" height={20} />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" lines={2} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const HeaderSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b">
    <Skeleton variant="rectangular" width={120} height={40} />
    <div className="hidden md:flex space-x-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="text" width={80} height={20} />
      ))}
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="circular" width={32} height={32} />
    </div>
  </div>
);
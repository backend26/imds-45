import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 24 }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        const response = await fetch(`/assets/icons/${name}.svg`);
        if (!response.ok) {
          throw new Error(`Icon ${name} not found`);
        }
        
        const svgText = await response.text();
        setSvgContent(svgText);
      } catch (err) {
        console.error(`Failed to load icon: ${name}`, err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (name) {
      loadIcon();
    }
  }, [name]);

  if (isLoading) {
    return (
      <div 
        className={cn("animate-pulse bg-muted rounded", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (error) {
    return (
      <div 
        className={cn("bg-destructive/10 text-destructive flex items-center justify-center text-xs", className)}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <div 
      className={cn("inline-block", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}; 
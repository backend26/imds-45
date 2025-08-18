import { useMemo } from 'react';
import { ImageUrlProcessor, type ImageProcessResult } from '@/utils/imageUrlProcessor';

/**
 * Hook for processing image URLs with memoization
 */
export const useImageUrl = (
  input: unknown, 
  fallback?: string
): ImageProcessResult => {
  return useMemo(() => {
    return ImageUrlProcessor.process(input, fallback);
  }, [input, fallback]);
};

/**
 * Simple hook that just returns the processed URL string
 */
export const useImageUrlSimple = (
  input: unknown, 
  fallback?: string
): string => {
  return useMemo(() => {
    return ImageUrlProcessor.process(input, fallback).url;
  }, [input, fallback]);
};
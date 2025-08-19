// Advanced Image URL Processing System - Clean & Efficient
export interface ImageProcessResult {
  url: string;
  isValid: boolean;
  source: 'supabase' | 'external' | 'local' | 'fallback';
  originalInput: string;
}

/**
 * Smart image URL processor that handles all image URL formats cleanly
 */
export class ImageUrlProcessor {
  private static readonly SUPABASE_URL = 'https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public';
  private static readonly DEFAULT_FALLBACK = '/assets/images/default-banner.jpg';
  
  /**
   * Main processing function - handles any input format
   */
  static process(input: unknown, fallback?: string): ImageProcessResult {
    const fallbackUrl = fallback || this.DEFAULT_FALLBACK;
    
    if (!input) {
      return this.createResult(fallbackUrl, 'fallback', String(input));
    }

    // CRITICAL: Handle native JavaScript arrays FIRST (cover_images from database)
    if (Array.isArray(input)) {
      if (input.length > 0 && typeof input[0] === 'string') {
        const firstUrl = input[0].trim();
        if (firstUrl) {
          // Check if it's already a complete URL
          if (this.isCompleteUrl(firstUrl)) {
            return this.createResult(firstUrl, this.getUrlSource(firstUrl), String(input));
          }
          // If it's a storage path, construct the URL
          if (this.isStoragePath(firstUrl)) {
            const constructedUrl = this.constructStorageUrl(firstUrl);
            return this.createResult(constructedUrl, 'supabase', String(input));
          }
        }
      }
      return this.createResult(fallbackUrl, 'fallback', String(input));
    }

    // Handle string input
    if (typeof input === 'string') {
      return this.processString(input, fallbackUrl);
    }

    // Fallback for unknown types
    return this.createResult(fallbackUrl, 'fallback', String(input));
  }

  /**
   * Process string input with smart detection
   */
  private static processString(input: string, fallback: string): ImageProcessResult {
    // Clean the input aggressively but safely
    const cleaned = this.cleanInput(input);
    
    if (!cleaned) {
      return this.createResult(fallback, 'fallback', input);
    }

    // Try to parse as JSON first (for database values like ["url"])
    const fromJson = this.tryParseJson(cleaned);
    if (fromJson) {
      return this.processString(fromJson, fallback);
    }

    // Check if it's already a complete URL
    if (this.isCompleteUrl(cleaned)) {
      return this.createResult(cleaned, this.getUrlSource(cleaned), input);
    }

    // CRITICAL FIX: Check if it's already a Supabase storage URL that was malformed
    if (this.isPartialSupabaseUrl(cleaned)) {
      const correctedUrl = this.correctSupabaseUrl(cleaned);
      return this.createResult(correctedUrl, 'supabase', input);
    }

    // Check if it's a storage path that needs URL construction
    if (this.isStoragePath(cleaned)) {
      const constructedUrl = this.constructStorageUrl(cleaned);
      return this.createResult(constructedUrl, 'supabase', input);
    }

    // Check if it's a local asset path
    if (this.isLocalPath(cleaned)) {
      return this.createResult(cleaned, 'local', input);
    }

    // If nothing matches, use fallback
    return this.createResult(fallback, 'fallback', input);
  }

  /**
   * Aggressive input cleaning
   */
  private static cleanInput(input: string): string {
    return input
      .trim()
      .replace(/^\[+/, '')          // Remove leading brackets
      .replace(/\]+$/, '')          // Remove trailing brackets
      .replace(/^["']+/, '')        // Remove leading quotes
      .replace(/["']+$/, '')        // Remove trailing quotes
      .replace(/\\+/g, '')          // Remove backslashes
      .replace(/%22/g, '')          // Remove URL-encoded quotes
      .replace(/%5B/g, '')          // Remove URL-encoded [
      .replace(/%5D/g, '')          // Remove URL-encoded ]
      .trim();
  }

  /**
   * Try to parse JSON safely
   */
  private static tryParseJson(input: string): string | null {
    // Quick check - if it doesn't look like JSON, skip
    if (!input.includes('[') && !input.includes('{')) {
      return null;
    }

    try {
      const parsed = JSON.parse(input);
      
      // Handle array format - most common case for cover_images
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === 'string') {
          return first;
        }
        // Handle object with url property
        if (first && typeof first === 'object' && first.url) {
          return first.url;
        }
        return null;
      }
      
      // Handle object format
      if (parsed && typeof parsed === 'object' && parsed.url) {
        return parsed.url;
      }
      
      // Handle direct string value wrapped in JSON
      if (typeof parsed === 'string') {
        return parsed;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if input is a complete URL
   */
  private static isCompleteUrl(input: string): boolean {
    return input.startsWith('http://') || 
           input.startsWith('https://') || 
           input.startsWith('//');
  }

  /**
   * Check if input is a storage path
   */
  private static isStoragePath(input: string): boolean {
    return input.includes('/') && (
      input.startsWith('post-media/') ||
      input.startsWith('cover-images/') ||
      input.startsWith('avatars/') ||
      input.startsWith('profile-images/') ||
      // Handle UUID-based paths (user_id/filename)
      /^[\w-]{36}\//.test(input)
    );
  }

  /**
   * Check if input is a local asset path
   */
  private static isLocalPath(input: string): boolean {
    return input.startsWith('/assets/') || input.startsWith('./assets/');
  }

  /**
   * Check if input is a partial Supabase URL that needs correction
   */
  private static isPartialSupabaseUrl(input: string): boolean {
    return input.includes('supabase.co') && !this.isCompleteUrl(input);
  }

  /**
   * Correct malformed Supabase URLs
   */
  private static correctSupabaseUrl(input: string): string {
    // If it already contains the full storage path, return as is
    if (input.includes('/storage/v1/object/public/')) {
      return input.startsWith('http') ? input : `https://${input}`;
    }
    
    // Extract the bucket and path from partial URLs
    const match = input.match(/supabase\.co\/(.+)/);
    if (match) {
      return `${this.SUPABASE_URL}/${match[1]}`;
    }
    
    return input;
  }

  /**
   * Construct Supabase storage URL
   */
  private static constructStorageUrl(path: string): string {
    // Determine bucket based on path prefix
    let bucket = 'cover-images'; // Default for cover images
    let cleanPath = path;

    if (path.startsWith('post-media/')) {
      bucket = 'post-media';
      cleanPath = path.substring(11);
    } else if (path.startsWith('cover-images/')) {
      bucket = 'cover-images';
      cleanPath = path.substring(13);
    } else if (path.startsWith('avatars/')) {
      bucket = 'avatars';
      cleanPath = path.substring(8);
    } else if (path.startsWith('profile-images/')) {
      bucket = 'profile-images';
      cleanPath = path.substring(15);
    } else {
      // For paths without prefix, assume cover-images bucket
      bucket = 'cover-images';
    }

    // Clean the final path
    cleanPath = cleanPath.replace(/\/+/g, '/').replace(/^\/+/, '');
    
    // Debug log for development
    if (import.meta.env.DEV) {
      console.log('ImageUrlProcessor: Constructing URL', {
        originalPath: path,
        detectedBucket: bucket,
        cleanPath,
        finalUrl: `${this.SUPABASE_URL}/${bucket}/${cleanPath}`
      });
    }
    
    return `${this.SUPABASE_URL}/${bucket}/${cleanPath}`;
  }

  /**
   * Determine URL source type
   */
  private static getUrlSource(url: string): 'supabase' | 'external' | 'local' {
    if (url.includes('supabase.co')) return 'supabase';
    if (url.startsWith('/assets/')) return 'local';
    return 'external';
  }

  /**
   * Create a processing result
   */
  private static createResult(
    url: string, 
    source: ImageProcessResult['source'], 
    originalInput: string
  ): ImageProcessResult {
    return {
      url,
      isValid: url !== this.DEFAULT_FALLBACK,
      source,
      originalInput
    };
  }

  /**
   * Validate that a URL is actually accessible (optional future enhancement)
   */
  static async validate(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Simple function export for backward compatibility
export const processImageUrl = (input: unknown, fallback?: string): string => {
  return ImageUrlProcessor.process(input, fallback).url;
};
// Image URL validation and sanitization utilities

export const validateImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for valid HTTP/HTTPS URL
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

export const sanitizeImagePath = (path: string): string => {
  if (!path || typeof path !== 'string') return '';
  
  // Remove all brackets and malformed characters
  let clean = path
    .replace(/[\[\]]/g, '')        // Remove all brackets
    .replace(/["']/g, '')          // Remove quotes
    .replace(/%22/g, '')           // Remove URL encoded quotes
    .replace(/\\+/g, '')           // Remove backslashes
    .replace(/^[,\s]+/, '')        // Remove leading commas/spaces
    .replace(/[,\s]+$/, '')        // Remove trailing commas/spaces
    .trim();
  
  return clean;
};

export const isSupabaseStoragePath = (path: string): boolean => {
  if (!path) return false;
  
  return path.includes('supabase.co/storage/v1/object/public/') ||
         path.startsWith('post-media/') ||
         path.startsWith('cover-images/') ||
         path.startsWith('avatars/') ||
         path.startsWith('profile-images/');
};

export const constructSupabaseUrl = (path: string, bucket: string = 'post-media'): string => {
  if (!path) return '';
  
  // Clean the path first
  const cleanPath = sanitizeImagePath(path);
  
  // If already a full URL, return as-is
  if (validateImageUrl(cleanPath)) {
    return cleanPath;
  }
  
  // Remove bucket prefix if present
  let finalPath = cleanPath;
  if (cleanPath.startsWith(`${bucket}/`)) {
    finalPath = cleanPath.substring(bucket.length + 1);
  }
  
  // Construct the URL
  return `https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public/${bucket}/${finalPath}`;
};

export const getImageUrlWithFallback = (path: string, fallback: string = '/assets/images/default-banner.jpg'): string => {
  if (!path) return fallback;
  
  const sanitized = sanitizeImagePath(path);
  
  // If it's already a valid URL, return it
  if (validateImageUrl(sanitized)) {
    return sanitized;
  }
  
  // If it's a storage path, construct the URL
  if (isSupabaseStoragePath(sanitized)) {
    return constructSupabaseUrl(sanitized);
  }
  
  // If it's a local asset path, return as-is
  if (sanitized.startsWith('/assets/') || sanitized.startsWith('./assets/')) {
    return sanitized;
  }
  
  // Fallback for invalid paths
  return fallback;
};
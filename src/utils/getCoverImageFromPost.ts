// Utility to safely extract cover image from post data - ENHANCED VERSION WITH URL SANITIZATION
export const getCoverImageFromPost = (post: any): string => {
  try {
    // Handle null/undefined
    if (!post) {
      if (import.meta.env.DEV) console.log('getCoverImageFromPost: post is null/undefined');
      return '';
    }

    // PRIORITY 1: Check cover_images field (unified handling)
    if (post.cover_images) {
      // Handle direct HTTP/HTTPS URL string
      if (typeof post.cover_images === 'string' && (post.cover_images.startsWith('http') || post.cover_images.startsWith('//'))) {
        return sanitizeUrl(post.cover_images);
      }
      
      // Handle Supabase Storage path (convert to public URL)
      if (typeof post.cover_images === 'string' && (
        post.cover_images.startsWith('post-media/') || 
        post.cover_images.startsWith('cover-images/') || 
        post.cover_images.includes('/'))) {
        return constructSupabaseStorageUrl(post.cover_images);
      }
      
      // Handle JSON string or array with improved parsing
      if (typeof post.cover_images === 'string') {
        try {
          // First sanitize the entire string to remove brackets that might interfere
          let jsonString = post.cover_images.trim();
          
          // Handle direct URLs that got wrapped in brackets
          if (jsonString.startsWith('[') && jsonString.endsWith(']') && 
              jsonString.includes('http') && !jsonString.includes(',')) {
            // Single URL wrapped in brackets: ["https://..."]
            const urlMatch = jsonString.match(/\["?([^"]+)"?\]/);
            if (urlMatch && urlMatch[1]) {
              const cleanUrl = sanitizeUrl(urlMatch[1]);
              if (import.meta.env.DEV) console.log('🖼️ Found single URL in brackets:', cleanUrl);
              return cleanUrl.startsWith('http') ? cleanUrl : constructSupabaseStorageUrl(cleanUrl);
            }
          }
          
          // Fix malformed JSON patterns
          if (jsonString.startsWith('[') && !jsonString.endsWith(']')) {
            jsonString += ']';
          }
          if (!jsonString.startsWith('[') && jsonString.endsWith(']')) {
            jsonString = '[' + jsonString;
          }
          
          // Clean up quotes and escape characters before parsing
          jsonString = jsonString
            .replace(/\\"/g, '"')     // Fix escaped quotes
            .replace(/"{2,}/g, '"')   // Remove double quotes
            .replace(/\["+/g, '["')   // Fix opening bracket quotes
            .replace(/"+\]/g, '"]');  // Fix closing bracket quotes
          
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstImage = parsed[0];
            // Handle array of URLs
            if (typeof firstImage === 'string') {
              const cleanUrl = sanitizeUrl(firstImage);
              const url = cleanUrl.startsWith('http') ? cleanUrl : constructSupabaseStorageUrl(cleanUrl);
              if (import.meta.env.DEV) console.log('🖼️ Found image from JSON array:', url);
              return url;
            }
            // Handle array of objects {url}
            if (typeof firstImage === 'object' && firstImage?.url) {
              const cleanUrl = sanitizeUrl(firstImage.url);
              const url = cleanUrl.startsWith('http') ? cleanUrl : constructSupabaseStorageUrl(cleanUrl);
              if (import.meta.env.DEV) console.log('🖼️ Found image from JSON object:', url);
              return url;
            }
          }
        } catch (e) {
          // If JSON parsing fails, treat as direct URL or Storage path
          if (import.meta.env.DEV) console.log('🔧 JSON parse failed, treating as direct path:', post.cover_images);
          const sanitized = sanitizeUrl(post.cover_images);
          if (sanitized.startsWith('http') || sanitized.startsWith('//')) {
            return sanitized;
          }
          if (sanitized.includes('/')) {
            return constructSupabaseStorageUrl(sanitized);
          }
        }
      }
      
      // Handle already parsed array
      if (Array.isArray(post.cover_images) && post.cover_images.length > 0) {
        const firstImage = post.cover_images[0];
        if (typeof firstImage === 'string') {
          return firstImage.startsWith('http') ? sanitizeUrl(firstImage) : constructSupabaseStorageUrl(firstImage);
        }
        if (typeof firstImage === 'object' && firstImage?.url) {
          return firstImage.url.startsWith('http') ? sanitizeUrl(firstImage.url) : constructSupabaseStorageUrl(firstImage.url);
        }
      }
    }

    // PRIORITY 2: Extract first image from content HTML
    if (post.content && typeof post.content === 'string') {
      const imgRegex = /<img[^>]+src="([^">]+)"/i;
      const match = post.content.match(imgRegex);
      if (match && match[1]) {
        return match[1].startsWith('http') ? match[1] : constructSupabaseStorageUrl(match[1]);
      }
    }

    // LEGACY FALLBACKS: Only for backward compatibility
    if (post.featured_image_url && typeof post.featured_image_url === 'string') {
      return post.featured_image_url.startsWith('http') ? post.featured_image_url : constructSupabaseStorageUrl(post.featured_image_url);
    }

    if (post.imageUrl && typeof post.imageUrl === 'string') {
      return post.imageUrl;
    }

    if (import.meta.env.DEV) console.log(`getCoverImageFromPost: No valid cover found for post ${post.id || 'unknown'}`);
    return '';
  } catch (error) {
    console.error('❌ Error extracting cover image:', error);
    return '';
  }
};

// Helper function to sanitize URLs removing escape characters - ULTRA AGGRESSIVE VERSION
const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  // ULTRA AGGRESSIVE bracket removal - multiple techniques
  let cleanUrl = url;
  
  // Step 1: Remove URL encoding and escape characters
  cleanUrl = cleanUrl
    .replace(/%22/g, '')           // Remove %22 (encoded quotes)
    .replace(/%5B/g, '')           // Remove %5B (encoded [)
    .replace(/%5D/g, '')           // Remove %5D (encoded ])
    .replace(/["']/g, '')          // Remove all quotes
    .replace(/\\+/g, '')           // Remove all backslashes
    .replace(/&quot;/g, '')        // Remove HTML entities
    .trim();
  
  // Step 2: ULTRA AGGRESSIVE bracket removal with multiple passes
  let iterations = 0;
  const maxIterations = 10;
  
  while (iterations < maxIterations && (cleanUrl.includes('[') || cleanUrl.includes(']'))) {
    // Remove brackets at any position
    cleanUrl = cleanUrl
      .replace(/^\[+/, '')         // Remove leading brackets
      .replace(/\]+$/, '')         // Remove trailing brackets
      .replace(/[\[\]]/g, '')      // Remove ALL remaining brackets
      .replace(/\[+/g, '')         // Remove multiple opening brackets
      .replace(/\]+/g, '');        // Remove multiple closing brackets
    
    iterations++;
  }
  
  // Step 3: Clean up whitespace and malformed segments
  cleanUrl = cleanUrl
    .replace(/^[,\s]+/, '')        // Remove leading commas/spaces
    .replace(/[,\s]+$/, '')        // Remove trailing commas/spaces
    .replace(/\s+/g, ' ')          // Normalize spaces
    .trim();
  
  // Step 4: Fix malformed URL patterns
  cleanUrl = cleanUrl
    .replace(/\/+/g, '/')                    // Fix multiple slashes
    .replace(/https?:\/([^\/])/, 'https://$1')  // Fix protocol
    .replace(/^\/+/, '')                     // Remove leading slashes
    .replace(/https:\/([^\/])/, 'https://$1'); // Ensure proper protocol format
  
  // Step 5: Final validation and logging
  const hasBrackets = cleanUrl.includes('[') || cleanUrl.includes(']');
  
  if (import.meta.env.DEV) {
    console.log('🔧 ULTRA sanitizeUrl:', { 
      original: url, 
      cleaned: cleanUrl, 
      iterations, 
      hasBrackets,
      isValid: cleanUrl.startsWith('http') || cleanUrl.includes('/')
    });
    
    if (hasBrackets) {
      console.error('❌ BRACKETS STILL PRESENT after ultra sanitization!', cleanUrl);
    }
  }
  
  return cleanUrl;
};

// Helper function to construct Supabase Storage public URLs
const constructSupabaseStorageUrl = (path: string): string => {
  if (!path || typeof path !== 'string') return '';
  
  // Already a full URL
  if (path.startsWith('http') || path.startsWith('//')) {
    return sanitizeUrl(path);
  }
  
  // Remove any quotes or escape characters from path
  let cleanPath = path.replace(/['"]/g, '').replace(/%22/g, '');
  
  // Determine bucket based on path prefix
  let bucket = 'post-media'; // default
  let finalPath = cleanPath;
  
  if (cleanPath.startsWith('post-media/')) {
    bucket = 'post-media';
    finalPath = cleanPath.substring(11); // remove 'post-media/'
  } else if (cleanPath.startsWith('cover-images/')) {
    bucket = 'cover-images';
    finalPath = cleanPath.substring(13); // remove 'cover-images/'
  } else if (cleanPath.startsWith('avatars/')) {
    bucket = 'avatars';
    finalPath = cleanPath.substring(8); // remove 'avatars/'
  } else if (cleanPath.startsWith('profile-images/')) {
    bucket = 'profile-images';
    finalPath = cleanPath.substring(15); // remove 'profile-images/'
  }
  
  // Ensure no double slashes in path
  finalPath = finalPath.replace(/\/+/g, '/');
  
  // Construct the public URL
  return `https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public/${bucket}/${finalPath}`;
};
// Utility to safely extract cover image from post data - UNIFIED VERSION
export const getCoverImageFromPost = (post: any): string => {
  try {
    // Handle null/undefined
    if (!post) {
      return '';
    }

    // PRIORITY 1: Check cover_images field (current format) - ONLY source now
    if (post.cover_images) {
      // If it's a string URL, return it directly
      if (typeof post.cover_images === 'string' && post.cover_images.startsWith('http')) {
        return post.cover_images;
      }
      
      // If it's JSON/array, try to parse
      if (typeof post.cover_images === 'string') {
        try {
          const parsed = JSON.parse(post.cover_images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {
          // If parsing fails, treat as direct URL
          if (post.cover_images.startsWith('http')) {
            return post.cover_images;
          }
        }
      }
      
      // If it's already an array
      if (Array.isArray(post.cover_images) && post.cover_images.length > 0) {
        return post.cover_images[0];
      }
    }

    // LEGACY FALLBACKS: Only for backward compatibility
    if (post.featured_image_url && typeof post.featured_image_url === 'string' && post.featured_image_url.startsWith('http')) {
      return post.featured_image_url;
    }

    if (post.imageUrl && typeof post.imageUrl === 'string') {
      return post.imageUrl;
    }

    return '';
  } catch (error) {
    console.error('❌ Error extracting cover image:', error);
    return '';
  }
};
// Utility to safely extract cover image from post data - ENHANCED VERSION
export const getCoverImageFromPost = (post: any): string => {
  try {
    // Handle null/undefined
    if (!post) {
      return '';
    }

    // PRIORITY 1: Check cover_images field (unified handling)
    if (post.cover_images) {
      // Handle direct HTTP URL string
      if (typeof post.cover_images === 'string' && post.cover_images.startsWith('http')) {
        return post.cover_images;
      }
      
      // Handle JSON string or array
      if (typeof post.cover_images === 'string') {
        try {
          const parsed = JSON.parse(post.cover_images);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
            return parsed[0];
          }
        } catch (e) {
          // If JSON parsing fails, check if it's a direct URL
          if (post.cover_images.startsWith('http')) {
            return post.cover_images;
          }
        }
      }
      
      // Handle already parsed array
      if (Array.isArray(post.cover_images) && post.cover_images.length > 0 && post.cover_images[0]) {
        return post.cover_images[0];
      }
    }

    // PRIORITY 2: Extract first image from content HTML (NEW)
    if (post.content && typeof post.content === 'string') {
      const imgRegex = /<img[^>]+src="([^">]+)"/i;
      const match = post.content.match(imgRegex);
      if (match && match[1] && match[1].startsWith('http')) {
        return match[1];
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
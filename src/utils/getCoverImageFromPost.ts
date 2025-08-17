// Utility to safely extract cover image from post data - ENHANCED VERSION
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
        return post.cover_images;
      }
      
      // Handle Supabase Storage path (convert to public URL)
      if (typeof post.cover_images === 'string' && (
        post.cover_images.startsWith('post-media/') || 
        post.cover_images.startsWith('cover-images/') || 
        post.cover_images.includes('/'))) {
        return constructSupabaseStorageUrl(post.cover_images);
      }
      
      // Handle JSON string or array
      if (typeof post.cover_images === 'string') {
        try {
          const parsed = JSON.parse(post.cover_images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstImage = parsed[0];
            // Handle array of URLs
            if (typeof firstImage === 'string') {
              return firstImage.startsWith('http') ? firstImage : constructSupabaseStorageUrl(firstImage);
            }
            // Handle array of objects {url}
            if (typeof firstImage === 'object' && firstImage?.url) {
              return firstImage.url.startsWith('http') ? firstImage.url : constructSupabaseStorageUrl(firstImage.url);
            }
          }
        } catch (e) {
          // If JSON parsing fails, check if it's a direct URL or Storage path
          if (post.cover_images.startsWith('http') || post.cover_images.startsWith('//')) {
            return post.cover_images;
          }
          if (post.cover_images.includes('/')) {
            return constructSupabaseStorageUrl(post.cover_images);
          }
        }
      }
      
      // Handle already parsed array
      if (Array.isArray(post.cover_images) && post.cover_images.length > 0) {
        const firstImage = post.cover_images[0];
        if (typeof firstImage === 'string') {
          return firstImage.startsWith('http') ? firstImage : constructSupabaseStorageUrl(firstImage);
        }
        if (typeof firstImage === 'object' && firstImage?.url) {
          return firstImage.url.startsWith('http') ? firstImage.url : constructSupabaseStorageUrl(firstImage.url);
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

// Helper function to construct Supabase Storage public URLs
const constructSupabaseStorageUrl = (path: string): string => {
  if (!path || typeof path !== 'string') return '';
  
  // Already a full URL
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  
  // Determine bucket based on path prefix
  let bucket = 'post-media'; // default
  let cleanPath = path;
  
  if (path.startsWith('post-media/')) {
    bucket = 'post-media';
    cleanPath = path.substring(11); // remove 'post-media/'
  } else if (path.startsWith('cover-images/')) {
    bucket = 'cover-images';
    cleanPath = path.substring(13); // remove 'cover-images/'
  } else if (path.startsWith('avatars/')) {
    bucket = 'avatars';
    cleanPath = path.substring(8); // remove 'avatars/'
  } else if (path.startsWith('profile-images/')) {
    bucket = 'profile-images';
    cleanPath = path.substring(15); // remove 'profile-images/'
  }
  
  // Construct the public URL
  return `https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public/${bucket}/${cleanPath}`;
};
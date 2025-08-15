// Utility to safely extract cover image from post data
export const getCoverImageFromPost = (post: any): string => {
  try {
    // Debug logging
    console.log('🖼️ Extracting cover image from post:', { 
      id: post?.id, 
      cover_images: post?.cover_images,
      featured_image_url: post?.featured_image_url 
    });

    // Handle null/undefined
    if (!post) {
      console.log('❌ No post data provided');
      return '';
    }

    // Check cover_images field first (new format)
    if (post.cover_images) {
      // If it's a string URL, return it directly
      if (typeof post.cover_images === 'string' && post.cover_images.startsWith('http')) {
        console.log('✅ Found string cover image:', post.cover_images);
        return post.cover_images;
      }
      
      // If it's JSON/array, try to parse
      if (typeof post.cover_images === 'string') {
        try {
          const parsed = JSON.parse(post.cover_images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('✅ Found array cover image:', parsed[0]);
            return parsed[0];
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse cover_images JSON:', e);
        }
      }
      
      // If it's already an array
      if (Array.isArray(post.cover_images) && post.cover_images.length > 0) {
        console.log('✅ Found direct array cover image:', post.cover_images[0]);
        return post.cover_images[0];
      }
    }

    // Fallback to featured_image_url (legacy)
    if (post.featured_image_url) {
      console.log('✅ Found featured image URL:', post.featured_image_url);
      return post.featured_image_url;
    }

    console.log('❌ No cover image found');
    return '';
  } catch (error) {
    console.error('❌ Error extracting cover image:', error);
    return '';
  }
};
/**
 * Utility functions for date formatting and time calculations
 */

/**
 * Calculates the time elapsed since a given date
 * @param date - The date to calculate from
 * @returns A human-readable string representing time elapsed
 */
export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} secondi fa`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minuti'} fa`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'ora' : 'ore'} fa`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'giorno' : 'giorni'} fa`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'settimana' : 'settimane'} fa`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'mese' : 'mesi'} fa`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'anno' : 'anni'} fa`;
}

/**
 * Formats a date for display in Italian format
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export const getRandomCoverImage = (): string => {
  const images = [
    '/assets/images/hero-juventus-champions.jpg',
    '/assets/images/hero-sinner-usopen.jpg', 
    '/assets/images/hero-verstappen-monza.jpg',
    '/assets/images/derby-inter-milan.jpg',
    '/assets/images/juventus-mercato.jpg',
    '/assets/images/lakers-warriors.jpg',
    '/assets/images/leclerc-ferrari.jpg',
    '/assets/images/chiefs-superbowl.jpg',
    '/assets/images/verstappen-monza.jpg'
  ];
  
  return images[Math.floor(Math.random() * images.length)];
};

export const getCoverImageFromPost = (post: any): string => {
  console.log('getCoverImageFromPost called with:', { 
    id: post?.id, 
    cover_images: post?.cover_images, 
    featured_image_url: post?.featured_image_url 
  });
  
  if (!post) return '';
  
  // Check for direct cover_images field (single string now)
  if (post.cover_images && typeof post.cover_images === 'string' && post.cover_images.trim()) {
    console.log('Using cover_images:', post.cover_images);
    return post.cover_images;
  }
  
  // Fallback to featured_image_url
  if (post.featured_image_url && post.featured_image_url.trim()) {
    console.log('Using featured_image_url:', post.featured_image_url);
    return post.featured_image_url;
  }
  
  console.log('No valid image found, using random fallback');
  // Return random fallback if no specific image
  return getRandomCoverImage();
};
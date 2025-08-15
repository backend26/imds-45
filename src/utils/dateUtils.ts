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
  if (!post) return '';
  
  // If it's the mock data format (imageUrl)
  if (post.imageUrl) {
    return post.imageUrl;
  }
  
  // If it's the database format (cover_images) - simplified
  if (post.cover_images) {
    // Handle direct URL string (most common case)
    if (typeof post.cover_images === 'string' && post.cover_images.trim()) {
      // Check if it's a valid URL
      if (post.cover_images.startsWith('http') || post.cover_images.startsWith('/')) {
        return post.cover_images;
      }
    }
  }
  
  // Category-based fallbacks (no random selection for hero/trending)
  const categoryFallbacks: Record<string, string> = {
    'calcio': '/assets/images/derby-inter-milan.jpg',
    'f1': '/assets/images/verstappen-monza.jpg',
    'tennis': '/assets/images/sinner-usopen.jpg',
    'basket': '/assets/images/lakers-warriors.jpg',
    'nfl': '/assets/images/chiefs-superbowl.jpg'
  };
  
  if (post.category_id && categoryFallbacks[post.category_id.toLowerCase()]) {
    return categoryFallbacks[post.category_id.toLowerCase()];
  }
  
  if (post.category && categoryFallbacks[post.category.toLowerCase()]) {
    return categoryFallbacks[post.category.toLowerCase()];
  }
  
  // Final fallback
  return '/assets/images/derby-inter-milan.jpg';
};
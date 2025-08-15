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

/**
 * Gets a random cover image URL from an array of cover images
 * @param coverImages - Array of cover image objects or URLs
 * @returns A single image URL
 */
export function getRandomCoverImage(coverImages: any[]): string {
  if (!Array.isArray(coverImages) || coverImages.length === 0) {
    return '/assets/images/hero-juventus-champions.jpg'; // fallback
  }

  const randomIndex = Math.floor(Math.random() * coverImages.length);
  const selectedImage = coverImages[randomIndex];
  
  // Handle both string URLs and object formats
  if (typeof selectedImage === 'string') {
    return selectedImage;
  }
  
  if (selectedImage?.url) {
    return selectedImage.url;
  }
  
  return '/assets/images/hero-juventus-champions.jpg'; // fallback
}
/**
 * Date utilities compatible with date-fns v3
 * Centralized to handle breaking changes and ensure consistency
 */
import { formatDistanceToNow as fnsFormatDistanceToNow, format as fnsFormat } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Format a date with Italian locale
 */
export const format = (date: Date | string | number, formatStr: string): string => {
  return fnsFormat(new Date(date), formatStr, { locale: it });
};

/**
 * Format distance to now with Italian locale
 * Compatible with date-fns v3
 */
export const formatDistanceToNow = (
  date: Date | string | number, 
  options: { addSuffix?: boolean } = {}
): string => {
  return fnsFormatDistanceToNow(new Date(date), {
    ...options,
    locale: it
  });
};

/**
 * Format date for Italian display
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Get time ago in Italian
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
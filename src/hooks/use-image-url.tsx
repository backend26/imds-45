import { useMemo } from 'react';

/**
 * Hook per estrarre URL di immagine da qualsiasi formato
 * Gestisce: array JavaScript, stringhe JSON, URL diretti, path relativi
 */
export const useImageUrl = (
  input: unknown, 
  fallback: string = '/assets/images/default-banner.jpg'
): string => {
  return useMemo(() => {
    // Se input è null/undefined, usa fallback
    if (!input) {
      return fallback;
    }

    // PRIORITÀ: Array JavaScript nativo (cover_images dal database)
    if (Array.isArray(input)) {
      const firstItem = input[0];
      if (typeof firstItem === 'string' && firstItem.trim()) {
        // Se è già un URL completo, restituisci direttamente
        const cleaned = firstItem.trim();
        if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
          return cleaned;
        }
        if (cleaned.startsWith('/assets/')) {
          return cleaned;
        }
        return cleaned; // Per altri casi
      }
      return fallback;
    }

    // Se è una stringa, gestisci vari casi
    if (typeof input === 'string') {
      const cleaned = input.trim();
      
      if (!cleaned) {
        return fallback;
      }

      // Prova a fare parsing JSON (per legacy data)
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            return parsed[0];
          }
        } catch {
          // Se il parsing fallisce, usa fallback
          return fallback;
        }
      }

      // Se è già un URL completo, restituisci direttamente
      if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        return cleaned;
      }

      // Se è un path locale, restituisci direttamente
      if (cleaned.startsWith('/assets/')) {
        return cleaned;
      }

      return cleaned;
    }

    // Fallback finale
    return fallback;
  }, [input, fallback]);
};

export default useImageUrl;
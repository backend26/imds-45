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

    // Se è un array JavaScript nativo (caso cover_images dal database)
    if (Array.isArray(input)) {
      const firstItem = input[0];
      if (typeof firstItem === 'string' && firstItem.trim()) {
        return firstItem;
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
          // Se il parsing fallisce, continua con la stringa pulita
        }
      }

      // Se è già un URL completo, restituisci direttamente
      if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        return cleaned;
      }

      // Se è un path che inizia con /assets/, è un asset locale
      if (cleaned.startsWith('/assets/')) {
        return cleaned;
      }

      // Se contiene un path Supabase, costruisci URL completo
      if (cleaned.includes('/') && !cleaned.startsWith('http')) {
        const supabaseUrl = 'https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public';
        
        // Determina il bucket in base al path
        let bucket = 'cover-images'; // default
        let cleanPath = cleaned;

        if (cleaned.startsWith('post-media/')) {
          bucket = 'post-media';
          cleanPath = cleaned.substring(11);
        } else if (cleaned.startsWith('avatars/')) {
          bucket = 'avatars';
          cleanPath = cleaned.substring(8);
        } else if (cleaned.startsWith('profile-images/')) {
          bucket = 'profile-images';
          cleanPath = cleaned.substring(15);
        } else if (cleaned.startsWith('cover-images/')) {
          bucket = 'cover-images';
          cleanPath = cleaned.substring(13);
        }

        return `${supabaseUrl}/${bucket}/${cleanPath}`;
      }

      return cleaned;
    }

    // Se è un oggetto, prova a estrarre la proprietà url
    if (typeof input === 'object' && input !== null) {
      const obj = input as any;
      if (obj.url && typeof obj.url === 'string') {
        return obj.url;
      }
    }

    // Fallback finale
    return fallback;
  }, [input, fallback]);
};

export default useImageUrl;
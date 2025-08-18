// Configurazione immagini per lo sviluppo
// In produzione, sostituire con immagini reali dalla cartella /assets/images/

export const imagePlaceholders = {
  // Hero Images
  hero: {
    juventus: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=600&fit=crop&crop=center",
    verstappen: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=600&fit=crop&crop=center",
    sinner: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=600&fit=crop&crop=center"
  },
  
  // Article Images
  articles: {
    derby: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop&crop=center",
    verstappen: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=500&fit=crop&crop=center",
    sinner: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop&crop=center",
    lakers: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=500&fit=crop&crop=center",
    chiefs: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=500&fit=crop&crop=center",
    juventus: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop&crop=center",
    leclerc: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=500&fit=crop&crop=center",
    djokovic: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop&crop=center"
  }
};

// Funzione per ottenere l'URL dell'immagine - ANTI-DOUBLE-PROCESSING VERSION
export const getImageUrl = (path: string): string => {
  // Safety check
  if (!path || typeof path !== 'string') {
    return '/assets/images/derby-inter-milan.jpg'; // fallback
  }
  
  // Clean input with ultra-aggressive sanitization
  let cleanPath = path.trim();
  
  // ULTRA AGGRESSIVE bracket removal first
  let iterations = 0;
  while ((cleanPath.includes('[') || cleanPath.includes(']')) && iterations < 10) {
    cleanPath = cleanPath
      .replace(/^\[+/, '')         // Remove leading brackets
      .replace(/\]+$/, '')         // Remove trailing brackets
      .replace(/[\[\]]/g, '')      // Remove ALL brackets
      .replace(/%5B/g, '')         // Remove encoded brackets
      .replace(/%5D/g, '')         // Remove encoded brackets
      .trim();
    iterations++;
  }
  
  if (import.meta.env.DEV && iterations > 0) {
    console.log('🔧 getImageUrl: Removed brackets in', iterations, 'iterations:', { original: path, cleaned: cleanPath });
  }
  
  // PRIORITY 1: Complete Supabase URLs - return immediately after sanitization
  if (cleanPath.includes('supabase.co/storage/v1/object/public/')) {
    // Already a complete Supabase URL - just ensure proper protocol
    let finalUrl = cleanPath;
    
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl.replace(/^\/+/, '');
    }
    
    // Final cleanup of any remaining malformed parts
    finalUrl = finalUrl
      .replace(/\/+/g, '/')
      .replace(/https:\/([^\/])/, 'https://$1');
    
    if (import.meta.env.DEV) {
      console.log('🔗 getImageUrl: Complete Supabase URL detected (NO PROCESSING):', { original: path, final: finalUrl });
    }
    return finalUrl;
  }
  
  // PRIORITY 2: Complete HTTP/HTTPS URLs - return as-is
  if (cleanPath.startsWith('https://') || cleanPath.startsWith('http://')) {
    if (import.meta.env.DEV) {
      console.log('🔗 getImageUrl: Complete HTTP URL detected:', cleanPath);
    }
    return cleanPath;
  }
  
  // PRIORITY 3: Protocol-relative URL
  if (cleanPath.startsWith('//')) {
    return 'https:' + cleanPath;
  }
  
  // PRIORITY 4: Supabase Storage path - construct full URL (ONLY if not already complete)
  if (cleanPath.includes('/') && (
    cleanPath.startsWith('post-media/') || 
    cleanPath.startsWith('cover-images/') || 
    cleanPath.startsWith('avatars/') || 
    cleanPath.startsWith('profile-images/')
  )) {
    const constructedUrl = constructSupabaseImageUrl(cleanPath);
    if (import.meta.env.DEV) {
      console.log('🔗 getImageUrl: Constructed from storage path:', { original: path, cleaned: cleanPath, constructed: constructedUrl });
    }
    return constructedUrl;
  }
  
  // PRIORITY 5: Local asset path
  if (cleanPath.startsWith('/assets/') || cleanPath.startsWith('./assets/')) {
    // In produzione, restituire il path diretto
    if (import.meta.env.PROD) {
      return cleanPath;
    }
    
    // In sviluppo, mappare con i placeholder
    const pathMap: Record<string, string> = {
      '/assets/images/hero-juventus-champions.jpg': imagePlaceholders.hero.juventus,
      '/assets/images/hero-verstappen-monza.jpg': imagePlaceholders.hero.verstappen,
      '/assets/images/hero-sinner-usopen.jpg': imagePlaceholders.hero.sinner,
      '/assets/images/derby-inter-milan.jpg': imagePlaceholders.articles.derby,
      '/assets/images/verstappen-monza.jpg': imagePlaceholders.articles.verstappen,
      '/assets/images/sinner-usopen.jpg': imagePlaceholders.articles.sinner,
      '/assets/images/lakers-warriors.jpg': imagePlaceholders.articles.lakers,
      '/assets/images/chiefs-superbowl.jpg': imagePlaceholders.articles.chiefs,
      '/assets/images/juventus-mercato.jpg': imagePlaceholders.articles.juventus,
      '/assets/images/leclerc-ferrari.jpg': imagePlaceholders.articles.leclerc,
      '/assets/images/djokovic-record.jpg': imagePlaceholders.articles.djokovic
    };
    
    return pathMap[cleanPath] || cleanPath;
  }
  
  // Unknown format - return fallback
  if (import.meta.env.DEV) {
    console.warn('🔗 getImageUrl: Unknown path format after all processing:', cleanPath);
  }
  return '/assets/images/derby-inter-milan.jpg';
};

// Helper function to construct Supabase Storage URLs - ULTRA SAFE VERSION
const constructSupabaseImageUrl = (path: string): string => {
  if (!path || typeof path !== 'string') return '';
  
  // CRITICAL: Already a full URL - NEVER double-process
  if (path.startsWith('http') || path.startsWith('//') || path.includes('supabase.co')) {
    if (import.meta.env.DEV) {
      console.log('🔗 constructSupabaseImageUrl: SKIPPING - Already full URL:', path);
    }
    return path.startsWith('http') ? path : 'https://' + path.replace(/^\/+/, '');
  }
  
  // ULTRA AGGRESSIVE path cleaning
  let cleanPath = path;
  
  // Remove ALL brackets aggressively
  let iterations = 0;
  while ((cleanPath.includes('[') || cleanPath.includes(']')) && iterations < 10) {
    cleanPath = cleanPath
      .replace(/^\[+/, '')         // Remove leading brackets
      .replace(/\]+$/, '')         // Remove trailing brackets
      .replace(/[\[\]]/g, '')      // Remove ALL brackets
      .replace(/%5B/g, '')         // Remove encoded brackets
      .replace(/%5D/g, '')         // Remove encoded brackets
      .replace(/["'\\]/g, '')      // Remove quotes, backslashes
      .replace(/%22/g, '')         // Remove URL-encoded quotes
      .trim();
    iterations++;
  }
  
  // Clean whitespace and separators
  cleanPath = cleanPath
    .replace(/^[,\s]+/, '')        // Remove leading commas/spaces
    .replace(/[,\s]+$/, '')        // Remove trailing commas/spaces
    .replace(/\s+/g, '')           // Remove ALL spaces
    .trim();
  
  // CRITICAL: Double-check for Supabase URL after cleaning
  if (cleanPath.includes('supabase.co/storage/v1/object/public/')) {
    const fullUrl = cleanPath.startsWith('http') ? cleanPath : 'https://' + cleanPath;
    if (import.meta.env.DEV) {
      console.log('🔗 constructSupabaseImageUrl: FOUND Supabase URL after cleaning:', { original: path, cleaned: cleanPath, fullUrl });
    }
    return fullUrl;
  }
  
  // Determine bucket and final path
  let bucket = 'post-media'; // default
  let finalPath = cleanPath;
  
  if (cleanPath.startsWith('post-media/')) {
    bucket = 'post-media';
    finalPath = cleanPath.substring(11);
  } else if (cleanPath.startsWith('cover-images/')) {
    bucket = 'cover-images';
    finalPath = cleanPath.substring(13);
  } else if (cleanPath.startsWith('avatars/')) {
    bucket = 'avatars';
    finalPath = cleanPath.substring(8);
  } else if (cleanPath.startsWith('profile-images/')) {
    bucket = 'profile-images';
    finalPath = cleanPath.substring(15);
  }
  
  // Clean final path and ensure no double slashes
  finalPath = finalPath
    .replace(/\/+/g, '/')          // Fix multiple slashes
    .replace(/^\/+/, '')           // Remove leading slashes
    .replace(/\s/g, '');           // Remove any remaining spaces
  
  // Construct the public URL
  const url = `https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public/${bucket}/${finalPath}`;
  
  if (import.meta.env.DEV) {
    console.log('🔗 constructSupabaseImageUrl FINAL:', { 
      original: path, 
      cleaned: cleanPath, 
      bucket, 
      finalPath, 
      url,
      bracketsRemoved: iterations > 0 ? iterations : 'none'
    });
  }
  
  return url;
};
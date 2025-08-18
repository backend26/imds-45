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

// Funzione per ottenere l'URL dell'immagine
export const getImageUrl = (path: string): string => {
  // Safety check
  if (!path || typeof path !== 'string') {
    return '/assets/images/derby-inter-milan.jpg'; // fallback
  }
  
  // Already a full URL - don't double-process
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  
  // Check if this is already a complete Supabase URL that got passed incorrectly
  if (path.includes('supabase.co/storage/v1/object/public/')) {
    return path.startsWith('http') ? path : 'https://' + path;
  }
  
  // Supabase Storage path - construct full URL only if it's a storage path
  if (path.includes('/') && (
    path.startsWith('post-media/') || 
    path.startsWith('cover-images/') || 
    path.startsWith('avatars/') || 
    path.startsWith('profile-images/')
  )) {
    return constructSupabaseImageUrl(path);
  }
  
  // In produzione, restituire il path diretto per assets locali
  if (import.meta.env.PROD) {
    return path;
  }
  
  // In sviluppo, mappare i path con i placeholder
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
  
  return pathMap[path] || path;
};

// Helper function to construct Supabase Storage URLs
const constructSupabaseImageUrl = (path: string): string => {
  if (!path || typeof path !== 'string') return '';
  
  // Already a full URL - don't double-process
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  
  // Remove any brackets or malformed characters
  let cleanPath = path
    .replace(/[\[\]"']/g, '')
    .replace(/%22/g, '')
    .trim();
  
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
  
  // Ensure no double slashes in path
  finalPath = finalPath.replace(/\/+/g, '/');
  
  // Construct the public URL
  const url = `https://ybybtquplonmoopexljw.supabase.co/storage/v1/object/public/${bucket}/${finalPath}`;
  
  if (import.meta.env.DEV) {
    console.log('🔗 constructSupabaseImageUrl:', { original: path, bucket, finalPath, url });
  }
  
  return url;
};
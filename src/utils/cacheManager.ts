// Cache management utilities
export const clearServiceWorkerCache = async () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      
      // Force service worker update
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
      
      console.log('🔄 Service Worker cache cleared');
    } catch (error) {
      console.error('Failed to clear Service Worker cache:', error);
    }
  }
};

export const forceBrowserRefresh = () => {
  // Clear localStorage cache flags
  localStorage.removeItem('posts-cache');
  localStorage.removeItem('hero-cache');
  
  // Force hard reload
  window.location.reload();
};

export const invalidateBrowserCache = () => {
  // Add timestamp to force cache busting
  const timestamp = Date.now();
  
  // Update cache busting in localStorage
  localStorage.setItem('cache-bust', timestamp.toString());
  
  return timestamp;
};
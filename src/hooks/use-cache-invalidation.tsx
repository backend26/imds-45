import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const invalidatePosts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['heroArticles'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }, [queryClient]);

  const invalidateUsers = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }, [queryClient]);

  const invalidateReports = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }, [queryClient]);

  const refreshAfterDelete = useCallback(() => {
    // Force immediate refresh for critical operations
    queryClient.removeQueries();
    
    // Clear service worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      }).then(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }, [queryClient]);

  const clearAllCaches = useCallback(async () => {
    // Clear React Query cache
    queryClient.removeQueries();
    
    // Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }
    
    // Clear localStorage cache flags
    localStorage.removeItem('posts-cache');
    localStorage.removeItem('hero-cache');
    
    console.log('🧹 All caches cleared');
  }, [queryClient]);

  return {
    invalidateAll,
    invalidatePosts,
    invalidateUsers,
    invalidateReports,
    refreshAfterDelete,
    clearAllCaches
  };
};
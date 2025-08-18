import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface AutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
  keys?: string[];
}

export const useAutoRefresh = ({ 
  interval = 30000, 
  enabled = true, 
  keys = ['posts', 'heroArticles', 'stats'] 
}: AutoRefreshOptions = {}) => {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(() => {
    if (!enabled) return;
    
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
    
    if (import.meta.env.DEV) {
      console.log('🔄 Auto-refresh invalidated queries:', keys);
    }
  }, [queryClient, enabled, keys]);

  const forceRefresh = useCallback(() => {
    queryClient.removeQueries();
    window.location.reload();
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(invalidateQueries, interval);
    return () => clearInterval(intervalId);
  }, [invalidateQueries, interval, enabled]);

  return { invalidateQueries, forceRefresh };
};
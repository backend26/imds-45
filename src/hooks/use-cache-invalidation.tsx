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
    window.location.reload();
  }, [queryClient]);

  return {
    invalidateAll,
    invalidatePosts,
    invalidateUsers,
    invalidateReports,
    refreshAfterDelete
  };
};
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

interface RoleCheckResult {
  isLoading: boolean;
  hasAccess: boolean;
  userRole: UserRole | null;
  profile: any | null;
  error: string | null;
}

interface UseRoleCheckOptions {
  allowedRoles: UserRole[];
  cacheKey?: string;
}

// Global cache for role data
const roleCache = new Map<string, {
  data: RoleCheckResult;
  timestamp: number;
  expiresAt: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 100; // 100ms debounce

export const useRoleCheckCached = ({ allowedRoles, cacheKey }: UseRoleCheckOptions): RoleCheckResult => {
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<RoleCheckResult>({
    isLoading: true,
    hasAccess: false,
    userRole: null,
    profile: null,
    error: null,
  });
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Generate cache key based on user ID and allowed roles
  const finalCacheKey = cacheKey || `${user?.id || 'anonymous'}-${allowedRoles.join(',')}`;

  const checkRoleFromDB = useCallback(async () => {
    if (!user) {
      const noUserResult = {
        isLoading: false,
        hasAccess: false,
        userRole: null,
        profile: null,
        error: 'Authentication required',
      };
      if (mountedRef.current) {
        setResult(noUserResult);
      }
      return noUserResult;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, role, display_name, is_banned')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        const errorResult = {
          isLoading: false,
          hasAccess: false,
          userRole: null,
          profile: null,
          error: 'Failed to verify user permissions',
        };
        if (mountedRef.current) {
          setResult(errorResult);
        }
        return errorResult;
      }

      if (!profileData) {
        const noProfileResult = {
          isLoading: false,
          hasAccess: false,
          userRole: null,
          profile: null,
          error: 'User profile not found',
        };
        if (mountedRef.current) {
          setResult(noProfileResult);
        }
        return noProfileResult;
      }

      if (profileData.is_banned) {
        const bannedResult = {
          isLoading: false,
          hasAccess: false,
          userRole: profileData.role,
          profile: profileData,
          error: 'Account suspended',
        };
        if (mountedRef.current) {
          setResult(bannedResult);
        }
        return bannedResult;
      }

      const hasRequiredRole = allowedRoles.includes(profileData.role);
      const successResult = {
        isLoading: false,
        hasAccess: hasRequiredRole,
        userRole: profileData.role,
        profile: profileData,
        error: hasRequiredRole ? null : `Insufficient permissions. Required: ${allowedRoles.join(', ')}, Current: ${profileData.role}`,
      };

      // Cache the result
      roleCache.set(finalCacheKey, {
        data: successResult,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      });

      if (mountedRef.current) {
        setResult(successResult);
      }
      return successResult;

    } catch (err) {
      console.error('Role check error:', err);
      const errorResult = {
        isLoading: false,
        hasAccess: false,
        userRole: null,
        profile: null,
        error: 'Permission verification failed',
      };
      if (mountedRef.current) {
        setResult(errorResult);
      }
      return errorResult;
    }
  }, [user, allowedRoles, finalCacheKey]);

  const debouncedCheckRole = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      // Check cache first
      const cached = roleCache.get(finalCacheKey);
      if (cached && Date.now() < cached.expiresAt && cached.data.profile) {
        setResult(cached.data);
        return;
      }

      // If no valid cache, fetch from DB
      checkRoleFromDB();
    }, DEBOUNCE_DELAY);
  }, [finalCacheKey, checkRoleFromDB]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (authLoading) {
      setResult(prev => ({ ...prev, isLoading: true }));
      return;
    }

    debouncedCheckRole();

    return () => {
      mountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [authLoading, debouncedCheckRole]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return result;
};

// Cache invalidation utilities
export const invalidateRoleCache = (userId?: string) => {
  if (userId) {
    // Clear specific user's cache entries
    for (const [key] of roleCache) {
      if (key.startsWith(userId)) {
        roleCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    roleCache.clear();
  }
};

export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, cached] of roleCache) {
    if (now >= cached.expiresAt) {
      roleCache.delete(key);
    }
  }
};

// Specific role check hooks using cached version
export const useAdminCheckCached = () => {
  return useRoleCheckCached({ allowedRoles: ['administrator'] });
};

export const useEditorCheckCached = () => {
  return useRoleCheckCached({ allowedRoles: ['administrator', 'editor', 'journalist'] });
};

export const useModeratorCheckCached = () => {
  return useRoleCheckCached({ allowedRoles: ['administrator'] });
};

// Export convenience hooks for backward compatibility
export const useAdminCheck = () => useRoleCheckCached({ allowedRoles: ['administrator'] });
export const useEditorCheck = () => useRoleCheckCached({ allowedRoles: ['administrator', 'editor', 'journalist'] });

// Legacy hook compatibility
export const usePermissionsCheck = (allowedRoles: UserRole[]) => useRoleCheckCached({ allowedRoles });
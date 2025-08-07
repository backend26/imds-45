import { useState, useEffect } from 'react';
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
  redirectOnFail?: boolean;
}

export const useRoleCheck = ({ allowedRoles, redirectOnFail = false }: UseRoleCheckOptions): RoleCheckResult => {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      // Reset state
      setIsLoading(true);
      setHasAccess(false);
      setUserRole(null);
      setProfile(null);
      setError(null);

      // Wait for auth to complete
      if (authLoading) return;

      // User must be logged in
      if (!user) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile from database (SECURE source)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, username, role, display_name, is_banned')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to verify user permissions');
          setIsLoading(false);
          return;
        }

        // Profile not found
        if (!profileData) {
          setError('User profile not found');
          setIsLoading(false);
          return;
        }

        // Check if user is banned
        if (profileData.is_banned) {
          setError('Account suspended');
          setIsLoading(false);
          return;
        }

        // Set profile and role
        setProfile(profileData);
        setUserRole(profileData.role);

        // Check if user has required role
        const hasRequiredRole = allowedRoles.includes(profileData.role);
        setHasAccess(hasRequiredRole);

        if (!hasRequiredRole) {
          setError(`Insufficient permissions. Required: ${allowedRoles.join(', ')}, Current: ${profileData.role}`);
        }

      } catch (err) {
        console.error('Role check error:', err);
        setError('Permission verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [user, authLoading, allowedRoles]);

  return {
    isLoading,
    hasAccess,
    userRole,
    profile,
    error
  };
};

// Specific role check hooks for common use cases
export const useAdminCheck = () => {
  return useRoleCheck({ allowedRoles: ['administrator'] });
};

export const useEditorCheck = () => {
  return useRoleCheck({ allowedRoles: ['administrator', 'editor'] });
};

export const useModeratorCheck = () => {
  return useRoleCheck({ allowedRoles: ['administrator'] });
};
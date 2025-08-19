import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleCheckCached as useRoleCheck } from '@/hooks/use-role-check-cached';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle } from 'lucide-react';

type UserRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  loadingComponent?: ReactNode;
  showErrorMessage?: boolean;
}

// Helper function to check hierarchical permissions
const hasHierarchicalAccess = (userRole: UserRole | null, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  
  // Admin can access everything
  if (userRole === 'administrator') return true;
  
  // Journalist can access journalist pages + user pages
  if (userRole === 'journalist' && allowedRoles.includes('journalist')) return true;
  if (userRole === 'journalist' && allowedRoles.includes('registered_user')) return true;
  
  // Check exact role match
  return allowedRoles.includes(userRole);
};

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/',
  loadingComponent,
  showErrorMessage = true
}: ProtectedRouteProps) => {
  const { isLoading, profile, error } = useRoleCheck({ allowedRoles });

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifica autorizzazioni...</p>
        </div>
      </div>
    );
  }

  // Check hierarchical access
  const hasAccess = hasHierarchicalAccess(profile?.role || null, allowedRoles);

  // Access denied
  if (!hasAccess) {
    if (showErrorMessage) {
      toast({
        title: "Accesso negato",
        description: error || "Non hai i permessi per accedere a questa pagina",
        variant: "destructive",
      });
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Access granted
  return <>{children}</>;
};

// Error display component for manual error handling
export const AccessDeniedAlert = ({ error }: { error: string }) => {
  return (
    <Alert variant="destructive" className="max-w-md mx-auto mt-8">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        {error}
      </AlertDescription>
    </Alert>
  );
};

// Loading skeleton for protected content
export const ProtectedContentSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
};
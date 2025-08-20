import { ReactNode } from 'react';
import { useJournalistCheck } from '@/hooks/use-role-check-cached';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EditorPermissionWrapperProps {
  children: ReactNode;
  fallbackMessage?: string;
}

export const EditorPermissionWrapper = ({ 
  children, 
  fallbackMessage = "Non hai i permessi per accedere a questa sezione." 
}: EditorPermissionWrapperProps) => {
  const { hasAccess, isLoading, userRole, error } = useJournalistCheck();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2 text-destructive">Accesso Negato</h3>
            <p className="text-muted-foreground mb-4">{fallbackMessage}</p>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Torna Indietro
              </Button>
              <Button onClick={() => navigate('/')}>
                Vai alla Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
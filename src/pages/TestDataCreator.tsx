import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { createTestUser, createTestPosts, updateUserRole } from '@/utils/test-user-creator';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

export const TestDataCreator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    userCreated: boolean | null;
    postsCreated: boolean | null;
    roleUpdated: boolean | null;
  }>({
    userCreated: null,
    postsCreated: null,
    roleUpdated: null
  });

  const handleCreateTestData = async () => {
    setLoading(true);
    setResults({ userCreated: null, postsCreated: null, roleUpdated: null });

    try {
      // Step 1: Create test user
      const testUser = await createTestUser();
      const userCreated = !!testUser;
      setResults(prev => ({ ...prev, userCreated }));

      if (!testUser) {
        toast({
          title: "Errore",
          description: "Impossibile creare l'utente di test",
          variant: "destructive"
        });
        return;
      }

      // Step 2: Update user role to editor
      const roleUpdated = await updateUserRole(testUser.id, 'editor');
      setResults(prev => ({ ...prev, roleUpdated }));

      // Step 3: Create test posts
      const postsCreated = await createTestPosts(testUser.id);
      setResults(prev => ({ ...prev, postsCreated }));

      if (userCreated && roleUpdated && postsCreated) {
        toast({
          title: "Successo!",
          description: "Tutti i dati di test sono stati creati con successo"
        });
      }
    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione dei dati di test",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-5 h-5" />;
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Creatore Dati di Test</CardTitle>
            <p className="text-muted-foreground">
              Crea utenti e contenuti di test per verificare il funzionamento dell'app
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Utente corrente:</strong> {user.email}
                </p>
                <Badge variant="outline">{user.id}</Badge>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold">Operazioni da eseguire:</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <StatusIcon status={results.userCreated} />
                  <span>Creare utente editor di test (editor@test.com)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <StatusIcon status={results.roleUpdated} />
                  <span>Assegnare ruolo editor all'utente</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <StatusIcon status={results.postsCreated} />
                  <span>Creare 5 articoli di test con immagini</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateTestData}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creazione in corso...
                </>
              ) : (
                'Crea Dati di Test'
              )}
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Cosa farà questo processo:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Creerà un utente editor con email: editor@test.com</li>
                <li>Password: TestEditor123!</li>
                <li>Creerà 5 articoli di esempio per testare la homepage</li>
                <li>Inserirà eventi e trending topics di test</li>
                <li>Configurerà i bucket per l'upload delle immagini</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
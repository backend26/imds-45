import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export const AccountDeletion = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendConfirmationEmail = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Send confirmation email via Edge Function
      const response = await fetch('/api/send-deletion-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id
        })
      });

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Email inviata",
          description: "Controlla la tua email per confermare l'eliminazione dell'account."
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending deletion email:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare l'email di conferma.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (confirmText !== 'ELIMINA DEFINITIVAMENTE') {
      toast({
        title: "Conferma non valida",
        description: "Devi scrivere esattamente 'ELIMINA DEFINITIVAMENTE'",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      // First, delete the user profile (this will cascade delete related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Then delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) throw authError;

      toast({
        title: "Account eliminato",
        description: "Il tuo account è stato eliminato definitivamente."
      });

      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'account. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Zona Pericolosa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Azioni irreversibili che non possono essere annullate
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            L'eliminazione dell'account è permanente e comporterà:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Eliminazione di tutti i tuoi articoli</li>
              <li>Rimozione di tutti i commenti</li>
              <li>Perdita di follower e seguiti</li>
              <li>Cancellazione delle immagini caricate</li>
              <li>Eliminazione di tutti i dati personali</li>
            </ul>
          </AlertDescription>
        </Alert>

        {!emailSent ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Per eliminare il tuo account, riceverai prima un'email di conferma.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleSendConfirmationEmail}
              disabled={loading}
              className="w-full"
            >
              Invia Email di Conferma
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Email di conferma inviata a {user?.email}. Segui le istruzioni nell'email per procedere.
              </AlertDescription>
            </Alert>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Elimina Account Ora
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">
                    Conferma Eliminazione Account
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Questa azione è IRREVERSIBILE. Tutti i tuoi dati verranno eliminati definitivamente.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-deletion">
                      Scrivi "ELIMINA DEFINITIVAMENTE" per confermare:
                    </Label>
                    <Input
                      id="confirm-deletion"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="ELIMINA DEFINITIVAMENTE"
                      className="border-destructive/50 focus:border-destructive"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      className="flex-1"
                    >
                      Annulla
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleAccountDeletion}
                      disabled={loading || confirmText !== 'ELIMINA DEFINITIVAMENTE'}
                      className="flex-1"
                    >
                      {loading ? 'Eliminando...' : 'Elimina Definitivamente'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
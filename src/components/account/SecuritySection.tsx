import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Key, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export const SecuritySection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [changingEmail, setChangingEmail] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Errore",
        description: "La password deve essere di almeno 8 caratteri",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password aggiornata",
        description: "La tua password è stata cambiata con successo"
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile cambiare la password",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEmailChange = async () => {
    if (!email) {
      toast({ title: 'Errore', description: 'Inserisci una email valida', variant: 'destructive' });
      return;
    }
    const basicPattern = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!basicPattern.test(email)) {
      toast({ title: 'Errore', description: 'Formato email non valido', variant: 'destructive' });
      return;
    }

    setChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast({
        title: 'Email aggiornata',
        description: 'Controlla la casella per confermare il nuovo indirizzo',
      });
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({ title: 'Errore', description: error.message || 'Impossibile aggiornare l\'email', variant: 'destructive' });
    } finally {
      setChangingEmail(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      // Create deletion request
      const { error } = await supabase
        .from('data_deletions')
        .insert({
          user_id: user.id,
          reason: 'user_request',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "La richiesta di eliminazione account è stata inviata. Il tuo account sarà eliminato entro 30 giorni."
      });

      // Sign out the user
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la richiesta",
        variant: "destructive"
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cambia Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Nuova Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@dominio.com"
            />
          </div>
          <Button onClick={handleEmailChange} disabled={changingEmail || !email} className="w-full">
            {changingEmail ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Aggiornando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Cambia Email
              </>
            )}
          </Button>
          <div className="text-xs text-muted-foreground">
            Ti invieremo un link di conferma al nuovo indirizzo
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cambia Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nuova Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Inserisci la nuova password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Conferma Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Conferma la nuova password"
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full"
          >
            {changingPassword ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Cambiando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Cambia Password
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            La password deve contenere almeno 8 caratteri
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Deletion */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona Pericolosa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Elimina Account</h4>
            <p className="text-sm text-muted-foreground">
              Una volta eliminato, il tuo account non potrà essere recuperato. 
              Tutti i tuoi dati, post e commenti saranno rimossi permanentemente.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. Il tuo account e tutti i dati associati 
                  saranno eliminati permanentemente entro 30 giorni.
                  
                  <br /><br />
                  
                  <strong>Verranno eliminati:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Il tuo profilo e tutti i dati personali</li>
                    <li>Tutti i tuoi post e commenti</li>
                    <li>I tuoi like e preferiti</li>
                    <li>Le tue notifiche e preferenze</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccountDeletion}
                  disabled={deletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletingAccount ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    'Elimina Definitivamente'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
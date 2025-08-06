import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Shield, Key, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecurityTabProps {
  onError: (error: any) => void;
}

export const SecurityTab = ({ onError }: SecurityTabProps) => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Errore",
        description: "La password deve essere di almeno 8 caratteri",
        variant: "destructive",
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
        description: "La tua password è stata modificata con successo",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      onError(error);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    try {
      // Questo forza il logout da tutti gli altri dispositivi
      const { error } = await supabase.auth.updateUser({
        data: { 
          logout_timestamp: new Date().toISOString() 
        }
      });

      if (error) throw error;

      toast({
        title: "Logout completato",
        description: "Sei stato disconnesso da tutti gli altri dispositivi",
      });
    } catch (error) {
      console.error('Error logging out other devices:', error);
      onError(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Modifica Password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Mantieni il tuo account sicuro con una password forte
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nuova Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Inserisci la nuova password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Conferma la nuova password"
                required
                minLength={8}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                La password deve contenere almeno 8 caratteri. Si consiglia di utilizzare una combinazione di lettere, numeri e caratteri speciali.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="w-full"
            >
              {changingPassword ? 'Modificando...' : 'Modifica Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Autenticazione a Due Fattori (2FA)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aggiungi un ulteriore livello di sicurezza al tuo account
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Abilita 2FA</p>
              <p className="text-sm text-muted-foreground">
                Richiedi un codice aggiuntivo quando effettui l'accesso
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Attivo" : "Disattivo"}
              </Badge>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
          </div>

          {twoFactorEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                L'autenticazione a due fattori è attiva. Il tuo account è più sicuro!
              </AlertDescription>
            </Alert>
          )}

          {!twoFactorEnabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Questa funzionalità sarà implementata nelle prossime versioni. Per ora puoi utilizzare una password forte.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicurezza Account
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestisci le impostazioni di sicurezza del tuo account
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email dell'account</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="outline">Verificata</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ultimo accesso</p>
                <p className="text-sm text-muted-foreground">
                  {user?.last_sign_in_at ? 
                    new Date(user.last_sign_in_at).toLocaleString('it-IT') : 
                    'Mai'
                  }
                </p>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleLogoutOtherDevices}
              className="w-full"
            >
              Disconnetti da Altri Dispositivi
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Questo ti disconnetterà da tutti gli altri dispositivi dove hai effettuato l'accesso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
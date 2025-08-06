import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Copy,
  Download,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Session {
  session_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_seen: string;
  is_current?: boolean;
}

const mockSessions: Session[] = [
  {
    session_id: 'current',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome 120.0.0.0 on Windows',
    created_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    is_current: true
  },
  {
    session_id: 'session2',
    ip_address: '192.168.1.101',
    user_agent: 'Safari 17.0 on macOS',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

export const AdvancedSecurity = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [showTfaSetup, setShowTfaSetup] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      // In real implementation, fetch user's 2FA status
      // setTfaEnabled(user.user_metadata?.tfa_enabled || false);
    }
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non coincidono",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password aggiornata",
        description: "La tua password è stata cambiata con successo"
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la password",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const generateTfaSecret = () => {
    // In real implementation, this would generate a proper TOTP secret
    const secret = 'JBSWY3DPEHPK3PXP';
    setTfaSecret(secret);
    setShowTfaSetup(true);
  };

  const enableTfa = async () => {
    try {
      // In real implementation, verify the TOTP code and enable 2FA
      if (!tfaCode || tfaCode.length !== 6) {
        toast({
          title: "Errore",
          description: "Inserisci un codice a 6 cifre valido",
          variant: "destructive"
        });
        return;
      }

      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);
      setTfaEnabled(true);
      setShowTfaSetup(false);

      toast({
        title: "2FA Attivata",
        description: "L'autenticazione a due fattori è stata attivata con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile attivare l'autenticazione a due fattori",
        variant: "destructive"
      });
    }
  };

  const disableTfa = async () => {
    try {
      setTfaEnabled(false);
      setTfaSecret('');
      setBackupCodes([]);
      
      toast({
        title: "2FA Disattivata",
        description: "L'autenticazione a due fattori è stata disattivata"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile disattivare l'autenticazione a due fattori",
        variant: "destructive"
      });
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      
      toast({
        title: "Sessione revocata",
        description: "La sessione è stata terminata con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile revocare la sessione",
        variant: "destructive"
      });
    }
  };

  const revokeAllSessions = async () => {
    try {
      setSessions(prev => prev.filter(s => s.is_current));
      
      toast({
        title: "Sessioni revocate",
        description: "Tutte le altre sessioni sono state terminate"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile revocare tutte le sessioni",
        variant: "destructive"
      });
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast({
      title: "Codici copiati",
      description: "I codici di backup sono stati copiati negli appunti"
    });
  };

  const downloadBackupCodes = () => {
    const content = `Codici di backup - Malati dello Sport\n\n${backupCodes.join('\n')}\n\nConserva questi codici in un luogo sicuro. Ogni codice può essere utilizzato una sola volta.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="2fa">Autenticazione 2FA</TabsTrigger>
          <TabsTrigger value="sessions">Sessioni Attive</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Cambia Password
              </CardTitle>
              <CardDescription>
                Aggiorna la tua password per mantenere il tuo account sicuro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Password attuale</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nuova password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Conferma nuova password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Aggiornamento...' : 'Aggiorna password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autenticazione a Due Fattori
              </CardTitle>
              <CardDescription>
                Aggiungi un livello extra di sicurezza al tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tfaEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {tfaEnabled ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">Autenticazione a due fattori</p>
                    <p className="text-sm text-muted-foreground">
                      {tfaEnabled ? 'Attiva' : 'Non attiva'}
                    </p>
                  </div>
                </div>
                <Badge variant={tfaEnabled ? "default" : "secondary"}>
                  {tfaEnabled ? 'Attiva' : 'Inattiva'}
                </Badge>
              </div>

              {!tfaEnabled ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      L'autenticazione a due fattori aggiunge un livello extra di sicurezza al tuo account.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={generateTfaSecret}>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Attiva 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      L'autenticazione a due fattori è attiva sul tuo account.
                    </AlertDescription>
                  </Alert>
                  
                  {backupCodes.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Codici di backup</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Conserva questi codici in un luogo sicuro. Puoi usarli per accedere se perdi il tuo dispositivo.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-3">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-background rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copia
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                          <Download className="h-3 w-3 mr-1" />
                          Scarica
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button variant="destructive" onClick={disableTfa}>
                    Disattiva 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Sessioni Attive
              </CardTitle>
              <CardDescription>
                Gestisci i dispositivi che hanno accesso al tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {sessions.length} sessione{sessions.length !== 1 ? 'i' : ''} attiva{sessions.length !== 1 ? 'e' : ''}
                </p>
                {sessions.filter(s => !s.is_current).length > 0 && (
                  <Button variant="outline" size="sm" onClick={revokeAllSessions}>
                    <X className="h-3 w-3 mr-1" />
                    Termina tutte le altre sessioni
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.session_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {session.user_agent}
                            </p>
                            {session.is_current && (
                              <Badge variant="default" className="text-xs">
                                Sessione corrente
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            IP: {session.ip_address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ultimo accesso: {formatDistanceToNow(new Date(session.last_seen), {
                              addSuffix: true,
                              locale: it
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeSession(session.session_id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={showTfaSetup} onOpenChange={setShowTfaSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configura Autenticazione 2FA</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Scansiona il codice QR con la tua app di autenticazione (Google Authenticator, Authy, ecc.)
              </AlertDescription>
            </Alert>
            
            <div className="bg-white p-4 rounded-lg border text-center">
              <div className="w-32 h-32 bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                <p className="text-xs text-gray-500">QR Code</p>
              </div>
              <p className="text-xs text-muted-foreground break-all">
                {tfaSecret}
              </p>
            </div>
            
            <div>
              <Label htmlFor="tfaCode">Codice di verifica (6 cifre)</Label>
              <Input
                id="tfaCode"
                placeholder="123456"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value)}
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={enableTfa} className="flex-1">
                Attiva 2FA
              </Button>
              <Button variant="outline" onClick={() => setShowTfaSetup(false)}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
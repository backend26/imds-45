import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Key, 
  Shield, 
  Smartphone, 
  Monitor, 
  Clock, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface Session {
  session_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_seen: string;
  is_current: boolean;
  location?: string;
  device_type?: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChange = () => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChanging, setIsChanging] = useState(false);
  const { user } = useAuth();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PasswordChangeForm>();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: PasswordChangeForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non coincidono",
        variant: "destructive",
      });
      return;
    }

    setIsChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password modificata",
        description: "La tua password è stata aggiornata con successo",
      });
      reset();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile modificare la password",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Key className="h-4 w-4 mr-2" />
          Cambia Password
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cambia Password
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Attuale</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                {...register("currentPassword", { required: "Password attuale richiesta" })}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nuova Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                {...register("newPassword", { 
                  required: "Nuova password richiesta",
                  minLength: { value: 8, message: "La password deve essere di almeno 8 caratteri" }
                })}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                {...register("confirmPassword", { required: "Conferma password richiesta" })}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isChanging} className="flex-1">
              {isChanging ? "Aggiornamento..." : "Aggiorna Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TwoFactorAuth = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    // Check if 2FA is already enabled
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    // Mock check - in real implementation, check user's 2FA status from database
    setTwoFactorEnabled(false);
  };

  const setupTwoFactor = async () => {
    try {
      // Mock 2FA setup - in real implementation, generate secret and QR code
      const mockSecret = "JBSWY3DPEHPK3PXP";
      const mockQrUrl = `otpauth://totp/${user?.email}?secret=${mockSecret}&issuer=MalatiDelloSport`;
      
      setSecret(mockSecret);
      setQrCodeUrl(mockQrUrl);
      setShowSetup(true);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile configurare 2FA",
        variant: "destructive",
      });
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Errore",
        description: "Inserisci un codice a 6 cifre",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock verification - in real implementation, verify the TOTP code
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setVerificationCode("");
      
      toast({
        title: "2FA Abilitato",
        description: "L'autenticazione a due fattori è stata attivata",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Codice di verifica non valido",
        variant: "destructive",
      });
    }
  };

  const disableTwoFactor = async () => {
    try {
      setTwoFactorEnabled(false);
      toast({
        title: "2FA Disabilitato",
        description: "L'autenticazione a due fattori è stata disattivata",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile disabilitare 2FA",
        variant: "destructive",
      });
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copiato",
      description: "Chiave segreta copiata negli appunti",
    });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Autenticazione a Due Fattori (2FA)
        </CardTitle>
        <CardDescription>
          Aggiungi un livello di sicurezza extra al tuo account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="2fa-toggle">Abilita 2FA</Label>
            <p className="text-sm text-muted-foreground">
              Usa un'app authenticator per generare codici di sicurezza
            </p>
          </div>
          <div className="flex items-center gap-2">
            {twoFactorEnabled && (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Attivo
              </Badge>
            )}
            <Switch
              id="2fa-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  setupTwoFactor();
                } else {
                  disableTwoFactor();
                }
              }}
            />
          </div>
        </div>
        
        {!twoFactorEnabled && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Sicurezza a rischio</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Il tuo account non ha l'autenticazione a due fattori abilitata
            </p>
          </div>
        )}

        {showSetup && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Configura 2FA</CardTitle>
              <CardDescription>
                Scansiona il QR code con la tua app authenticator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <QrCode className="h-32 w-32 text-black" />
                </div>
                
                <div className="w-full">
                  <Label>Chiave segreta (manuale)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={secret} readOnly className="font-mono text-sm" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copySecret}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="w-full">
                  <Label htmlFor="verification">Codice di verifica</Label>
                  <Input
                    id="verification"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="text-center font-mono text-lg tracking-widest"
                  />
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowSetup(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={verifyAndEnable}
                    disabled={verificationCode.length !== 6}
                    className="flex-1"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Verifica e Attiva
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

const SessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Mock data - in real implementation, fetch from user_sessions table
      const mockSessions: Session[] = [
        {
          session_id: 'current',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          is_current: true,
          location: 'Milano, Italia',
          device_type: 'Chrome su Windows'
        },
        {
          session_id: 'mobile',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          last_seen: new Date(Date.now() - 3600000).toISOString(),
          is_current: false,
          location: 'Roma, Italia',
          device_type: 'Safari su iPhone'
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Errore caricamento sessioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setSessions(sessions.filter(s => s.session_id !== sessionId));
      toast({
        title: "Sessione revocata",
        description: "La sessione è stata terminata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile revocare la sessione",
        variant: "destructive",
      });
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      setSessions(sessions.filter(s => s.is_current));
      toast({
        title: "Sessioni revocate",
        description: "Tutte le altre sessioni sono state terminate",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile revocare le sessioni",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Sessioni Attive</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Caricamento sessioni...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          Sessioni Attive
        </CardTitle>
        <CardDescription>
          Monitora e gestisci i tuoi accessi attivi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nessuna sessione attiva trovata
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div 
                  key={session.session_id} 
                  className="flex justify-between items-center p-4 border border-border/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device_type}</p>
                        {session.is_current && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sessione Corrente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(session.last_seen).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {session.ip_address}
                      </p>
                    </div>
                  </div>
                  
                  {!session.is_current && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Revoca
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revocare sessione?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione terminerà la sessione e l'utente dovrà effettuare nuovamente l'accesso.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revokeSession(session.session_id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Revoca Sessione
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
            
            {sessions.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Revoca Tutte le Altre Sessioni
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revocare tutte le altre sessioni?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione terminerà tutte le sessioni attive tranne quella corrente. 
                      Dovrai effettuare nuovamente l'accesso su tutti gli altri dispositivi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={revokeAllOtherSessions}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Revoca Tutte
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const AdvancedSecurity = () => {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Gestione Password
          </CardTitle>
          <CardDescription>
            Mantieni la tua password sicura e aggiornata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChange />
        </CardContent>
      </Card>

      <TwoFactorAuth />
      <SessionManager />
    </div>
  );
};
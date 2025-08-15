import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Clock, 
  MapPin, 
  Monitor,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<any>;
  status: 'active' | 'warning' | 'inactive';
}

const TwoFactorSection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Autenticazione a Due Fattori
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
          <Switch
            id="2fa-toggle"
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
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

        <Button 
          className="w-full" 
          variant={twoFactorEnabled ? "outline" : "default"}
          disabled={!twoFactorEnabled}
        >
          <Smartphone className="h-4 w-4 mr-2" />
          {twoFactorEnabled ? "Gestisci 2FA" : "Configura 2FA"}
        </Button>
      </CardContent>
    </Card>
  );
};

const PasswordManager = () => {
  const [lastPasswordChange, setLastPasswordChange] = useState<Date | null>(null);
  
  return (
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
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Ultima modifica</p>
            <p className="text-sm text-muted-foreground">
              {lastPasswordChange 
                ? lastPasswordChange.toLocaleDateString('it-IT')
                : "Mai modificata"
              }
            </p>
          </div>
          <Badge variant={lastPasswordChange ? "default" : "destructive"}>
            {lastPasswordChange ? "Recente" : "Obsoleta"}
          </Badge>
        </div>
        
        <Button className="w-full" variant="outline">
          <Key className="h-4 w-4 mr-2" />
          Cambia Password
        </Button>
      </CardContent>
    </Card>
  );
};

interface Session {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
}

const SessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map database sessions to component format
        const mappedSessions: Session[] = data.map(session => ({
          id: session.session_id,
          device: session.user_agent || 'Dispositivo sconosciuto',
          location: 'Posizione non disponibile',
          ip_address: session.ip_address?.toString() || '0.0.0.0',
          created_at: session.created_at,
          last_activity: session.last_seen,
          is_current: session.session_id === getCurrentSessionId(),
        }));
        setSessions(mappedSessions);
      } else {
        // Fallback to mock data if no sessions found
        const mockSessions: Session[] = [
          {
            id: '1',
            device: 'Chrome su Windows',
            location: 'Milano, Italia',
            ip_address: '192.168.1.1',
            created_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            is_current: true
          },
          {
            id: '2',
            device: 'Safari su iPhone',
            location: 'Roma, Italia',
            ip_address: '192.168.1.2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_activity: new Date(Date.now() - 3600000).toISOString(),
            is_current: false
          }
        ];

        setSessions(mockSessions);
      }
    } catch (error) {
      console.error('Errore caricamento sessioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSessionId = () => {
    // Simple session ID generation - in real app this would come from auth
    return 'current-session';
  };

  const revokeSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== sessionId));
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
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nessuna sessione attiva trovata
          </p>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id} 
              className="flex justify-between items-center p-3 border border-border/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{session.device}</p>
                    {session.is_current && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Corrente
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(session.last_activity).toLocaleString('it-IT')}
                    </span>
                  </div>
                </div>
              </div>
              
              {!session.is_current && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                >
                  Revoca
                </Button>
              )}
            </div>
          ))
        )}
        
        {sessions.length > 1 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              sessions
                .filter(s => !s.is_current)
                .forEach(s => revokeSession(s.id));
            }}
          >
            Revoca Tutte le Altre Sessioni
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const SecurityDashboard = () => {
  return (
    <div className="space-y-6">
      <TwoFactorSection />
      <PasswordManager />
      <SessionManager />
    </div>
  );
};
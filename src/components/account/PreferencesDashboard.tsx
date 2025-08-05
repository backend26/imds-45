import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Globe, 
  Volume2, 
  Bell,
  Eye,
  Shield,
  Download,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'it' | 'en';
  notifications_email: boolean;
  notifications_push: boolean;
  sound_effects: boolean;
  data_sharing: boolean;
  marketing_emails: boolean;
  privacy_level: 'public' | 'friends' | 'private';
}

const ThemeSection = ({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (key: keyof UserPreferences, value: any) => void;
}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Aspetto e Tema
        </CardTitle>
        <CardDescription>
          Personalizza l'aspetto dell'interfaccia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tema</Label>
          <Select 
            value={preferences.theme} 
            onValueChange={(value) => onUpdate('theme', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Chiaro</SelectItem>
              <SelectItem value="dark">Scuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Lingua</Label>
          <Select 
            value={preferences.language} 
            onValueChange={(value) => onUpdate('language', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">🇮🇹 Italiano</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sound-effects">Effetti Sonori</Label>
            <p className="text-sm text-muted-foreground">
              Abilita suoni per notifiche e interazioni
            </p>
          </div>
          <Switch
            id="sound-effects"
            checked={preferences.sound_effects}
            onCheckedChange={(checked) => onUpdate('sound_effects', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationsSection = ({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (key: keyof UserPreferences, value: any) => void;
}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifiche
        </CardTitle>
        <CardDescription>
          Controlla come e quando ricevere notifiche
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Notifiche Email</Label>
            <p className="text-sm text-muted-foreground">
              Ricevi notifiche importanti via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.notifications_email}
            onCheckedChange={(checked) => onUpdate('notifications_email', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Notifiche Push</Label>
            <p className="text-sm text-muted-foreground">
              Ricevi notifiche in tempo reale nel browser
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.notifications_push}
            onCheckedChange={(checked) => onUpdate('notifications_push', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-emails">Email Marketing</Label>
            <p className="text-sm text-muted-foreground">
              Ricevi news, aggiornamenti e offerte speciali
            </p>
          </div>
          <Switch
            id="marketing-emails"
            checked={preferences.marketing_emails}
            onCheckedChange={(checked) => onUpdate('marketing_emails', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const PrivacySection = ({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (key: keyof UserPreferences, value: any) => void;
}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy e Sicurezza
        </CardTitle>
        <CardDescription>
          Gestisci la visibilità del tuo profilo e dei tuoi dati
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Livello Privacy Profilo</Label>
          <Select 
            value={preferences.privacy_level} 
            onValueChange={(value) => onUpdate('privacy_level', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pubblico
                </div>
              </SelectItem>
              <SelectItem value="friends">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Solo Amici
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privato
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="data-sharing">Condivisione Dati Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Aiuta a migliorare il servizio condividendo dati anonimi
            </p>
          </div>
          <Switch
            id="data-sharing"
            checked={preferences.data_sharing}
            onCheckedChange={(checked) => onUpdate('data_sharing', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const DataManagementSection = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { user } = useAuth();

  const exportData = async () => {
    setIsExporting(true);
    try {
      // TODO: Implementare export dati
      toast({
        title: "Export avviato",
        description: "Riceverai un'email con i tuoi dati entro 24 ore",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare l'export dei dati",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Gestione Dati
        </CardTitle>
        <CardDescription>
          Esporta o elimina i tuoi dati personali
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Esporta i Tuoi Dati</h4>
              <p className="text-sm text-muted-foreground">
                Scarica una copia completa dei tuoi dati
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={exportData}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Esportando...' : 'Esporta'}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
          <div>
            <h4 className="font-medium text-destructive">Zona Pericolosa</h4>
            <p className="text-sm text-muted-foreground">
              Azioni irreversibili che elimineranno il tuo account
            </p>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeletingAccount(true)}
            disabled={isDeletingAccount}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const PreferencesDashboard = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'it',
    notifications_email: true,
    notifications_push: true,
    sound_effects: true,
    data_sharing: false,
    marketing_emails: false,
    privacy_level: 'public',
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // TODO: Implementare quando la tabella user_preferences sarà creata
      // const { data, error } = await supabase
      //   .from('user_preferences')
      //   .select('*')
      //   .eq('user_id', user?.id)
      //   .single();

      // Per ora usiamo le preferenze di default
      // Se esistessero i dati li caricheremmo dal database
    } catch (error) {
      console.error('Errore caricamento preferenze:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      // TODO: Implementare quando la tabella user_preferences sarà creata
      // const { error } = await supabase
      //   .from('user_preferences')
      //   .upsert({
      //     user_id: user?.id,
      //     ...newPreferences,
      //   });

      // Simulazione salvataggio
      localStorage.setItem(`user_preferences_${user?.id}`, JSON.stringify(newPreferences));

      toast({
        title: "Preferenze aggiornate",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      console.error('Errore aggiornamento preferenze:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le preferenze",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center">Caricamento preferenze...</div>;
  }

  return (
    <div className="space-y-6">
      <ThemeSection preferences={preferences} onUpdate={updatePreference} />
      <NotificationsSection preferences={preferences} onUpdate={updatePreference} />
      <PrivacySection preferences={preferences} onUpdate={updatePreference} />
      <DataManagementSection />
    </div>
  );
};
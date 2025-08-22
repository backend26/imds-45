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
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    marketing: boolean;
    digest_frequency: string;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: 'it' | 'en';
    font_size: 'small' | 'medium' | 'large';
    reduce_motion: boolean;
  };
  privacy: {
    public_profile: boolean;
    show_activity: boolean;
    show_reading_history: boolean;
    analytics_consent: boolean;
  };
  reading: {
    auto_play_videos: boolean;
    show_related_articles: boolean;
    preferred_sports: string[];
  };
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
            value={preferences.display.theme} 
            onValueChange={(value) => onUpdate('display', { ...preferences.display, theme: value })}
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
            value={preferences.display.language} 
            onValueChange={(value) => onUpdate('display', { ...preferences.display, language: value })}
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

        <div className="space-y-2">
          <Label>Dimensione Font</Label>
          <Select 
            value={preferences.display.font_size} 
            onValueChange={(value) => onUpdate('display', { ...preferences.display, font_size: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Piccolo</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reduce-motion">Riduci Animazioni</Label>
            <p className="text-sm text-muted-foreground">
              Riduce le animazioni per una migliore accessibilità
            </p>
          </div>
          <Switch
            id="reduce-motion"
            checked={preferences.display.reduce_motion}
            onCheckedChange={(checked) => onUpdate('display', { ...preferences.display, reduce_motion: checked })}
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
            checked={preferences.notifications.email}
            onCheckedChange={(checked) => onUpdate('notifications', { ...preferences.notifications, email: checked })}
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
            checked={preferences.notifications.push}
            onCheckedChange={(checked) => onUpdate('notifications', { ...preferences.notifications, push: checked })}
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
            checked={preferences.notifications.marketing}
            onCheckedChange={(checked) => onUpdate('notifications', { ...preferences.notifications, marketing: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label>Frequenza Digest Email</Label>
          <Select 
            value={preferences.notifications.digest_frequency} 
            onValueChange={(value) => onUpdate('notifications', { ...preferences.notifications, digest_frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Giornaliero</SelectItem>
              <SelectItem value="weekly">Settimanale</SelectItem>
              <SelectItem value="monthly">Mensile</SelectItem>
              <SelectItem value="never">Mai</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="public-profile">Profilo Pubblico</Label>
            <p className="text-sm text-muted-foreground">
              Rendi il tuo profilo visibile agli altri utenti
            </p>
          </div>
          <Switch
            id="public-profile"
            checked={preferences.privacy.public_profile}
            onCheckedChange={(checked) => onUpdate('privacy', { ...preferences.privacy, public_profile: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-activity">Mostra Attività</Label>
            <p className="text-sm text-muted-foreground">
              Permetti ad altri di vedere la tua attività recente
            </p>
          </div>
          <Switch
            id="show-activity"
            checked={preferences.privacy.show_activity}
            onCheckedChange={(checked) => onUpdate('privacy', { ...preferences.privacy, show_activity: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics-consent">Consenso Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Aiuta a migliorare il servizio condividendo dati anonimi
            </p>
          </div>
          <Switch
            id="analytics-consent"
            checked={preferences.privacy.analytics_consent}
            onCheckedChange={(checked) => onUpdate('privacy', { ...preferences.privacy, analytics_consent: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ReadingSection = ({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (key: keyof UserPreferences, value: any) => void;
}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Preferenze di Lettura
        </CardTitle>
        <CardDescription>
          Personalizza la tua esperienza di lettura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-play-videos">Autoplay Video</Label>
            <p className="text-sm text-muted-foreground">
              Avvia automaticamente la riproduzione dei video
            </p>
          </div>
          <Switch
            id="auto-play-videos"
            checked={preferences.reading.auto_play_videos}
            onCheckedChange={(checked) => onUpdate('reading', { ...preferences.reading, auto_play_videos: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="related-articles">Articoli Correlati</Label>
            <p className="text-sm text-muted-foreground">
              Mostra suggerimenti di articoli correlati
            </p>
          </div>
          <Switch
            id="related-articles"
            checked={preferences.reading.show_related_articles}
            onCheckedChange={(checked) => onUpdate('reading', { ...preferences.reading, show_related_articles: checked })}
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
    if (!user?.id) return;
    
    setIsExporting(true);
    try {
      // Create data export request
      const { error } = await supabase
        .from('data_exports')
        .insert({
          user_id: user.id,
          export_type: 'full',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Export avviato",
        description: "Riceverai un'email con i tuoi dati entro 24 ore",
      });
    } catch (error) {
      console.error('Error creating export request:', error);
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
    notifications: {
      email: true,
      push: true,
      desktop: true,
      marketing: false,
      digest_frequency: 'weekly',
    },
    display: {
      theme: 'system',
      language: 'it',
      font_size: 'medium',
      reduce_motion: false,
    },
    privacy: {
      public_profile: true,
      show_activity: false,
      show_reading_history: false,
      analytics_consent: false,
    },
    reading: {
      auto_play_videos: false,
      show_related_articles: true,
      preferred_sports: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Map database preferences to component state
        setPreferences({
          notifications: (data.notification_settings as any) || preferences.notifications,
          display: (data.display_settings as any) || preferences.display,
          privacy: (data.privacy_settings as any) || preferences.privacy,
          reading: (data.reading_preferences as any) || preferences.reading,
        });
      }
    } catch (error) {
      console.error('Errore caricamento preferenze:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    if (!user?.id) return;

    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      // Map component preferences to database format
      const dbData = {
        user_id: user.id,
        notification_settings: newPreferences.notifications,
        display_settings: newPreferences.display,
        privacy_settings: newPreferences.privacy,
        reading_preferences: newPreferences.reading,
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(dbData, { onConflict: 'user_id' });

      if (error) throw error;

      // Backup to localStorage
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(newPreferences));

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
      <ReadingSection preferences={preferences} onUpdate={updatePreference} />
      <DataManagementSection />
    </div>
  );
};
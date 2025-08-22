import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, Users, Globe, Mail } from 'lucide-react';

interface PrivacySettingsData {
  profile_visible: boolean;
  email_visible: boolean;
  location_visible: boolean;
  birth_date_visible: boolean;
  posts_visible: boolean;
  activity_visible: boolean;
  allow_messages: boolean;
}

interface PrivacySettingsProps {
  onError: (error: any) => void;
}

export const PrivacySettings = ({ onError }: PrivacySettingsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettingsData>({
    profile_visible: true,
    email_visible: false,
    location_visible: true,
    birth_date_visible: false,
    posts_visible: true,
    activity_visible: true,
    allow_messages: true,
  });

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data?.privacy_settings && typeof data.privacy_settings === 'object') {
        setSettings({ ...settings, ...data.privacy_settings } as PrivacySettingsData);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleSettingUpdate = async (key: keyof PrivacySettingsData, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          privacy_settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({
        title: "Impostazioni aggiornate",
        description: "Le tue preferenze privacy sono state salvate."
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      onError(error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibilità Profilo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Controlla cosa possono vedere gli altri utenti del tuo profilo
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Profilo pubblico</Label>
              <p className="text-sm text-muted-foreground">
                Consenti ad altri di vedere il tuo profilo
              </p>
            </div>
            <Switch
              checked={settings.profile_visible}
              onCheckedChange={(checked) => handleSettingUpdate('profile_visible', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Email visibile</Label>
              <p className="text-sm text-muted-foreground">
                Mostra la tua email nel profilo pubblico
              </p>
            </div>
            <Switch
              checked={settings.email_visible}
              onCheckedChange={(checked) => handleSettingUpdate('email_visible', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Posizione visibile</Label>
              <p className="text-sm text-muted-foreground">
                Mostra la tua posizione nel profilo
              </p>
            </div>
            <Switch
              checked={settings.location_visible}
              onCheckedChange={(checked) => handleSettingUpdate('location_visible', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Data di nascita visibile</Label>
              <p className="text-sm text-muted-foreground">
                Mostra la tua data di nascita
              </p>
            </div>
            <Switch
              checked={settings.birth_date_visible}
              onCheckedChange={(checked) => handleSettingUpdate('birth_date_visible', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Visibilità Contenuti
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestisci la visibilità dei tuoi contenuti e attività
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Post pubblici</Label>
              <p className="text-sm text-muted-foreground">
                Consenti ad altri di vedere i tuoi articoli
              </p>
            </div>
            <Switch
              checked={settings.posts_visible}
              onCheckedChange={(checked) => handleSettingUpdate('posts_visible', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Attività visibile</Label>
              <p className="text-sm text-muted-foreground">
                Mostra i tuoi like e commenti agli altri
              </p>
            </div>
            <Switch
              checked={settings.activity_visible}
              onCheckedChange={(checked) => handleSettingUpdate('activity_visible', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Comunicazioni
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Controlla come gli altri possono contattarti
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Messaggi diretti</Label>
              <p className="text-sm text-muted-foreground">
                Consenti ad altri utenti di inviarti messaggi privati
              </p>
            </div>
            <Switch
              checked={settings.allow_messages}
              onCheckedChange={(checked) => handleSettingUpdate('allow_messages', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
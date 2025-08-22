import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Users, Mail, Bell, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  profile_visible: boolean;
  email_visible: boolean;
  location_visible: boolean;
  birth_date_visible: boolean;
  favorite_team_visible: boolean;
  social_links_visible: boolean;
  posts_visible: boolean;
  comments_visible: boolean;
  likes_visible: boolean;
  allow_contact: boolean;
  allow_mentions: boolean;
  show_online_status: boolean;
  search_indexing: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  profile_visible: true,
  email_visible: false,
  location_visible: true,
  birth_date_visible: false,
  favorite_team_visible: true,
  social_links_visible: true,
  posts_visible: true,
  comments_visible: true,
  likes_visible: true,
  allow_contact: true,
  allow_mentions: true,
  show_online_status: true,
  search_indexing: true,
};

interface Props {
  onError: (error: Error) => void;
}

export const PrivacySettingsForm = ({ onError }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('privacy_settings')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data?.privacy_settings && typeof data.privacy_settings === 'object') {
          setSettings({ ...DEFAULT_SETTINGS, ...data.privacy_settings } as PrivacySettings);
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        onError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user, onError]);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          privacy_settings: settings as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Impostazioni salvate",
        description: "Le tue preferenze di privacy sono state aggiornate"
      });

    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Caricamento impostazioni...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibilità Profilo
          </CardTitle>
          <CardDescription>
            Controlla quali informazioni del tuo profilo sono visibili agli altri utenti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile_visible">Profilo pubblico</Label>
                <p className="text-sm text-muted-foreground">
                  Rendi il tuo profilo visibile a tutti gli utenti
                </p>
              </div>
              <Switch
                id="profile_visible"
                checked={settings.profile_visible}
                onCheckedChange={(checked) => updateSetting('profile_visible', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_visible">Email visibile</Label>
                <p className="text-sm text-muted-foreground">
                  Mostra la tua email sul profilo pubblico
                </p>
              </div>
              <Switch
                id="email_visible"
                checked={settings.email_visible}
                onCheckedChange={(checked) => updateSetting('email_visible', checked)}
                disabled={isSaving || !settings.profile_visible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="location_visible">Posizione visibile</Label>
                <p className="text-sm text-muted-foreground">
                  Mostra la tua posizione sul profilo
                </p>
              </div>
              <Switch
                id="location_visible"
                checked={settings.location_visible}
                onCheckedChange={(checked) => updateSetting('location_visible', checked)}
                disabled={isSaving || !settings.profile_visible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="birth_date_visible">Data di nascita visibile</Label>
                <p className="text-sm text-muted-foreground">
                  Mostra la tua data di nascita (solo mese e giorno)
                </p>
              </div>
              <Switch
                id="birth_date_visible"
                checked={settings.birth_date_visible}
                onCheckedChange={(checked) => updateSetting('birth_date_visible', checked)}
                disabled={isSaving || !settings.profile_visible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="favorite_team_visible">Squadra del cuore visibile</Label>
                <p className="text-sm text-muted-foreground">
                  Mostra la tua squadra preferita
                </p>
              </div>
              <Switch
                id="favorite_team_visible"
                checked={settings.favorite_team_visible}
                onCheckedChange={(checked) => updateSetting('favorite_team_visible', checked)}
                disabled={isSaving || !settings.profile_visible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="social_links_visible">Link social visibili</Label>
                <p className="text-sm text-muted-foreground">
                  Mostra i tuoi profili social
                </p>
              </div>
              <Switch
                id="social_links_visible"
                checked={settings.social_links_visible}
                onCheckedChange={(checked) => updateSetting('social_links_visible', checked)}
                disabled={isSaving || !settings.profile_visible}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visibilità Contenuti
          </CardTitle>
          <CardDescription>
            Gestisci la visibilità dei tuoi contenuti e attività
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="posts_visible">Articoli visibili</Label>
              <p className="text-sm text-muted-foreground">
                Permetti ad altri di vedere i tuoi articoli
              </p>
            </div>
            <Switch
              id="posts_visible"
              checked={settings.posts_visible}
              onCheckedChange={(checked) => updateSetting('posts_visible', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments_visible">Commenti visibili</Label>
              <p className="text-sm text-muted-foreground">
                Mostra i tuoi commenti ad altri utenti
              </p>
            </div>
            <Switch
              id="comments_visible"
              checked={settings.comments_visible}
              onCheckedChange={(checked) => updateSetting('comments_visible', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="likes_visible">Mi piace visibili</Label>
              <p className="text-sm text-muted-foreground">
                Mostra cosa hai apprezzato
              </p>
            </div>
            <Switch
              id="likes_visible"
              checked={settings.likes_visible}
              onCheckedChange={(checked) => updateSetting('likes_visible', checked)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Comunicazione
          </CardTitle>
          <CardDescription>
            Gestisci come altri utenti possono interagire con te
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_contact">Permetti contatti</Label>
              <p className="text-sm text-muted-foreground">
                Altri utenti possono inviarti messaggi
              </p>
            </div>
            <Switch
              id="allow_contact"
              checked={settings.allow_contact}
              onCheckedChange={(checked) => updateSetting('allow_contact', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_mentions">Permetti menzioni</Label>
              <p className="text-sm text-muted-foreground">
                Altri possono menzionarti nei commenti
              </p>
            </div>
            <Switch
              id="allow_mentions"
              checked={settings.allow_mentions}
              onCheckedChange={(checked) => updateSetting('allow_mentions', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_online_status">Stato online</Label>
              <p className="text-sm text-muted-foreground">
                Mostra quando sei online
              </p>
            </div>
            <Switch
              id="show_online_status"
              checked={settings.show_online_status}
              onCheckedChange={(checked) => updateSetting('show_online_status', checked)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search & Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ricerca e Scoperta
          </CardTitle>
          <CardDescription>
            Controlla come il tuo profilo appare nelle ricerche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="search_indexing">Indicizzazione ricerca</Label>
              <p className="text-sm text-muted-foreground">
                Permetti che il tuo profilo appaia nei risultati di ricerca
              </p>
            </div>
            <Switch
              id="search_indexing"
              checked={settings.search_indexing}
              onCheckedChange={(checked) => updateSetting('search_indexing', checked)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <form onSubmit={handleSave}>
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isSaving}
            className="min-w-[150px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salva Impostazioni'}
          </Button>
        </div>
      </form>
    </div>
  );
};
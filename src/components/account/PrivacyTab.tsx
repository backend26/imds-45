import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PrivacyTabProps {
  onError: (error: Error) => void;
}

interface PrivacySettings {
  email: boolean;
  birth_date: boolean;
  location: boolean;
  activity: boolean;
  posts: boolean;
  likes: boolean;
  bookmarks: boolean;
}

export const PrivacyTab = ({ onError }: PrivacyTabProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    email: false,
    birth_date: false,
    location: false,
    activity: true,
    posts: true,
    likes: false,
    bookmarks: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (profileData) {
          setProfile(profileData);
          const settings = (profileData as any).privacy_settings || {};
          setPrivacySettings({
            email: settings.email || false,
            birth_date: settings.birth_date || false,
            location: settings.location || false,
            activity: settings.activity !== false, // default true
            posts: settings.posts !== false, // default true
            likes: settings.likes || false,
            bookmarks: settings.bookmarks || false
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        onError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, onError]);

  const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
    if (!user) return;

    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          privacy_settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Impostazioni aggiornate",
        description: "Le tue preferenze sulla privacy sono state salvate.",
      });

    } catch (error) {
      console.error('Error updating privacy settings:', error);
      onError(error as Error);
      // Revert the change
      setPrivacySettings(privacySettings);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Caricamento impostazioni...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Controllo Privacy
          </CardTitle>
          <CardDescription>
            Gestisci quali informazioni mostrare sul tuo profilo pubblico /@{profile?.username}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Informazioni Personali */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Informazioni Personali</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Indirizzo Email</Label>
                <p className="text-sm text-muted-foreground">Mostra la tua email sul profilo pubblico</p>
              </div>
              <Switch
                checked={privacySettings.email}
                onCheckedChange={(checked) => updatePrivacySetting('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Data di Nascita</Label>
                <p className="text-sm text-muted-foreground">Mostra la tua data di nascita</p>
              </div>
              <Switch
                checked={privacySettings.birth_date}
                onCheckedChange={(checked) => updatePrivacySetting('birth_date', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Posizione</Label>
                <p className="text-sm text-muted-foreground">Mostra dove ti trovi</p>
              </div>
              <Switch
                checked={privacySettings.location}
                onCheckedChange={(checked) => updatePrivacySetting('location', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Contenuti e Attività */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Contenuti e Attività</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">I Miei Articoli</Label>
                <p className="text-sm text-muted-foreground">Mostra gli articoli che hai scritto</p>
              </div>
              <Switch
                checked={privacySettings.posts}
                onCheckedChange={(checked) => updatePrivacySetting('posts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Attività Recente</Label>
                <p className="text-sm text-muted-foreground">Mostra quando sei stato attivo</p>
              </div>
              <Switch
                checked={privacySettings.activity}
                onCheckedChange={(checked) => updatePrivacySetting('activity', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Articoli Piaciuti</Label>
                <p className="text-sm text-muted-foreground">Mostra gli articoli a cui hai messo like</p>
              </div>
              <Switch
                checked={privacySettings.likes}
                onCheckedChange={(checked) => updatePrivacySetting('likes', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Articoli Salvati</Label>
                <p className="text-sm text-muted-foreground">Mostra gli articoli che hai salvato</p>
              </div>
              <Switch
                checked={privacySettings.bookmarks}
                onCheckedChange={(checked) => updatePrivacySetting('bookmarks', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Informazioni */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Come funziona</h4>
                <p className="text-sm text-muted-foreground">
                  Le impostazioni che attivi qui determineranno quali informazioni sono visibili sul tuo profilo pubblico.
                  Puoi modificare queste impostazioni in qualsiasi momento.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
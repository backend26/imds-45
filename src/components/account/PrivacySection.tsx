import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Users, FileText, Heart, Bookmark, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  public_profile: boolean;
  email: boolean;
  birth_date: boolean;
  location: boolean;
  activity: boolean;
  posts: boolean;
  likes: boolean;
  bookmarks: boolean;
}

export const PrivacySection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    public_profile: true,
    email: false,
    birth_date: false,
    location: false,
    activity: true,
    posts: true,
    likes: false,
    bookmarks: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.privacy_settings) {
        const privacy = data.privacy_settings as any;
        setSettings({
          public_profile: privacy.public_profile !== false,
          email: privacy.email === true,
          birth_date: privacy.birth_date === true,
          location: privacy.location === true,
          activity: privacy.activity !== false,
          posts: privacy.posts !== false,
          likes: privacy.likes === true,
          bookmarks: privacy.bookmarks === true
        });
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni privacy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacySettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
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
        description: "Le tue preferenze privacy sono state aggiornate"
      });
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare le impostazioni",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const privacyOptions = [
    {
      key: 'public_profile' as keyof PrivacySettings,
      title: 'Profilo Pubblico',
      description: 'Il tuo profilo è visibile a tutti gli utenti',
      icon: settings.public_profile ? Eye : EyeOff,
      important: true
    },
    {
      key: 'posts' as keyof PrivacySettings,
      title: 'Mostra i Tuoi Post',
      description: 'I tuoi articoli sono visibili nel profilo pubblico',
      icon: FileText
    },
    {
      key: 'activity' as keyof PrivacySettings,
      title: 'Attività Pubblica',
      description: 'Le tue interazioni sono visibili agli altri',
      icon: Users
    },
    {
      key: 'email' as keyof PrivacySettings,
      title: 'Email Visibile',
      description: 'La tua email è visibile nel profilo pubblico',
      icon: Eye
    },
    {
      key: 'location' as keyof PrivacySettings,
      title: 'Posizione Visibile',
      description: 'La tua posizione è visibile nel profilo pubblico',
      icon: Eye
    },
    {
      key: 'birth_date' as keyof PrivacySettings,
      title: 'Data di Nascita Visibile',
      description: 'La tua data di nascita è visibile nel profilo pubblico',
      icon: Eye
    },
    {
      key: 'likes' as keyof PrivacySettings,
      title: 'Like Visibili',
      description: 'I tuoi like sono visibili agli altri utenti',
      icon: Heart
    },
    {
      key: 'bookmarks' as keyof PrivacySettings,
      title: 'Preferiti Visibili',
      description: 'I tuoi articoli salvati sono visibili agli altri',
      icon: Bookmark
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Controlla quali informazioni del tuo profilo sono visibili agli altri utenti.
      </div>

      <div className="space-y-4">
        {privacyOptions.map((option) => {
          const IconComponent = option.icon;
          const isEnabled = settings[option.key];
          
          return (
            <Card key={option.key} className={option.important ? 'border-primary/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isEnabled 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <Label htmlFor={option.key} className="font-medium cursor-pointer">
                        {option.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={option.key}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(option.key)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profile Link Preview */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Anteprima Profilo Pubblico</CardTitle>
          <CardDescription>
            Questo è come appare il tuo profilo agli altri utenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <span className={settings.public_profile ? 'text-green-600' : 'text-orange-600'}>
              {settings.public_profile ? '🟢 Profilo pubblico attivo' : '🟠 Profilo privato'}
            </span>
          </div>
          {settings.public_profile && (
            <div className="mt-2 text-xs text-muted-foreground">
              Visibile su: <code className="bg-background px-1 py-0.5 rounded">
                {window.location.origin}/@username
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salva Impostazioni Privacy
          </>
        )}
      </Button>
    </div>
  );
};
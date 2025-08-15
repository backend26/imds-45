import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Edit3, ExternalLink } from 'lucide-react';
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PublicProfileTabProps {
  onError: (error: Error) => void;
}

export const PublicProfileTab = ({ onError }: PublicProfileTabProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    website: '',
    twitter: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    facebook: '',
    linkedin: ''
  });
  const [preferredSports, setPreferredSports] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (profileData) {
          setProfile(profileData);
          setUsername(profileData.username || '');
          setDisplayName((profileData as any).display_name || '');
          setBio(profileData.bio || '');
          setLocation(profileData.location || '');
          setBirthDate(profileData.birth_date ? new Date(profileData.birth_date) : undefined);
          setFavoriteTeam((profileData as any).favorite_team || '');
          setSocialLinks((profileData as any).social_links || {
            website: '',
            twitter: '',
            instagram: '',
            youtube: '',
            tiktok: '',
            facebook: '',
            linkedin: ''
          });
          setPreferredSports(profileData.preferred_sports || []);
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

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username.toLowerCase().trim() || null,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          location: location.trim() || null,
          birth_date: birthDate?.toISOString().split('T')[0] || null,
          favorite_team: favoriteTeam.trim() || null,
          social_links: socialLinks,
          preferred_sports: preferredSports,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state aggiornate con successo",
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      onError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Caricamento profilo...</p>
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
            <Edit3 className="h-5 w-5" />
            Informazioni Pubbliche
          </CardTitle>
          <CardDescription>
            Queste informazioni saranno visibili sul tuo profilo pubblico secondo le tue impostazioni di privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username (@nomeutente)</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="mario_123"
              disabled={isSaving}
            />
            <p className="text-sm text-muted-foreground">
              Solo lettere minuscole, numeri e underscore. Questo sarà il tuo URL unico.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nome Visualizzato</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Mario Rossi"
              disabled={isSaving}
            />
            <p className="text-sm text-muted-foreground">
              Il nome che apparirà sui tuoi contenuti e profilo pubblico.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Racconta qualcosa di te..."
              disabled={isSaving}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Posizione</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Milano, Italia"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>Data di Nascita</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                  disabled={isSaving}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? (
                    format(birthDate, "dd MMMM yyyy", { locale: it })
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="favoriteTeam">Squadra del Cuore</Label>
            <Input
              id="favoriteTeam"
              type="text"
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              placeholder="Juventus, Milan, Inter..."
              disabled={isSaving}
            />
          </div>

          <div className="space-y-4">
            <Label>Link Social</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={platform} className="text-sm font-medium capitalize">
                    {platform === 'website' ? 'Sito Web' : platform}
                  </Label>
                  <Input
                    id={platform}
                    type="url"
                    value={url}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))}
                    placeholder={`https://${platform === 'website' ? 'tuosito.com' : `${platform}.com/username`}`}
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sport Seguiti</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Calcio', 'Tennis', 'Formula 1', 'NBA', 'NFL', 'Basket', 'Pallavolo', 'Rugby'].map((sport) => (
                <label key={sport} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferredSports.includes(sport)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferredSports(prev => [...prev, sport]);
                      } else {
                        setPreferredSports(prev => prev.filter(s => s !== sport));
                      }
                    }}
                    className="rounded border-input"
                    disabled={isSaving}
                  />
                  <span className="text-sm">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salva Modifiche'}
            </Button>
            
            {profile?.username && (
              <Button 
                variant="outline" 
                asChild
                disabled={isSaving}
              >
                <Link to={`/@${profile.username}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Vedi Profilo
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
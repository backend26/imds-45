import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Save, User, Globe, Heart, MapPin } from 'lucide-react';
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Props {
  onError: (error: Error) => void;
  onProfileUpdate?: () => void;
}

interface SocialLinks {
  website: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
}

const SPORTS_OPTIONS = [
  'Calcio', 'Tennis', 'Formula 1', 'NBA', 'NFL', 'Basket', 
  'Pallavolo', 'Rugby', 'Hockey', 'Baseball', 'Golf', 'MotoGP'
];

const SOCIAL_PLATFORMS = [
  { key: 'website', label: 'Sito Web', placeholder: 'https://tuosito.com', icon: Globe },
  { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/username', icon: Globe },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: Globe },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username', icon: Globe },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username', icon: Globe },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username', icon: Globe },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: Globe },
] as const;

export const EnhancedProfileForm = ({ onError, onProfileUpdate }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    website: '', twitter: '', instagram: '', youtube: '', 
    tiktok: '', facebook: '', linkedin: ''
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
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{ 
                user_id: user.id,
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
                username: user.user_metadata?.username || user.email?.split('@')[0].toLowerCase() || ''
              }])
              .select()
              .single();
            
            if (createError) throw createError;
            setProfile(newProfile);
            setDisplayName(newProfile.display_name || '');
            setUsername(newProfile.username || '');
          } else {
            throw error;
          }
        } else {
          setProfile(profileData);
          setUsername(profileData.username || '');
          setDisplayName(profileData.display_name || '');
          setBio(profileData.bio || '');
          setLocation(profileData.location || '');
          setBirthDate(profileData.birth_date ? new Date(profileData.birth_date) : undefined);
          setFavoriteTeam(profileData.favorite_team || '');
          
          const socialData = profileData.social_links;
          if (socialData && typeof socialData === 'object') {
            setSocialLinks({ ...socialLinks, ...socialData });
          }
          
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

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Validate username format
      if (username && !/^[a-z0-9_]+$/.test(username)) {
        throw new Error('Username può contenere solo lettere minuscole, numeri e underscore');
      }

      // Validate display name length
      if (displayName.length > 40) {
        throw new Error('Il nome visualizzato deve essere massimo 40 caratteri');
      }

      // Check username uniqueness if changed
      if (username && username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', username)
          .neq('user_id', user.id)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Username già in uso, scegline un altro');
        }
      }

      const updateData = { 
        username: username.toLowerCase().trim() || null,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        birth_date: birthDate?.toISOString().split('T')[0] || null,
        favorite_team: favoriteTeam.trim() || null,
        social_links: socialLinks as any,
        preferred_sports: preferredSports,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id,
          ...updateData
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo"
      });

      onProfileUpdate?.();

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare le modifiche",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSportToggle = (sport: string, checked: boolean) => {
    if (checked) {
      setPreferredSports(prev => [...prev, sport]);
    } else {
      setPreferredSports(prev => prev.filter(s => s !== sport));
    }
  };

  const updateSocialLink = (platform: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Caricamento profilo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informazioni Personali
          </CardTitle>
          <CardDescription>
            Aggiorna le tue informazioni di base e dettagli del profilo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="mario_123"
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Solo lettere minuscole, numeri e underscore
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
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground">
                {displayName.length}/40 caratteri
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Racconta qualcosa di te e della tua passione per lo sport..."
              disabled={isSaving}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500 caratteri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Posizione
              </Label>
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
                  <div className="p-3">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newDate = new Date();
                          newDate.setFullYear(newDate.getFullYear() - 25);
                          setBirthDate(newDate);
                        }}
                      >
                        25 anni fa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newDate = new Date();
                          newDate.setFullYear(newDate.getFullYear() - 35);
                          setBirthDate(newDate);
                        }}
                      >
                        35 anni fa
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1950-01-01")
                      }
                      defaultMonth={birthDate || new Date(new Date().getFullYear() - 25, 0)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      captionLayout="dropdown"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="favoriteTeam" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Squadra del Cuore
            </Label>
            <Input
              id="favoriteTeam"
              type="text"
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              placeholder="Juventus, Milan, Inter, Lakers..."
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sports Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Sport Seguiti</CardTitle>
          <CardDescription>
            Seleziona gli sport che ti interessano di più per contenuti personalizzati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SPORTS_OPTIONS.map((sport) => (
              <div key={sport} className="flex items-center space-x-2">
                <Checkbox
                  id={sport}
                  checked={preferredSports.includes(sport)}
                  onCheckedChange={(checked) => handleSportToggle(sport, checked as boolean)}
                  disabled={isSaving}
                />
                <Label 
                  htmlFor={sport} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {sport}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Link Social
          </CardTitle>
          <CardDescription>
            Collega i tuoi profili social per condividere i tuoi contenuti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium">
                  {label}
                </Label>
                <Input
                  id={key}
                  type="url"
                  value={socialLinks[key as keyof SocialLinks]}
                  onChange={(e) => updateSocialLink(key, e.target.value)}
                  placeholder={placeholder}
                  disabled={isSaving}
                />
              </div>
            ))}
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
            {isSaving ? 'Salvando...' : 'Salva Modifiche'}
          </Button>
        </div>
      </form>
    </div>
  );
};
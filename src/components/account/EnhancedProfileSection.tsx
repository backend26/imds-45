import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { IntelligentBanner } from './IntelligentBanner';
import { AvatarEditor } from './AvatarEditor';
import { 
  User, 
  Calendar as CalendarIcon, 
  MapPin, 
  Save, 
  Loader2, 
  Upload,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Link as LinkIcon,
  Heart,
  Clock,
  Info,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { EnhancedBirthdateSelector } from '@/components/account/EnhancedBirthdateSelector';
import { FavoriteTeamsManager } from '@/components/account/FavoriteTeamsManager';
import { SocialLinksManager } from '@/components/account/SocialLinksManager';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SocialLinks {
  [key: string]: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
}

interface FavoriteTeams {
  [key: string]: string[] | string;
  calcio?: string;
  tennis?: string;
  f1?: string;
  basket?: string;
  nfl?: string;
}

interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  birth_date?: string;
  location?: string;
  social_links?: SocialLinks;
  favorite_teams?: FavoriteTeams;
  profile_picture_url?: string;
  banner_url?: string;
  last_username_change?: string;
  privacy_settings?: any;
  created_at: string;
}

interface EnhancedProfileSectionProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export const EnhancedProfileSection = ({ profile, onProfileUpdate }: EnhancedProfileSectionProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  
  // Form states
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    profile?.birth_date ? new Date(profile.birth_date) : undefined
  );
  const [location, setLocation] = useState(profile?.location || '');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(profile?.social_links || {});
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeams>(profile?.favorite_teams || {});

  // Sync form states with profile prop changes
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setBirthDate(profile.birth_date ? new Date(profile.birth_date) : undefined);
      setLocation(profile.location || '');
      setSocialLinks(profile.social_links || {});
      setFavoriteTeams(profile.favorite_teams || {});
    }
  }, [profile]);
  
  // Validation states
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  
  // Character limits
  const displayNameLimit = 40;
  const bioLimit = 160;
  const displayNameRemaining = displayNameLimit - displayName.length;
  const bioRemaining = bioLimit - bio.length;

  // Check if username can be changed (15-day limit)
  useEffect(() => {
    if (profile?.last_username_change) {
      const lastChange = new Date(profile.last_username_change);
      const daysSinceChange = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
      setCanChangeUsername(daysSinceChange >= 15);
    }
  }, [profile]);

  // Validate username
  const validateUsername = async (value: string) => {
    if (!value || value === profile?.username) {
      setUsernameError('');
      setUsernameValid(null);
      return;
    }

    const isValidFormat = /^[a-z0-9_]+$/.test(value.toLowerCase());
    const isValidLength = value.length >= 3 && value.length <= 20;

    if (!isValidFormat) {
      setUsernameError('Solo lettere minuscole, numeri e underscore');
      setUsernameValid(false);
      return;
    }

    if (!isValidLength) {
      setUsernameError('Deve essere tra 3 e 20 caratteri');
      setUsernameValid(false);
      return;
    }

    try {
      // Simple client-side validation for now 
      // TODO: Implement server-side username validation
      setUsernameError('');
      setUsernameValid(true);
    } catch (error) {
      setUsernameError('Errore verifica username');
      setUsernameValid(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    validateUsername(value);
  };

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleFavoriteTeamChange = (sport: keyof FavoriteTeams, value: string) => {
    setFavoriteTeams(prev => ({
      ...prev,
      [sport]: value === 'none' ? '' : value
    }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      // Validation
      if (displayName.length > displayNameLimit) {
        toast({
          title: 'Nome troppo lungo',
          description: `Il nome visualizzato deve essere massimo ${displayNameLimit} caratteri`,
          variant: 'destructive'
        });
        return;
      }

      if (bio.length > bioLimit) {
        toast({
          title: 'Biografia troppo lunga',
          description: `La biografia deve essere massimo ${bioLimit} caratteri`,
          variant: 'destructive'
        });
        return;
      }

      if (username !== profile.username && !canChangeUsername) {
        toast({
          title: 'Cambio username non consentito',
          description: 'Puoi cambiare lo username solo ogni 15 giorni',
          variant: 'destructive'
        });
        return;
      }

      if (usernameValid === false) {
        toast({
          title: 'Username non valido',
          description: usernameError,
          variant: 'destructive'
        });
        return;
      }

      const updates: any = {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
        location: location.trim() || null,
        social_links: socialLinks,
        favorite_teams: favoriteTeams,
        updated_at: new Date().toISOString()
      };

      // Only update username if it changed
      if (username !== profile.username && canChangeUsername && usernameValid) {
        updates.username = username;
        updates.last_username_change = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      onProfileUpdate();

      toast({
        title: 'Profilo aggiornato',
        description: 'Le tue informazioni sono state salvate con successo'
      });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile aggiornare il profilo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const userInitials = username?.substring(0, 2).toUpperCase() || 
                      user?.email?.substring(0, 2).toUpperCase() || 'US';

  const suggestedLocations = [
    'Milano, Italia', 'Roma, Italia', 'Napoli, Italia', 'Torino, Italia', 'Palermo, Italia',
    'Genova, Italia', 'Bologna, Italia', 'Firenze, Italia', 'Bari, Italia', 'Catania, Italia'
  ];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm shadow-elegant overflow-hidden animate-fade-in">
      {/* Banner Section */}
      <div className="relative">
        <IntelligentBanner
          currentImageUrl={profile?.banner_url}
          profileImageUrl={profile?.profile_picture_url}
          onImageUpdate={(imageUrl) => {
            onProfileUpdate();
          }}
          height={120}
          disabled={false}
        />
        
        {/* Avatar positioned over banner */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-elegant">
              <AvatarImage 
                src={profile?.profile_picture_url} 
                alt="Profile picture" 
              />
              <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 shadow-lg"
              onClick={() => setShowAvatarEditor(true)}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardHeader className="pt-16 pb-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Informazioni Profilo
        </CardTitle>
        <CardDescription className="text-sm">
          Gestisci tutte le informazioni del tuo profilo pubblico. Le impostazioni privacy determinano cosa sarà visibile agli altri utenti.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            Username (@{username || 'nomeutente'})
            {!canChangeUsername && (
              <div className="flex items-center gap-1 text-orange-500">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Modificabile ogni 15 giorni</span>
              </div>
            )}
          </Label>
          <Input
            id="username"
            value={username}
            onChange={handleUsernameChange}
            placeholder="nomeutente"
            disabled={!canChangeUsername}
            className={cn(
              usernameValid === false && "border-destructive focus:border-destructive"
            )}
          />
          {usernameError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {usernameError}
            </div>
          )}
          {usernameValid && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <User className="h-4 w-4" />
              Username disponibile
            </div>
          )}
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Nome Visualizzato *</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Il tuo nome completo"
            maxLength={displayNameLimit}
            className={cn(
              displayNameRemaining < 0 && "border-destructive focus:border-destructive"
            )}
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Apparirà nei tuoi articoli e commenti</span>
            <span className={cn(
              "text-muted-foreground",
              displayNameRemaining < 5 && "text-orange-500",
              displayNameRemaining < 0 && "text-destructive"
            )}>
              {displayNameRemaining} caratteri rimanenti
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Racconta qualcosa di te..."
            rows={3}
            maxLength={bioLimit}
            className={cn(
              bioRemaining < 0 && "border-destructive focus:border-destructive"
            )}
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Breve descrizione del tuo profilo</span>
            <span className={cn(
              "text-muted-foreground",
              bioRemaining < 10 && "text-orange-500",
              bioRemaining < 0 && "text-destructive"
            )}>
              {bioRemaining} caratteri rimanenti
            </span>
          </div>
        </div>

        {/* Birth Date */}
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? (
                  format(birthDate, "dd MMMM yyyy", { locale: it })
                ) : (
                  "Seleziona data di nascita"
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
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                className="pointer-events-auto"
              />
              {birthDate && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBirthDate(undefined)}
                    className="w-full"
                  >
                    Rimuovi data
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Località</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Città, Paese"
              className="pl-10"
              list="location-suggestions"
            />
          </div>
          <datalist id="location-suggestions">
            {suggestedLocations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        {/* Social Links Manager */}
        <SocialLinksManager 
          socialLinks={socialLinks}
          onChange={(links) => setSocialLinks(links)}
        />

        {/* Favorite Teams Manager */}
        <FavoriteTeamsManager
          favoriteTeams={favoriteTeams as Record<string, string[]>}
          onChange={(teams) => setFavoriteTeams(teams as FavoriteTeams)}
        />

        {/* Save Button - Moved to bottom */}
        <div className="pt-6 border-t border-border/50">
          <Button 
            onClick={handleSave} 
            disabled={loading || displayNameRemaining < 0 || bioRemaining < 0 || usernameValid === false}
            className="w-full min-w-[140px] bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-elegant transition-all duration-300 hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salva Profilo
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {showAvatarEditor && (
        <AvatarEditor 
          imageUrl={profile?.profile_picture_url}
          onClose={() => setShowAvatarEditor(false)}
          onAvatarUpdated={onProfileUpdate}
        />
      )}
    </Card>
  );
};
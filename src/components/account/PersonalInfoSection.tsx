import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, MapPin, User, Save, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PersonalInfoSectionProps {
  profile: any;
  onProfileUpdate: (updates: any) => void;
}

export const PersonalInfoSection = ({ profile, onProfileUpdate }: PersonalInfoSectionProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    profile?.birth_date ? new Date(profile.birth_date) : undefined
  );
  const [location, setLocation] = useState(profile?.location || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');

  // Caratteri rimanenti per display name
  const displayNameLimit = 40;
  const remainingChars = displayNameLimit - (displayName?.length || 0);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Validazione display name
      if (displayName && displayName.length > displayNameLimit) {
        toast({
          title: 'Nome troppo lungo',
          description: `Il nome visualizzato deve essere massimo ${displayNameLimit} caratteri`,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const updates = {
        display_name: displayName?.trim() || null,
        birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
        location: location?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local profile state
      onProfileUpdate(updates);

      toast({
        title: 'Informazioni aggiornate',
        description: 'Le tue informazioni personali sono state salvate con successo'
      });

    } catch (error: any) {
      console.error('Error updating personal info:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile aggiornare le informazioni',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedLocations = [
    'Milano, Italia', 'Roma, Italia', 'Napoli, Italia', 'Torino, Italia', 'Palermo, Italia',
    'Genova, Italia', 'Bologna, Italia', 'Firenze, Italia', 'Bari, Italia', 'Catania, Italia'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informazioni Personali
        </CardTitle>
        <CardDescription>
          Gestisci le tue informazioni personali. Queste informazioni saranno visibili secondo le tue impostazioni privacy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nome Visualizzato */}
        <div className="space-y-2">
          <Label htmlFor="displayName">
            Nome Visualizzato
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="space-y-1">
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Il tuo nome completo"
              maxLength={displayNameLimit}
              className={cn(
                remainingChars < 0 && "border-destructive focus:border-destructive"
              )}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Questo nome apparirà nei tuoi articoli e commenti
              </span>
              <span className={cn(
                "text-muted-foreground",
                remainingChars < 5 && "text-orange-500",
                remainingChars < 0 && "text-destructive"
              )}>
                {remainingChars} caratteri rimanenti
              </span>
            </div>
          </div>
        </div>

        {/* Data di Nascita */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data di Nascita</Label>
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
                initialFocus
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                fromYear={1900}
                toYear={new Date().getFullYear()}
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
          <p className="text-xs text-muted-foreground">
            La tua data di nascita sarà visibile solo se lo permetti nelle impostazioni privacy
          </p>
        </div>

        {/* Posizione */}
        <div className="space-y-2">
          <Label htmlFor="location">Posizione</Label>
          <div className="space-y-2">
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
          <p className="text-xs text-muted-foreground">
            La tua posizione può aiutare a personalizzare i contenuti locali
          </p>
        </div>

        {/* Salva */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading || remainingChars < 0}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salva Modifiche
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
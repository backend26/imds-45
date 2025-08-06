import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Save, MapPin, User } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PublicProfileTabProps {
  onError: (error: any) => void;
}

export const PublicProfileTab = ({ onError }: PublicProfileTabProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    birth_date: null as Date | null,
  });

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        username: data.username || '',
        bio: data.bio || '',
        location: data.location || '',
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim() || null,
          bio: formData.bio.trim() || null,
          location: formData.location.trim() || null,
          birth_date: formData.birth_date ? formData.birth_date.toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni del tuo profilo sono state salvate con successo",
      });

      await fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      onError(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informazioni Pubbliche
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Queste informazioni sono visibili agli altri utenti del sito
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nome utente</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Il tuo nome utente"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Utilizzato per identificarti pubblicamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Posizione</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="La tua città o regione"
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Racconta qualcosa di te..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 caratteri
            </p>
          </div>

          <div className="space-y-2">
            <Label>Data di nascita</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.birth_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.birth_date ? (
                    format(formData.birth_date, "dd/MM/yyyy")
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.birth_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, birth_date: date }))}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Opzionale - non verrà mostrata pubblicamente
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salva Modifiche'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
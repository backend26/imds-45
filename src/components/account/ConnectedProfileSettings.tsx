import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Camera, Save } from 'lucide-react';

import { Database } from '@/integrations/supabase/types';

// Use Supabase generated types for strong typing
type Profile = Database['public']['Tables']['profiles']['Row'];

export const ConnectedProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    birth_date: '',
    preferred_sports: [] as string[]
  });

  const availableSports = [
    'calcio', 'tennis', 'f1', 'basket', 'nfl', 
    'volley', 'rugby', 'atletica', 'nuoto', 'ciclismo'
  ];

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          location: data.location || '',
          birth_date: data.birth_date || '',
          preferred_sports: Array.isArray(data.preferred_sports) ? data.preferred_sports : []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updateData = {
        username: formData.username,
        display_name: formData.display_name,
        bio: formData.bio || null,
        location: formData.location || null,
        birth_date: formData.birth_date || null,
        preferred_sports: formData.preferred_sports
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updateData
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo"
      });

      await loadProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il profilo",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSportToggle = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_sports: prev.preferred_sports.includes(sport)
        ? prev.preferred_sports.filter(s => s !== sport)
        : [...prev.preferred_sports, sport]
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni Profilo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.profile_picture_url || ''} />
            <AvatarFallback className="text-lg">
              {formData.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" disabled>
              <Camera className="w-4 h-4 mr-2" />
              Cambia Foto
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Funzionalità disponibile presto
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Il tuo username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Nome visualizzato</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Nome da mostrare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Posizione</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="La tua città"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Data di nascita</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Raccontaci qualcosa di te..."
            rows={3}
          />
        </div>

        {/* Sports Preferences */}
        <div className="space-y-3">
          <Label>Sport preferiti</Label>
          <div className="flex flex-wrap gap-2">
            {availableSports.map(sport => (
              <Badge
                key={sport}
                variant={formData.preferred_sports.includes(sport) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSportToggle(sport)}
              >
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salva modifiche
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
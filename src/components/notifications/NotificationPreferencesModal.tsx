import { useState, useEffect } from 'react';
import { Bell, Clock, Users, Zap, Trophy, Settings, Mail, Heart, ThumbsUp, MessageSquare, Share, UserPlus, TrendingUp, Star, Calendar, Zap as Live, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationPreferencesModal = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchPreferences();
    }
  }, [open, user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create default preferences if none exist
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert([{ user_id: user.id }])
          .select()
          .single();
        
        if (createError) throw createError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le preferenze di notifica",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences({ ...preferences, ...updates });
      toast({
        title: "Salvato",
        description: "Preferenze di notifica aggiornate con successo"
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare le preferenze",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const updateSportPreferences = (sport: string, enabled: boolean) => {
    if (!preferences?.posts_by_sport) return;
    
    const currentSports = preferences.posts_by_sport as Record<string, boolean>;
    const updatedSports = { ...currentSports, [sport]: enabled };
    updatePreferences({ posts_by_sport: updatedSports });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferenze Notifiche
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!preferences) return null;

  const sportPreferences = preferences.posts_by_sport as Record<string, boolean> || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto" aria-describedby="notification-preferences-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferenze Notifiche
          </DialogTitle>
          <p id="notification-preferences-description" className="text-sm text-muted-foreground">
            Gestisci tutte le tue preferenze di notifica in un unico posto
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Impostazioni Generali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Abilita tutte le notifiche
                </Label>
                <Switch
                  id="enabled"
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => togglePreference('enabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Orari di silenzio
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Inizio</Label>
                    <Select
                      value={preferences.quiet_hours_start || '22:00'}
                      onValueChange={(value) => updatePreferences({ quiet_hours_start: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fine</Label>
                    <Select
                      value={preferences.quiet_hours_end || '08:00'}
                      onValueChange={(value) => updatePreferences({ quiet_hours_end: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Interactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Interazioni Sociali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'likes_on_posts' as const, label: 'Like sui tuoi post', icon: Heart },
                { key: 'likes_on_comments' as const, label: 'Like sui tuoi commenti', icon: ThumbsUp },
                { key: 'comments_on_posts' as const, label: 'Commenti sui tuoi post', icon: MessageSquare },
                { key: 'replies_to_comments' as const, label: 'Risposte ai tuoi commenti', icon: Share },
                { key: 'mentions' as const, label: 'Menzioni (@username)', icon: Target },
                { key: 'new_followers' as const, label: 'Nuovi follower', icon: UserPlus }
              ].map(({ key, label, icon: IconComponent }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={preferences[key]}
                    onCheckedChange={(checked) => togglePreference(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Content & Authors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Contenuti e Autori
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="posts_from_all_authors">Nuovi post da tutti gli autori</Label>
                <Switch
                  id="posts_from_all_authors"
                  checked={preferences.posts_from_all_authors}
                  onCheckedChange={(checked) => togglePreference('posts_from_all_authors', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="posts_from_followed_authors">Post dagli autori che segui</Label>
                <Switch
                  id="posts_from_followed_authors"
                  checked={preferences.posts_from_followed_authors}
                  onCheckedChange={(checked) => togglePreference('posts_from_followed_authors', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Notifiche per Sport</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'calcio', label: 'Calcio', icon: Zap },
                    { key: 'tennis', label: 'Tennis', icon: Target },
                    { key: 'f1', label: 'Formula 1', icon: Zap },
                    { key: 'basket', label: 'Basket', icon: Target },
                    { key: 'nfl', label: 'NFL', icon: Zap }
                  ].map(({ key, label, icon: IconComponent }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm">
                        <IconComponent className="h-4 w-4" />
                        {label}
                      </Label>
                      <Switch
                        checked={sportPreferences[key] || false}
                        onCheckedChange={(checked) => updateSportPreferences(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {[
                { key: 'trending_posts' as const, label: 'Post in tendenza', icon: TrendingUp },
                { key: 'featured_posts' as const, label: 'Post in evidenza', icon: Star }
              ].map(({ key, label, icon: IconComponent }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={preferences[key]}
                    onCheckedChange={(checked) => togglePreference(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Events & Live */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Eventi e Live
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'event_reminders' as const, label: 'Promemoria eventi', icon: Calendar },
                { key: 'live_events' as const, label: 'Eventi live', icon: Live },
                { key: 'score_updates' as const, label: 'Aggiornamenti punteggi', icon: Zap },
                { key: 'favorite_team_updates' as const, label: 'Aggiornamenti squadra del cuore', icon: Heart }
              ].map(({ key, label, icon: IconComponent }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={preferences[key]}
                    onCheckedChange={(checked) => togglePreference(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Impostazioni Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_enabled">Notifiche via email</Label>
                <Switch
                  id="email_enabled"
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => togglePreference('email_enabled', checked)}
                />
              </div>

              {preferences.email_enabled && (
                <div className="space-y-2">
                  <Label className="text-sm">Frequenza digest email</Label>
                  <Select
                    value={preferences.email_digest_frequency || 'weekly'}
                    onValueChange={(value) => updatePreferences({ email_digest_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Mai</SelectItem>
                      <SelectItem value="daily">Giornaliero</SelectItem>
                      <SelectItem value="weekly">Settimanale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
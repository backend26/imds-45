import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Clock, Mail, Smartphone, Users, Heart, MessageCircle, TrendingUp, Calendar, AlertTriangle, Settings } from 'lucide-react';

interface NotificationPreferences {
  enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  likes_on_posts: boolean;
  likes_on_comments: boolean;
  comments_on_posts: boolean;
  replies_to_comments: boolean;
  mentions: boolean;
  new_followers: boolean;
  posts_from_followed_authors: boolean;
  posts_by_sport: Record<string, boolean>;
  trending_posts: boolean;
  featured_posts: boolean;
  event_reminders: boolean;
  live_events: boolean;
  favorite_team_updates: boolean;
  email_digest_frequency: string;
}

export const NotificationPreferencesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default preferences
        const defaultPrefs: Partial<NotificationPreferences> = {
          enabled: true,
          push_enabled: true,
          email_enabled: false,
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
          likes_on_posts: true,
          likes_on_comments: true,
          comments_on_posts: true,
          replies_to_comments: true,
          mentions: true,
          new_followers: true,
          posts_from_followed_authors: true,
          posts_by_sport: {
            calcio: true,
            tennis: true,
            f1: true,
            basket: true,
            nfl: true
          },
          trending_posts: true,
          featured_posts: true,
          event_reminders: true,
          live_events: true,
          favorite_team_updates: true,
          email_digest_frequency: 'weekly'
        };

        const { data: created, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user?.id, ...defaultPrefs })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(created as NotificationPreferences);
      } else if (error) {
        throw error;
      } else {
        setPreferences(data as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le preferenze notifiche',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Preferenze salvate',
        description: 'Le tue preferenze notifiche sono state aggiornate'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le preferenze',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const updateSportPreference = (sport: string, enabled: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      posts_by_sport: {
        ...preferences.posts_by_sport,
        [sport]: enabled
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="space-y-6">
      {/* Impostazioni Generali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Impostazioni Generali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Abilita notifiche</Label>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche per le attività sul sito
              </p>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) => updatePreference('enabled', checked)}
            />
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Notifiche Push
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifiche istantanee nel browser
                </p>
              </div>
              <Switch
                checked={preferences.push_enabled}
                onCheckedChange={(checked) => updatePreference('push_enabled', checked)}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notifiche Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi notifiche via email
                </p>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
                disabled={!preferences.enabled}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ore di silenzio
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Inizio</Label>
                <Select
                  value={preferences.quiet_hours_start}
                  onValueChange={(value) => updatePreference('quiet_hours_start', value)}
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
                  value={preferences.quiet_hours_end}
                  onValueChange={(value) => updatePreference('quiet_hours_end', value)}
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

      {/* Interazioni Sociali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Interazioni Sociali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'likes_on_posts', label: 'Like sui tuoi post', icon: Heart },
            { key: 'likes_on_comments', label: 'Like sui tuoi commenti', icon: Heart },
            { key: 'comments_on_posts', label: 'Commenti sui tuoi post', icon: MessageCircle },
            { key: 'replies_to_comments', label: 'Risposte ai tuoi commenti', icon: MessageCircle },
            { key: 'mentions', label: 'Menzioni (@username)', icon: Users },
            { key: 'new_followers', label: 'Nuovi follower', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Label>
              <Switch
                checked={preferences[key as keyof NotificationPreferences] as boolean}
                onCheckedChange={(checked) => updatePreference(key as keyof NotificationPreferences, checked)}
                disabled={!preferences.enabled}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contenuti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Contenuti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Post da autori che segui</Label>
            <Switch
              checked={preferences.posts_from_followed_authors}
              onCheckedChange={(checked) => updatePreference('posts_from_followed_authors', checked)}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Post in tendenza</Label>
            <Switch
              checked={preferences.trending_posts}
              onCheckedChange={(checked) => updatePreference('trending_posts', checked)}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Post in evidenza</Label>
            <Switch
              checked={preferences.featured_posts}
              onCheckedChange={(checked) => updatePreference('featured_posts', checked)}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Aggiornamenti squadre del cuore</Label>
            <Switch
              checked={preferences.favorite_team_updates}
              onCheckedChange={(checked) => updatePreference('favorite_team_updates', checked)}
              disabled={!preferences.enabled}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Notifiche per sport</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(preferences.posts_by_sport || {}).map(([sport, enabled]) => (
                <div key={sport} className="flex items-center justify-between">
                  <Label className="capitalize">{sport}</Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateSportPreference(sport, checked)}
                    disabled={!preferences.enabled}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eventi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Eventi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Promemoria eventi</Label>
            <Switch
              checked={preferences.event_reminders}
              onCheckedChange={(checked) => updatePreference('event_reminders', checked)}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Eventi live</Label>
            <Switch
              checked={preferences.live_events}
              onCheckedChange={(checked) => updatePreference('live_events', checked)}
              disabled={!preferences.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Digest Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Frequenza digest email</Label>
            <Select
              value={preferences.email_digest_frequency}
              onValueChange={(value) => updatePreference('email_digest_frequency', value)}
              disabled={!preferences.enabled || !preferences.email_enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Giornaliero</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="never">Mai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Salvataggio */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva Preferenze'}
        </Button>
      </div>
    </div>
  );
};
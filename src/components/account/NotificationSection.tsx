import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Heart, MessageCircle, UserPlus, Flame, Star, Calendar, Trophy, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  enabled: boolean;
  push_enabled: boolean;
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
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const SPORTS = [
  { value: 'calcio', label: 'Calcio' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'f1', label: 'Formula 1' },
  { value: 'nfl', label: 'NFL' },
  { value: 'basket', label: 'Basket' }
];

export const NotificationSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    push_enabled: true,
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
      nfl: true,
      basket: true
    },
    trending_posts: true,
    featured_posts: true,
    event_reminders: true,
    live_events: true,
    favorite_team_updates: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          enabled: data.enabled ?? true,
          push_enabled: data.push_enabled ?? true,
          likes_on_posts: data.likes_on_posts ?? true,
          likes_on_comments: data.likes_on_comments ?? true,
          comments_on_posts: data.comments_on_posts ?? true,
          replies_to_comments: data.replies_to_comments ?? true,
          mentions: data.mentions ?? true,
          new_followers: data.new_followers ?? true,
          posts_from_followed_authors: data.posts_from_followed_authors ?? true,
          posts_by_sport: (data.posts_by_sport as Record<string, boolean>) || {
            calcio: true,
            tennis: true,
            f1: true,
            nfl: true,
            basket: true
          },
          trending_posts: data.trending_posts ?? true,
          featured_posts: data.featured_posts ?? true,
          event_reminders: data.event_reminders ?? true,
          live_events: data.live_events ?? true,
          favorite_team_updates: data.favorite_team_updates ?? true,
          quiet_hours_start: data.quiet_hours_start || '22:00',
          quiet_hours_end: data.quiet_hours_end || '08:00'
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni notifiche",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Impostazioni salvate",
        description: "Le tue preferenze notifiche sono state aggiornate"
      });
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare le impostazioni",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSportToggle = (sport: string) => {
    setSettings(prev => ({
      ...prev,
      posts_by_sport: {
        ...prev.posts_by_sport,
        [sport]: !prev.posts_by_sport[sport]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const notificationOptions = [
    {
      title: 'Interazioni',
      description: 'Notifiche relative alle tue attività',
      options: [
        { key: 'likes_on_posts' as keyof NotificationSettings, title: 'Like sui tuoi post', icon: Heart },
        { key: 'likes_on_comments' as keyof NotificationSettings, title: 'Like sui tuoi commenti', icon: Heart },
        { key: 'comments_on_posts' as keyof NotificationSettings, title: 'Commenti sui tuoi post', icon: MessageCircle },
        { key: 'replies_to_comments' as keyof NotificationSettings, title: 'Risposte ai tuoi commenti', icon: MessageCircle },
        { key: 'mentions' as keyof NotificationSettings, title: 'Menzioni (@username)', icon: Bell },
        { key: 'new_followers' as keyof NotificationSettings, title: 'Nuovi follower', icon: UserPlus }
      ]
    },
    {
      title: 'Contenuti',
      description: 'Notifiche sui nuovi contenuti',
      options: [
        { key: 'posts_from_followed_authors' as keyof NotificationSettings, title: 'Post da autori seguiti', icon: UserPlus },
        { key: 'trending_posts' as keyof NotificationSettings, title: 'Post in tendenza', icon: Flame },
        { key: 'featured_posts' as keyof NotificationSettings, title: 'Post in evidenza', icon: Star }
      ]
    },
    {
      title: 'Eventi',
      description: 'Notifiche su eventi sportivi',
      options: [
        { key: 'event_reminders' as keyof NotificationSettings, title: 'Promemoria eventi', icon: Calendar },
        { key: 'live_events' as keyof NotificationSettings, title: 'Eventi in diretta', icon: Trophy },
        { key: 'favorite_team_updates' as keyof NotificationSettings, title: 'Aggiornamenti squadre favorite', icon: Trophy }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Controlli Principali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled" className="font-medium">
                Abilita Notifiche
              </Label>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche per le attività importanti
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={() => handleToggle('enabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled" className="font-medium">
                Notifiche Push
              </Label>
              <p className="text-sm text-muted-foreground">
                Mostra notifiche nel browser (quando supportato)
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.push_enabled}
              onCheckedChange={() => handleToggle('push_enabled')}
              disabled={!settings.enabled}
            />
          </div>

          {/* Quiet Hours */}
          <div className="space-y-2">
            <Label>Orari di Silenzio</Label>
            <p className="text-sm text-muted-foreground">
              Non ricevere notifiche durante questi orari
            </p>
            <div className="flex gap-2 items-center">
              <Select
                value={settings.quiet_hours_start}
                onValueChange={(value) => setSettings(prev => ({ ...prev, quiet_hours_start: value }))}
              >
                <SelectTrigger className="w-32">
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
              <span className="text-muted-foreground">-</span>
              <Select
                value={settings.quiet_hours_end}
                onValueChange={(value) => setSettings(prev => ({ ...prev, quiet_hours_end: value }))}
              >
                <SelectTrigger className="w-32">
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
        </CardContent>
      </Card>

      {/* Notification Categories */}
      {notificationOptions.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="text-base">{category.title}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {category.options.map((option) => {
              const IconComponent = option.icon;
              const isEnabled = settings[option.key] as boolean;
              
              return (
                <div key={option.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${
                      isEnabled 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <Label htmlFor={option.key} className="cursor-pointer">
                      {option.title}
                    </Label>
                  </div>
                  <Switch
                    id={option.key}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(option.key)}
                    disabled={!settings.enabled}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Sports Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifiche per Sport</CardTitle>
          <CardDescription>
            Ricevi notifiche sui post dei tuoi sport preferiti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SPORTS.map((sport) => (
            <div key={sport.value} className="flex items-center justify-between">
              <Label htmlFor={`sport-${sport.value}`} className="cursor-pointer">
                {sport.label}
              </Label>
              <Switch
                id={`sport-${sport.value}`}
                checked={settings.posts_by_sport[sport.value] ?? false}
                onCheckedChange={() => handleSportToggle(sport.value)}
                disabled={!settings.enabled}
              />
            </div>
          ))}
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
            Salva Preferenze Notifiche
          </>
        )}
      </Button>
    </div>
  );
};
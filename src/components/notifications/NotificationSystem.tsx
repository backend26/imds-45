import { useState, useEffect } from 'react';
import { Bell, X, Check, MessageCircle, Heart, UserPlus, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type Notification = Database['public']['Tables']['notifications']['Row'] & {
  actor: { username: string; profile_picture_url: string | null };
  related_post: { title: string } | null;
};

export const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      const base = data || [];
      // Enrich with actor username and related post title
      const enriched = await Promise.all(base.map(async (n: any) => {
        const [actorRes, postRes] = await Promise.all([
          supabase.from('profiles').select('username, profile_picture_url').eq('user_id', n.actor_id).maybeSingle(),
          n.related_post_id ? supabase.from('posts').select('title').eq('id', n.related_post_id).maybeSingle() : Promise.resolve({ data: null })
        ]);
        return {
          ...n,
          actor: { username: actorRes.data?.username || 'Utente', profile_picture_url: actorRes.data?.profile_picture_url || null },
          related_post: n.related_post_id ? { title: (postRes as any).data?.title || '' } : null
        } as Notification;
      }));
      setNotifications(enriched);
    };
    load();

    const channel = supabase
      .channel('notifications-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
        const n = payload.new as any;
        if (n.recipient_id !== user.id) return;
        const [actorRes, postRes] = await Promise.all([
          supabase.from('profiles').select('username, profile_picture_url').eq('user_id', n.actor_id).maybeSingle(),
          n.related_post_id ? supabase.from('posts').select('title').eq('id', n.related_post_id).maybeSingle() : Promise.resolve({ data: null })
        ]);
        const enriched: Notification = {
          ...(n as any),
          actor: { username: actorRes.data?.username || 'Utente', profile_picture_url: actorRes.data?.profile_picture_url || null },
          related_post: n.related_post_id ? { title: (postRes as any).data?.title || '' } : null
        };
        setNotifications(prev => [enriched, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case 'new_follower':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const { type, actor, related_post } = notification;
    const username = actor.username || 'Utente';
    
    switch (type) {
      case 'like':
        return `${username} ha messo mi piace al tuo articolo "${related_post?.title}"`;
      case 'comment':
        return `${username} ha commentato il tuo articolo "${related_post?.title}"`;
      case 'mention':
        return `${username} ti ha menzionato in un commento`;
      case 'new_follower':
        return `${username} ha iniziato a seguirti`;
      default:
        return 'Nuova notifica';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user!.id);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user!.id)
        .eq('is_read', false);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', user!.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifiche</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Segna tutte come lette
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nessuna notifica</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: it
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
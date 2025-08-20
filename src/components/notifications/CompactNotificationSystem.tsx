import { useState, useEffect } from 'react';
import { Bell, BellRing, X, Check, CheckCheck, Settings, Heart, MessageCircle, UserPlus, Bookmark, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'new_follower' | 'mention' | 'bookmark' | 'featured';
  actor_id: string;
  related_post_id?: string;
  is_read: boolean;
  created_at: string;
  actor: {
    username: string;
    display_name: string;
    profile_picture_url?: string;
  };
  post?: {
    id: string;
    title: string;
  };
}

export const CompactNotificationSystem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          actor_id,
          related_post_id,
          is_read,
          created_at,
          profiles:actor_id (
            username,
            display_name,
            profile_picture_url
          ),
          posts:related_post_id (
            id,
            title
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const processedNotifications = (data || []).map((notif: any) => ({
        ...notif,
        actor: notif.profiles,
        post: notif.posts
      }));

      setNotifications(processedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          loadNotifications(); // Reload notifications on new insert
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: "Tutte le notifiche sono state lette"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setOpen(false);

    // Navigate based on notification type
    if (notification.related_post_id) {
      navigate(`/post/${notification.related_post_id}`);
    } else if (notification.type === 'new_follower') {
      navigate(`/profile/${notification.actor.username}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'new_follower':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'bookmark':
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case 'featured':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor.display_name;
    const postTitle = notification.post?.title ? ` "${notification.post.title.substring(0, 30)}..."` : '';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} ha messo mi piace al tuo post${postTitle}`;
      case 'comment':
        return `${actorName} ha commentato il tuo post${postTitle}`;
      case 'new_follower':
        return `${actorName} ha iniziato a seguirti`;
      case 'bookmark':
        return `${actorName} ha salvato il tuo post${postTitle}`;
      case 'featured':
        return `Il tuo post${postTitle} è stato messo in evidenza`;
      default:
        return 'Nuova notifica';
    }
  };

  // Don't show for non-authenticated users
  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/80 transition-colors"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-72 p-0 shadow-md border" 
        align="end"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-lg">Notifiche</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 px-2"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Leggi tutte
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Nessuna notifica</p>
              <p className="text-sm">Le tue notifiche appariranno qui</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.is_read && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={notification.actor.profile_picture_url} />
                    <AvatarFallback className="text-xs">
                      {notification.actor.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground leading-relaxed mb-1">
                      {getNotificationText(notification)}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: it
                      })}
                    </div>
                  </div>
                  
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <Separator />
        
        <div className="p-3 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate('/account#notifications');
              setOpen(false);
            }}
            className="w-full text-sm"
          >
            <Settings className="h-3 w-3 mr-2" />
            Gestisci preferenze notifiche
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
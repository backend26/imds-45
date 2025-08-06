import { useState, useEffect } from "react";
import { Bell, X, Check, Heart, MessageCircle, UserPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'new_follower';
  actor_id: string;
  recipient_id: string;
  related_post_id?: string;
  is_read: boolean;
  created_at: string;
  actor_profile?: {
    username: string;
    profile_picture_url?: string;
  };
  related_post?: {
    title: string;
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'mention':
      return <Star className="h-4 w-4 text-yellow-500" />;
    case 'new_follower':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationText = (notification: Notification) => {
  const username = notification.actor_profile?.username || 'Un utente';
  
  switch (notification.type) {
    case 'like':
      return `${username} ha messo mi piace al tuo post "${notification.related_post?.title || 'post'}"`;
    case 'comment':
      return `${username} ha commentato il tuo post "${notification.related_post?.title || 'post'}"`;
    case 'mention':
      return `${username} ti ha menzionato in un post`;
    case 'new_follower':
      return `${username} ha iniziato a seguirti`;
    default:
      return 'Nuova notifica';
  }
};

export const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      // Mock data since we don't have the database connected
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          actor_id: 'user1',
          recipient_id: user.id,
          related_post_id: 'post1',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          actor_profile: {
            username: 'MarcoRossi',
            profile_picture_url: undefined
          },
          related_post: {
            title: 'Juventus vince la Champions League'
          }
        },
        {
          id: '2',
          type: 'comment',
          actor_id: 'user2',
          recipient_id: user.id,
          related_post_id: 'post2',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          actor_profile: {
            username: 'AnnaBianchi',
            profile_picture_url: undefined
          },
          related_post: {
            title: 'Analisi tattica: Inter vs Milan'
          }
        },
        {
          id: '3',
          type: 'new_follower',
          actor_id: 'user3',
          recipient_id: user.id,
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          actor_profile: {
            username: 'LucaVerdi',
            profile_picture_url: undefined
          }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    // Mock realtime updates
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance every second
        const newNotification: Notification = {
          id: `new_${Date.now()}`,
          type: ['like', 'comment', 'mention', 'new_follower'][Math.floor(Math.random() * 4)] as any,
          actor_id: 'random_user',
          recipient_id: user.id,
          is_read: false,
          created_at: new Date().toISOString(),
          actor_profile: {
            username: 'NuovoUtente',
            profile_picture_url: undefined
          },
          related_post: {
            title: 'Nuovo articolo interessante'
          }
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        toast({
          title: "Nuova notifica",
          description: getNotificationText(newNotification),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-secondary/60 hover:text-primary transition-all duration-200 hover:scale-105"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifiche</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Segna tutte lette
                  </Button>
                )}
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} non lette
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <ScrollArea className="h-80">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nessuna notifica
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.actor_profile?.profile_picture_url} />
                            <AvatarFallback className="text-xs">
                              {notification.actor_profile?.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getNotificationIcon(notification.type)}
                              {!notification.is_read && (
                                <div className="h-2 w-2 bg-primary rounded-full" />
                              )}
                            </div>
                            
                            <p className="text-sm leading-relaxed">
                              {getNotificationText(notification)}
                            </p>
                            
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: it 
                              })}
                            </p>
                          </div>
                          
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
import { useState, useEffect } from 'react';
import { Bell, X, Check, MessageCircle, Heart, UserPlus, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRealNotifications } from '@/hooks/use-real-notifications';
import { Database } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { NotificationPreferencesButton } from './NotificationPreferencesButton';

type Notification = Database['public']['Tables']['notifications']['Row'] & {
  actor: { username: string; profile_picture_url: string | null };
  related_post: { title: string } | null;
};

export const NotificationSystem = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationMessage
  } = useRealNotifications();

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

  const getNotificationText = (notification: any) => {
    return getNotificationMessage(notification);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "relative hover:bg-secondary/60 hover:text-primary transition-all duration-200 hover:scale-105",
              "bg-background/50 border border-border/30 backdrop-blur-sm",
              "shadow-lg hover:shadow-xl",
              "h-8 sm:h-9 w-8 sm:w-9 p-0"
            )}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
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
                        {getNotificationMessage(notification)}
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
        
        <div className="p-3 border-t">
          <NotificationPreferencesButton 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
          >
            Gestisci Preferenze
          </NotificationPreferencesButton>
        </div>
      </PopoverContent>
    </Popover>
    </>
  );
};
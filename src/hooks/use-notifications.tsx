import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'new_follower' | 'mention' | 'system' | 'post_published';
  related_post_id?: string;
  created_at: string;
  is_read: boolean;
  actor?: {
    username: string;
    display_name: string;
    profile_picture_url: string | null;
  };
  post?: {
    title: string;
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (
            username,
            display_name,
            profile_picture_url
          ),
          post:posts!notifications_related_post_id_fkey (
            title
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notificationsWithData = data?.map(notification => ({
        ...notification,
        actor: notification.actor,
        post: notification.post
      })) || [];

      setNotifications(notificationsWithData);
      setUnreadCount(notificationsWithData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Notifiche lette",
        description: "Tutte le notifiche sono state segnate come lette"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Errore",
        description: "Impossibile segnare le notifiche come lette",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la notifica",
        variant: "destructive"
      });
    }
  }, [user, notifications, toast]);

  const getNotificationMessage = useCallback((notification: Notification) => {
    const actorName = notification.actor?.display_name || notification.actor?.username || 'Qualcuno';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} ha messo mi piace al tuo post${notification.post?.title ? ': ' + notification.post.title : ''}`;
      case 'comment':
        return `${actorName} ha commentato il tuo post${notification.post?.title ? ': ' + notification.post.title : ''}`;
      case 'new_follower':
        return `${actorName} ha iniziato a seguirti`;
      case 'mention':
        return `${actorName} ti ha menzionato in un post`;
      case 'post_published':
        return `Nuovo post pubblicato da ${actorName}`;
      case 'system':
        return `Notifica di sistema`;
      default:
        return 'Nuova notifica';
    }
  }, []);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        // Reload notifications when new one arrives
        loadNotifications();
        
        // Show toast for new notification
        toast({
          title: "Nuova notifica",
          description: "Hai ricevuto una nuova notifica"
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`
      }, () => {
        // Reload notifications when updated
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications, toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationMessage
  };
}
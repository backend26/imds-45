import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface RealNotification {
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

export function useRealNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

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

      const processedNotifications = (data || []).map(notification => ({
        ...notification,
        actor: notification.actor,
        post: notification.post
      })) as RealNotification[];

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le notifiche",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

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
      toast({
        title: "Errore",
        description: "Impossibile segnare la notifica come letta",
        variant: "destructive"
      });
    }
  }, [user, toast]);

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

      toast({
        title: "Notifica eliminata",
        description: "La notifica è stata rimossa"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la notifica",
        variant: "destructive"
      });
    }
  }, [user, notifications, toast]);

  const getNotificationMessage = useCallback((notification: RealNotification) => {
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

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'mention':
        return '@';
      case 'new_follower':
        return '👤';
      case 'post_published':
        return '📝';
      case 'system':
        return '🔔';
      default:
        return '🔔';
    }
  }, []);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

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
        const newNotification = payload.new as any;
        toast({
          title: "Nuova notifica",
          description: getNotificationMessage(newNotification as RealNotification),
          duration: 3000
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
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`
      }, () => {
        // Reload notifications when deleted
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications, toast, getNotificationMessage]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationMessage,
    getNotificationIcon
  };
}
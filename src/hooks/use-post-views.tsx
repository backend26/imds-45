import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface PostViewsData {
  viewCount: number;
  hasViewed: boolean;
}

export const usePostViews = (postId: string) => {
  const { user } = useAuth();
  const [viewData, setViewData] = useState<PostViewsData>({
    viewCount: 0,
    hasViewed: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadViewData();
    }
  }, [postId, user]);

  const loadViewData = async () => {
    try {
      // Get view count manually since RPC function may not exist yet
      const { count: viewCountData } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      let hasViewed = false;

      if (user) {
        // Check if current user has viewed this post
        const { data: userViewData } = await supabase
          .from('post_views')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        hasViewed = !!userViewData;
      }

      setViewData({
        viewCount: viewCountData || 0,
        hasViewed
      });
    } catch (error) {
      console.log('View data loading disabled - table may not exist');
      // Set default values to prevent UI errors
      setViewData({
        viewCount: 0,
        hasViewed: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const incrementView = async () => {
    if (viewData.hasViewed) return false;

    try {
      const userAgent = navigator.userAgent || 'Unknown';
      const ip = '127.0.0.1'; // Default fallback IP
      
      // Per utenti anonimi, inserisce sempre una nuova visualizzazione
      // Per utenti autenticati, verifica prima se esiste già
      if (user) {
        // Verifica se l'utente ha già visualizzato il post
        const { data: existingView } = await supabase
          .from('post_views')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        if (existingView) {
          return false; // Già visualizzato
        }
      }
      
      // Inserisce una nuova visualizzazione
      const { error: insertError } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          user_id: user?.id || null,
          ip_address: ip,
          user_agent: userAgent
        });

      if (!insertError) {
        setViewData(prev => ({
          viewCount: prev.viewCount + 1,
          hasViewed: true
        }));
        return true;
      } else {
        console.log('View increment skipped:', insertError.message);
      }

    } catch (error) {
      console.log('View tracking error:', error.message);
    }
    
    return false;
  };

  return {
    viewCount: viewData.viewCount,
    hasViewed: viewData.hasViewed,
    isLoading,
    incrementView,
    refreshViews: loadViewData
  };
};
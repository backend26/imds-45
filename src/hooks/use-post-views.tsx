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
      console.error('Error loading view data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementView = async () => {
    if (viewData.hasViewed) return false;

    try {
      const userAgent = navigator.userAgent;
      
      // Get IP address (will be handled by Edge Function in production)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // Try to increment view using RPC function, fallback to direct insert
      try {
        const { data: success } = await supabase
          .rpc('increment_post_view', {
            p_post_id: postId,
            p_ip_address: ip,
            p_user_agent: userAgent
          });
        
        if (success) {
          setViewData(prev => ({
            viewCount: prev.viewCount + 1,
            hasViewed: true
          }));
          return true;
        }
      } catch (rpcError) {
        // Fallback: direct insert if RPC fails
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
        }
      }

    } catch (error) {
      console.error('Error incrementing view:', error);
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
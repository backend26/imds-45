import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalEvents: number;
  pendingReports: number;
  activeUsers: number;
  publishedPosts: number;
  recentPosts: number;
  monthlyGrowth: {
    users: number;
    posts: number;
    engagement: number;
  };
}

export const useRealDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalEvents: 0,
    pendingReports: 0,
    activeUsers: 0,
    publishedPosts: 0,
    recentPosts: 0,
    monthlyGrowth: { users: 0, posts: 0, engagement: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);

      // Get all counts in parallel
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: publishedPosts },
        { count: totalComments },
        { count: totalEvents },
        { count: pendingPostReports },
        { count: pendingCommentReports = 0 }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('sports_events').select('*', { count: 'exact', head: true }),
        supabase.from('post_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        (supabase as any).from('comment_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Get recent posts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get users who have been active in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', sevenDaysAgo.toISOString());

      // Calculate monthly growth
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { count: usersLastMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const { count: usersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: postsLastMonth } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', sixtyDaysAgo.toISOString())
        .lt('published_at', thirtyDaysAgo.toISOString());

      const { count: postsThisMonth } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', thirtyDaysAgo.toISOString());

      // Calculate growth percentages
      const userGrowth = usersLastMonth > 0 
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 
        : 0;
      
      const postGrowth = postsLastMonth > 0 
        ? ((postsThisMonth - postsLastMonth) / postsLastMonth) * 100 
        : 0;

      const engagementGrowth = totalComments > 0 && totalPosts > 0
        ? (totalComments / totalPosts) * 10 // Simplified engagement metric
        : 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        totalComments: totalComments || 0,
        totalEvents: totalEvents || 0,
        pendingReports: (pendingPostReports || 0) + (pendingCommentReports || 0),
        activeUsers: activeUsers || 0,
        recentPosts: recentPosts || 0,
        monthlyGrowth: {
          users: Math.round(userGrowth * 10) / 10,
          posts: Math.round(postGrowth * 10) / 10,
          engagement: Math.round(engagementGrowth * 10) / 10
        }
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh: fetchRealData
  };
};
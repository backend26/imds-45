import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image_url?: string;
  banner_url?: string;
  category_id: string;
  author_id: string;
  published_at: string;
  is_hero: boolean;
  categories?: {
    name: string;
    slug: string;
  };
  profiles?: {
    display_name: string;
    username: string;
  };
}

export const useHeroArticlesFilter = () => {
  const [heroArticles, setHeroArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);

      // Fetch hero articles
      const { data: heroData, error: heroError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          banner_url,
          category_id,
          author_id,
          published_at,
          is_hero,
          categories:category_id (
            name,
            slug
          ),
          profiles:author_id (
            display_name,
            username
          )
        `)
        .eq('is_hero', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);

      if (heroError) throw heroError;

      const heroIds = (heroData || []).map(article => article.id);
      setHeroArticles(heroData || []);

      // Fetch recent articles (excluding hero articles)
      let recentQuery = supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          banner_url,
          category_id,
          author_id,
          published_at,
          is_hero,
          categories:category_id (
            name,
            slug
          ),
          profiles:author_id (
            display_name,
            username
          )
        `)
        .not('published_at', 'is', null)
        .eq('is_hero', false)
        .order('published_at', { ascending: false })
        .limit(12);

      // Exclude hero articles from recent articles
      if (heroIds.length > 0) {
        recentQuery = recentQuery.not('id', 'in', `(${heroIds.join(',')})`);
      }

      const { data: recentData, error: recentError } = await recentQuery;

      if (recentError) throw recentError;

      setRecentArticles(recentData || []);

    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    heroArticles,
    recentArticles,
    loading,
    refresh: fetchArticles
  };
};
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DatabasePost = Database['public']['Tables']['posts']['Row'];
type DatabaseCategory = Database['public']['Tables']['categories']['Row'];
type DatabaseProfile = Database['public']['Tables']['profiles']['Row'];

interface SportPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_images: any;
  category_id: string;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  is_hero: boolean | null;
  categories?: {
    name: string;
    slug: string;
  };
  profiles?: {
    display_name: string;
    role: string;
  };
}

const SPORT_CATEGORY_MAPPING: Record<string, string> = {
  'calcio': 'calcio',
  'tennis': 'tennis', 
  'f1': 'formula-1',
  'basket': 'basket',
  'nfl': 'nfl'
};

export const useSportPosts = (sportSlug: string) => {
  const categorySlug = SPORT_CATEGORY_MAPPING[sportSlug] || sportSlug;
  
  return useQuery({
    queryKey: ['sport-posts', categorySlug],
    queryFn: async () => {
      // First get category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching category:', categoryError);
        return [];
      }

      // Then get posts for that category
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories!posts_category_id_fkey(name, slug),
          profiles!posts_author_id_fkey(display_name, role)
        `)
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sport posts:', error);
        throw new Error(`Errore nel caricamento degli articoli: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

// Hook per articoli in evidenza di uno sport specifico
export const useFeaturedSportPosts = (sportSlug: string, limit: number = 3) => {
  const categorySlug = SPORT_CATEGORY_MAPPING[sportSlug] || sportSlug;
  
  return useQuery({
    queryKey: ['featured-sport-posts', categorySlug, limit],
    queryFn: async () => {
      // First get category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching category:', categoryError);
        return [];
      }

      // Then get hero/featured posts for that category
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories!posts_category_id_fkey(name, slug),
          profiles!posts_author_id_fkey(display_name, role)
        `)
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .eq('is_hero', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured sport posts:', error);
        throw new Error(`Errore nel caricamento degli articoli in evidenza: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for featured content
    retry: 3,
  });
};

// Transform function per convertire i dati Supabase nel formato atteso dai componenti
export const transformPostForCard = (post: SportPost) => {
  const coverImage = post.cover_images 
    ? (typeof post.cover_images === 'string' ? post.cover_images : (post.cover_images as any)?.url || '')
    : '';
    
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    imageUrl: coverImage,
    category: post.categories?.name || 'Sport',
    publishedAt: post.published_at || post.created_at,
    timeAgo: formatTimeAgo(post.published_at || post.created_at),
    author: post.profiles?.display_name || 'Autore Sconosciuto',
    readTime: calculateReadTime(post.content),
    likes: 0, // Calcolato da query separata
    comments: 0, // Calcolato da query separata  
    views: 0, // Calcolato da query separata
    featured: post.is_hero || false,
    trending: false, // Può essere calcolato in base agli engagement
    article: post
  };
};

// Utility functions
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ora';
  if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h fa`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}g fa`;
  
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short'
  });
};

const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
};
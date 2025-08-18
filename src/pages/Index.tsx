import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ArticleCard } from "@/components/ArticleCard";
import { HorizontalArticleCard } from "@/components/HorizontalArticleCard";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { SortingControls } from "@/components/SortingControls";
import { SportFilters } from "@/components/SportFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Filter } from "lucide-react";
import { Icon } from "@/components/Icon";
import { supabase } from "@/integrations/supabase/client";
import { useGSAPAnimations } from "@/hooks/use-gsap-animations";
import { useCardAnimations } from "@/hooks/use-card-animations";
import { useInteractiveAnimations } from "@/hooks/use-interactive-animations";
import { useLiquidAnimation } from "@/hooks/use-liquid-animation";
import { getTimeAgo } from "@/utils/dateUtils";
import { getCoverImageFromPost } from "@/utils/getCoverImageFromPost";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isValidUUID } from "@/utils/uuid-validator";

const Index = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true); // Dark mode as default
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [selectedSport, setSelectedSport] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [period, setPeriod] = useState("all");
  const [visibleArticles, setVisibleArticles] = useState(6);
  const [posts, setPosts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const { pageRef } = useGSAPAnimations();
  const { animateCardHover } = useCardAnimations();
  const { animateIconClick, animateCounter } = useInteractiveAnimations();
  useLiquidAnimation();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Set dark mode as default on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Fetch posts and hero with real filters/sorting
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPosts(true);
        // Hero posts for carousel - with fallback to recent posts
        let { data: heroData } = await supabase
          .from('posts')
          .select(`
            id, title, excerpt, content, cover_images, featured_image_url, 
            published_at, created_at, author_id, category_id, is_hero,
            categories:category_id (name),
            profiles:author_id (username, display_name)
          `)
          .eq('is_hero', true)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5) as { data: any[] | null };

        // If no hero posts, fallback to 3 most recent posts
        if (!heroData || heroData.length === 0) {
          console.log('🦸 No hero posts found, using recent posts fallback');
          const { data: recentData } = await supabase
            .from('posts')
            .select(`
              id, title, excerpt, content, cover_images, featured_image_url, 
              published_at, created_at, author_id, category_id, is_hero,
              categories:category_id (name),
              profiles:author_id (username, display_name)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(3) as { data: any[] | null };
          heroData = recentData;
        } else {
          console.log('🦸 Found hero posts:', heroData.length);
        }

        // Build base posts query with improved ordering
        let query = supabase
          .from('posts')
          .select(`
            id, title, excerpt, content, cover_images, featured_image_url, 
            published_at, created_at, author_id, category_id, is_hero,
            categories:category_id (name),
            profiles:author_id (username, display_name)
          `)
          .eq('status', 'published');

        // Period filter
        const now = new Date();
        let start: Date | null = null;
        switch (period) {
          case 'today': start = new Date(now); start.setHours(0,0,0,0); break;
          case 'week': start = new Date(now); start.setDate(now.getDate() - 7); break;
          case 'month': start = new Date(now); start.setMonth(now.getMonth() - 1); break;
          case 'year': start = new Date(now); start.setFullYear(now.getFullYear() - 1); break;
          default: start = null;
        }
        // For specific periods, add date filter
        if (start && period !== 'all') {
          query = query.gte('published_at', start.toISOString());
        }

        // Fetch pool to sort/filter client-side - use created_at for reliable ordering
        const { data: postsData } = await query
          .order('created_at', { ascending: false })
          .limit(visibleArticles + 90) as { data: any[] | null };

        let list = postsData || [];

        // Allow hero posts to appear in grid for better visibility - no exclusion

        // Sport filter by category name
        if (selectedSport !== 'all') {
          const sportName = selectedSport.toUpperCase() === 'F1' ? 'F1' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1);
          list = list.filter(p => (p as any)?.categories?.name?.toLowerCase() === sportName.toLowerCase());
        }

        // Fetch metrics for popularity/comments/trending
        if (list.length > 0 && (sortBy === 'popular' || sortBy === 'comments' || sortBy === 'trending')) {
          const ids = list.map((p: any) => p.id).filter(id => id && isValidUUID(id));
          if (ids.length > 0) {
            const { data: metrics } = await (supabase as any).rpc('get_post_metrics', { post_ids: ids });
            const metricsArr = Array.isArray(metrics) ? metrics : [];
            const map = new Map<string, { like_count: number; comment_count: number }>();
            metricsArr.forEach((m: any) => map.set(m.post_id, { like_count: Number(m.like_count) || 0, comment_count: Number(m.comment_count) || 0 }));
            list = list.map((p: any) => ({ ...p, _metrics: map.get(p.id) || { like_count: 0, comment_count: 0 } }));
          } else {
            // No valid UUIDs found, set empty metrics
            list = list.map((p: any) => ({ ...p, _metrics: { like_count: 0, comment_count: 0 } }));
          }

          const trendScore = (p: any) => {
            const likes = p._metrics.like_count;
            const comments = p._metrics.comment_count;
            const hours = Math.max(1, (Date.now() - new Date(p.published_at || p.created_at).getTime()) / 36e5);
            return (likes * 2 + comments) / Math.pow(hours, 0.5);
          };

          if (sortBy === 'popular') {
            list.sort((a: any, b: any) => (b._metrics.like_count + b._metrics.comment_count) - (a._metrics.like_count + a._metrics.comment_count));
          } else if (sortBy === 'comments') {
            list.sort((a: any, b: any) => b._metrics.comment_count - a._metrics.comment_count);
          } else if (sortBy === 'trending') {
            list.sort((a: any, b: any) => trendScore(b) - trendScore(a));
          }
        } else {
          // Default: most recent using COALESCE logic - prioritize published_at if available
          list.sort((a: any, b: any) => {
            const dateA = new Date(a.published_at || a.created_at).getTime();
            const dateB = new Date(b.published_at || b.created_at).getTime();
            return dateB - dateA;
          });
        }

        if (import.meta.env.DEV) {
          console.log(`📊 Filtered posts for period "${period}":`, {
            total: list.length,
            sport: selectedSport,
            sortBy,
            sample: list.slice(0, 3).map(p => ({ title: p.title, published_at: p.published_at, created_at: p.created_at }))
          });
        }

        setPosts(list);
        
        // Map hero articles for HeroSection using getCoverImageFromPost
        const mappedHeroArticles = (heroData || []).map((post: any) => {
          return {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || '',
            imageUrl: getCoverImageFromPost(post),
            category: post.categories?.name || 'News',
          };
        });
        setFeatured(mappedHeroArticles);
      } catch (e) {
        console.error('Error fetching posts', e);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchData();
  }, [selectedSport, sortBy, period, visibleArticles]);

  const categories = [
    { name: "Tutti", count: posts.length },
  ];

  const filteredArticles = posts;

  // Animate trending counter on load
  useEffect(() => {
    const counterElement = document.getElementById('trending-counter');
    if (counterElement && animateCounter) {
      animateCounter(counterElement, 24, '%');
    }
  }, [animateCounter]);

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles;

  return (
    <ErrorBoundary>
      <div ref={pageRef} className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        {/* SEO */}
        <TitleAndMeta />
      
      {/* Hero Section */}
      <div className="hero-section">
        <HeroSection heroArticles={featured} />
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 xl:gap-12">
          <main className="flex-1 min-w-0">
            {/* Trending Section */}
        <section className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <Icon name="fire" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold">Trending Now</h2>
              </div>
              <Badge className="bg-gradient-primary text-white animate-scale-in text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span id="trending-counter">+2.4</span>% oggi
              </Badge>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <SportFilters
              selectedSport={selectedSport}
              onSportChange={setSelectedSport}
            />

            {/* Advanced Sorting Controls */}
            <SortingControls 
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              period={period}
              categories={categories}
              onCategoryChange={setSelectedCategory}
              onSortChange={setSortBy}
              onPeriodChange={setPeriod}
            />
          </div>

          {/* Featured Article - Full Width */}
          {featuredArticle && (
            <div className="mb-8 article-card">
              <ArticleCard
                {...mapPostToCard(featuredArticle)}
                featured={true}
                className="w-full"
                onClick={() => navigate(`/post/${featuredArticle.id}`)}
              />
            </div>
          )}

          {/* Regular Articles Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {regularArticles.slice(0, Math.max(0, visibleArticles - 1)).map((article: any) => (
              <div key={article.id} className="article-card h-full">
                <ArticleCard
                  {...mapPostToCard(article)}
                  className="h-full"
                  onClick={() => navigate(`/post/${article.id}`)}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleArticles < (regularArticles.length + 1) && (
            <div className="text-center mt-6 sm:mt-8">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-colors px-6 sm:px-8 w-full sm:w-auto"
                onClick={() => setVisibleArticles(prev => prev + 6)}
              >
                Carica Altri Articoli
              </Button>
            </div>
          )}
        </section>
          </main>
          
          {/* Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block sidebar w-80 xl:w-96 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

function mapPostToCard(post: any) {
  // Use the utility function for consistent image handling
  const image = getCoverImageFromPost(post);
  
  const date = post.published_at || post.created_at;
  
  // Get real author name from profiles join
  const authorName = post.profiles?.display_name || post.profiles?.username || 'Redazione';
  
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    imageUrl: image,
    category: post.categories?.name || 'News',
    publishedAt: new Date(date).toLocaleDateString('it-IT'),
    timeAgo: getTimeAgo(date),
    author: authorName,
    likes: (post as any)?._metrics?.like_count || 0,
    comments: (post as any)?._metrics?.comment_count || 0,
  };
}

function TitleAndMeta() {
  useEffect(() => {
    document.title = 'Ultime notizie sport | Malati dello Sport';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Homepage con articoli sportivi reali dal database: calcio, tennis, F1, NBA e NFL.');
  }, []);
  return null;
}

export default Index;

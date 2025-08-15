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
import { useLiquidAnimation } from "@/hooks/use-liquid-animation";
import { getTimeAgo } from "@/utils/dateUtils";

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
  const { pageRef, animateCardHover, animateIconClick, animateCounter } = useGSAPAnimations();
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
        // Hero posts for carousel
        const { data: heroData } = await supabase
          .from('posts')
          .select(`
            id, title, excerpt, content, cover_images, featured_image_url, 
            published_at, created_at, author_id, category_id, is_hero,
            categories:category_id (name),
            profiles:author_id (username, display_name)
          `)
          .eq('is_hero', true)
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(5) as { data: any[] | null };

        // Build base posts query
        let query = supabase
          .from('posts')
          .select(`
            id, title, excerpt, content, cover_images, featured_image_url, 
            published_at, created_at, author_id, category_id, is_hero,
            categories:category_id (name),
            profiles:author_id (username, display_name)
          `)
          .not('published_at', 'is', null);

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
        if (start) query = query.gte('published_at', start.toISOString());

        // Fetch pool to sort/filter client-side
        const { data: postsData } = await query
          .order('published_at', { ascending: false })
          .limit(visibleArticles + 24) as { data: any[] | null };

        let list = postsData || [];

        // Exclude hero articles from trending section to avoid duplicates
        const heroIds = new Set((heroData || []).map((h: any) => h.id));
        list = list.filter((p: any) => !heroIds.has(p.id));

        // Sport filter by category name
        if (selectedSport !== 'all') {
          const sportName = selectedSport.toUpperCase() === 'F1' ? 'F1' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1);
          list = list.filter(p => (p as any)?.categories?.name?.toLowerCase() === sportName.toLowerCase());
        }

        // Fetch metrics for popularity/comments/trending
        if (list.length > 0 && (sortBy === 'popular' || sortBy === 'comments' || sortBy === 'trending')) {
          const ids = list.map((p: any) => p.id);
          const { data: metrics } = await (supabase as any).rpc('get_post_metrics', { post_ids: ids });
          const metricsArr = Array.isArray(metrics) ? metrics : [];
          const map = new Map<string, { like_count: number; comment_count: number }>();
          metricsArr.forEach((m: any) => map.set(m.post_id, { like_count: Number(m.like_count) || 0, comment_count: Number(m.comment_count) || 0 }));
          list = list.map((p: any) => ({ ...p, _metrics: map.get(p.id) || { like_count: 0, comment_count: 0 } }));

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
          // Default: most recent
          list.sort((a: any, b: any) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
        }

        setPosts(list);
        
        // Map hero articles for HeroSection
        const mappedHeroArticles = (heroData || []).map((post: any) => {
          let image = '/assets/images/hero-juventus-champions.jpg';
          if (Array.isArray(post.cover_images) && post.cover_images.length > 0) {
            const coverImg = post.cover_images[0];
            image = typeof coverImg === 'string' ? coverImg : coverImg?.url || image;
          } else if (post.featured_image_url) {
            image = post.featured_image_url;
          }
          
          return {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || '',
            imageUrl: image,
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
    <div ref={pageRef} className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      {/* SEO */}
      <TitleAndMeta />
      
      {/* Hero Section */}
      <div className="hero-section">
        <HeroSection heroArticles={featured} />
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-12">
          <main className="flex-1 max-w-6xl">
            {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Icon name="fire" className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Trending Now</h2>
              </div>
              <Badge className="bg-gradient-primary text-white animate-scale-in">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span id="trending-counter">+2.4</span>% oggi
              </Badge>
            </div>
          </div>

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

          {/* Regular Articles Grid - Uniform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-colors px-8"
                onClick={() => setVisibleArticles(prev => prev + 6)}
              >
                Carica Altri Articoli
              </Button>
            </div>
          )}
        </section>
          </main>
          
          {/* Sidebar */}
          <div className="sidebar">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

function mapPostToCard(post: any) {
  // Handle cover image from either cover_images array or featured_image_url
  let image = '/assets/images/hero-juventus-champions.jpg'; // fallback
  
  if (Array.isArray(post.cover_images) && post.cover_images.length > 0) {
    // Select random cover image for variety
    const randomIndex = Math.floor(Math.random() * post.cover_images.length);
    const coverImg = post.cover_images[randomIndex];
    image = typeof coverImg === 'string' ? coverImg : coverImg?.url || image;
  } else if (post.featured_image_url) {
    image = post.featured_image_url;
  }
  
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

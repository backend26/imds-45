import { useState, useEffect } from "react";
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

const Index = () => {
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

  // Fetch posts and hero
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPosts(true);
        // Hero post
        const { data: heroData } = await supabase
          .from('posts')
          .select('id, title, excerpt, cover_images, featured_image_url, published_at, created_at, author_id, category_id, is_hero')
          .eq('is_hero', true)
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(1) as { data: any[] | null };
        setFeatured(heroData?.[0] || null);

        // Posts list
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, title, excerpt, cover_images, featured_image_url, published_at, created_at, author_id, category_id, is_hero')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(visibleArticles + 5) as { data: any[] | null };
        setPosts(postsData || []);
      } catch (e) {
        console.error('Error fetching posts', e);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchData();
  }, [selectedCategory, sortBy, period, visibleArticles]);

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

  const featuredArticle = featured || filteredArticles[0];
  const regularArticles = filteredArticles.filter(a => a?.id !== featuredArticle?.id);

  return (
    <div ref={pageRef} className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      {/* SEO */}
      <TitleAndMeta />
      
      {/* Hero Section */}
      <div className="hero-section">
        <HeroSection />
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
  const image = Array.isArray(post.cover_images) && post.cover_images.length > 0
    ? (post.cover_images[0]?.url || post.cover_images[0])
    : post.featured_image_url || '/assets/images/hero-juventus-champions.jpg';
  const date = post.published_at || post.created_at;
  return {
    title: post.title,
    excerpt: post.excerpt || '',
    imageUrl: image,
    category: 'News',
    publishedAt: new Date(date).toLocaleDateString('it-IT'),
    author: 'Redazione',
    readTime: '3 min',
    likes: 0,
    comments: 0,
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
